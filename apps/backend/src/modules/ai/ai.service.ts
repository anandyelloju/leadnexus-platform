import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

import { PrismaService } from '../../database/prisma.service';

export interface DashboardAiInput {
  highIntentLeads: number;
  pendingCallbacks: number;
  verificationQueue: number;
  fraudRiskCount: number;
  slaBreaches: number;
  engagementTrend: number;
  approvalQueue?: number;
  convertedToday?: number;
  topRecommendation: string;
  insights: string[];
}

export interface DashboardAiOutput extends DashboardAiInput {
  provider: string;
  generatedBy: 'ai' | 'rules';
}

export interface LeadAiInput {
  conversionProbability: number;
  riskLevel: string;
  callbackIntent: string;
  recommendation: string;
  insights: string[];
  warnings: string[];
  confidence: number;
  sla: {
    callback: string;
    callbackTone: string;
    verification: string;
    verificationTone: string;
  };
}

export interface LeadAiOutput extends LeadAiInput {
  provider: string;
  generatedBy: 'ai' | 'rules';
}

@Injectable()
export class AiService {
  private client = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  constructor(private readonly prisma: PrismaService) {}

  async generateDashboardInsights(
    input: DashboardAiInput,
  ): Promise<DashboardAiOutput> {
    try {
      const content = await this.createJsonCompletion(`
You are LeadNexus AI, an enterprise lending operations intelligence assistant.

Use only the supplied portfolio signals. Do not invent lead names, counts, scores, approvals, or data.
Write concise management-oriented operational insight text.

Return strict JSON with this exact shape:
{
  "insights": ["string", "string", "string", "string", "string"],
  "topRecommendation": "string"
}

Rules:
- insights must be aggregated and system-wide.
- topRecommendation must answer: what should operations focus on today?
- Keep every insight under 90 characters.
- Do not approve loans.

Portfolio signals:
${JSON.stringify(input, null, 2)}
`);

      const parsed = this.parseJsonObject(content);
      const insights = this.getStringArray(parsed.insights, input.insights, 5);
      const topRecommendation = this.getStringValue(
        parsed.topRecommendation,
        input.topRecommendation,
      );

      return {
        ...input,
        insights,
        topRecommendation,
        provider: 'Groq (Llama-3.3)',
        generatedBy: 'ai',
      };
    } catch (error) {
      console.error('Dashboard AI insights error:', error);

      return {
        ...input,
        provider: 'Rule engine fallback',
        generatedBy: 'rules',
      };
    }
  }

  async generateLeadInsights(input: LeadAiInput): Promise<LeadAiOutput> {
    try {
      const content = await this.createJsonCompletion(`
You are LeadNexus AI, an advisor decision-support assistant for personal-loan leads.

Use only the supplied lead intelligence signals. Do not invent missing documents, approvals, names, or scores.
Write specific behavioral recommendations for this one lead.

Return strict JSON with this exact shape:
{
  "insights": ["string", "string", "string", "string"],
  "warnings": ["string"],
  "recommendation": "string",
  "confidence": 0
}

Rules:
- insights must be personalized and behavior-specific.
- recommendation must be one short next-best-action.
- confidence must be an integer from 0 to 100.
- warnings can be empty but must not hide supplied risk signals.
- Do not approve loans.

Lead intelligence signals:
${JSON.stringify(input, null, 2)}
`);

      const parsed = this.parseJsonObject(content);
      const insights = this.getStringArray(parsed.insights, input.insights, 4);
      const warnings = this.getStringArray(
        parsed.warnings,
        input.warnings,
        Math.max(1, input.warnings.length),
      );
      const recommendation = this.getStringValue(
        parsed.recommendation,
        input.recommendation,
      );
      const confidence = this.getNumberValue(
        parsed.confidence,
        input.confidence,
      );

      return {
        ...input,
        insights,
        warnings,
        recommendation,
        confidence,
        provider: 'Groq (Llama-3.3)',
        generatedBy: 'ai',
      };
    } catch (error) {
      console.error('Lead AI insights error:', error);

      return {
        ...input,
        provider: 'Rule engine fallback',
        generatedBy: 'rules',
      };
    }
  }

  async generateLeadSummary(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: {
        id: leadId,
      },
      include: {
        events: true,
        scores: true,
        actions: true,
      },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    const prompt = `
        You are an AI assistant helping bank sales teams.

        Analyze this personal loan lead.

        Lead Details:
            - Name: ${lead.name}
            - Salary: ${lead.salary}
            - Loan Amount: ${lead.loanAmount}
            - Current Stage: ${lead.currentStage}

        Scores:
        - Final Score: ${lead.scores?.finalScore || 0}
        
        Recent Events:
        ${lead.events.map((event) => `- ${event.eventType}`).join('\n')}

        Pending Actions:
        ${lead.actions.map((action) => `- ${action.actionType}`).join('\n')}

        Generate:
        1. Short lead summary
        2. Next best action
        3. Risk observation

        Keep response concise and operational.
        Do NOT approve loans.
    `;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile', // High-performance Groq model
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return {
        recommendation:
          completion.choices[0]?.message?.content ||
          'No recommendation generated',
        provider: 'Groq (Llama-3.3)',
      };
    } catch (error) {
      console.error('Groq AI Error:', error);
      return { recommendation: 'AI Summary temporarily unavailable.' };
    }
  }

  private async createJsonCompletion(prompt: string) {
    const completion = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('AI response was empty');
    }

    return content;
  }

  private parseJsonObject(content: string): Record<string, unknown> {
    const trimmed = content.trim();
    const jsonText = trimmed.startsWith('{')
      ? trimmed
      : trimmed.slice(trimmed.indexOf('{'), trimmed.lastIndexOf('}') + 1);

    if (!jsonText) {
      throw new Error('AI response did not contain JSON');
    }

    const parsed: unknown = JSON.parse(jsonText);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('AI response JSON was not an object');
    }

    return parsed as Record<string, unknown>;
  }

  private getStringArray(value: unknown, fallback: string[], maxItems: number) {
    if (!Array.isArray(value)) return fallback;

    const items = value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, maxItems);

    return items.length > 0 ? items : fallback;
  }

  private getStringValue(value: unknown, fallback: string) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  private getNumberValue(value: unknown, fallback: number) {
    if (typeof value !== 'number' || Number.isNaN(value)) return fallback;

    return Math.max(0, Math.min(100, Math.round(value)));
  }
}
