import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AiService {
  private client = new Groq({
    apiKey:
      process.env.GROQ_API_KEY,
  });

  constructor(private readonly prisma: PrismaService) {}

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
        ${lead.events
        .map((event) => `- ${event.eventType}`)
        .join('\n')}

        Pending Actions:
        ${lead.actions
        .map((action) => `- ${action.actionType}`)
        .join('\n')}

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
            completion.choices[0]?.message?.content || 'No recommendation generated',
            provider: 'Groq (Llama-3.3)',
        };
    } catch (error) {
      console.error('Groq AI Error:', error);
      return { recommendation: 'AI Summary temporarily unavailable.' };
    }
  }
}