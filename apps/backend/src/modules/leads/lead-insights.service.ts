import { Injectable, NotFoundException } from '@nestjs/common';

import { AiService } from '../ai/ai.service';
import {
  BehavioralScoringService,
  IntelligenceLead,
} from '../intelligence/behavioral-scoring.service';
import { RecommendationEngine } from '../intelligence/recommendation-engine';
import { RiskAnalysisService } from '../intelligence/risk-analysis.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class LeadInsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly behavioralScoring: BehavioralScoringService,
    private readonly recommendationEngine: RecommendationEngine,
    private readonly riskAnalysis: RiskAnalysisService,
  ) {}

  async generateLeadInsights(leadId: string) {
    const lead = (await this.prisma.lead.findUnique({
      where: {
        id: leadId,
      },
      include: {
        events: true,
        scores: true,
        actions: true,
      },
    })) as IntelligenceLead | null;

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const callbackIntent = this.behavioralScoring.getCallbackIntent(lead);
    const conversionProbability =
      this.behavioralScoring.getConversionProbability(lead);
    const riskLevel = this.riskAnalysis.getRiskLevel(lead);
    const warnings = this.riskAnalysis.getRiskWarnings(lead);
    const recommendation =
      this.recommendationEngine.getLeadRecommendation(lead);
    const insights = this.buildInsights(lead, callbackIntent);

    const ruleBasedInsights = {
      conversionProbability,
      riskLevel,
      callbackIntent,
      recommendation,
      insights,
      warnings,
      confidence: this.getConfidence(lead, conversionProbability),
      sla: this.getSlaState(lead),
    };

    return this.aiService.generateLeadInsights(ruleBasedInsights);
  }

  private buildInsights(lead: IntelligenceLead, callbackIntent: string) {
    const insights: string[] = [];
    const emiUses = this.behavioralScoring.countEvents(
      lead,
      'EMI_CALCULATOR_USED',
    );
    const documentsUploaded = this.behavioralScoring.countEvents(
      lead,
      'DOCUMENT_UPLOADED',
    );
    const ratio = this.behavioralScoring.getIncomeLoanRatio(lead);
    const score = this.behavioralScoring.normalizeScore(
      lead.scores?.finalScore,
    );

    insights.push(`${callbackIntent} callback intent detected`);

    if (score >= 70 || (lead.salary && documentsUploaded > 0)) {
      insights.push('Strong loan eligibility likelihood');
    } else {
      insights.push('Eligibility needs advisor validation');
    }

    if (emiUses >= 2) {
      insights.push('Repeated EMI interactions observed');
    } else if (emiUses === 1) {
      insights.push('Initial EMI planning signal captured');
    } else {
      insights.push('EMI intent signal is still developing');
    }

    if (documentsUploaded > 0) {
      insights.push('Document readiness supports faster verification');
    } else if (ratio && ratio > 0.65) {
      insights.push('Manual underwriting recommended');
    } else {
      insights.push('Document verification is pending');
    }

    return insights;
  }

  private getConfidence(lead: IntelligenceLead, conversionProbability: number) {
    const signalCount =
      (lead.events ?? []).length +
      (lead.salary ? 1 : 0) +
      (lead.loanAmount ? 1 : 0) +
      (lead.scores ? 1 : 0);

    return Math.max(
      42,
      Math.min(94, Math.round(conversionProbability * 0.72 + signalCount * 3)),
    );
  }

  private getSlaState(lead: IntelligenceLead) {
    const callbackEvent = (lead.events ?? [])
      .filter((event) => event.eventType === 'CALLBACK_REQUESTED')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const documentsUploaded = this.behavioralScoring.hasEvent(
      lead,
      'DOCUMENT_UPLOADED',
    );

    return {
      callback: callbackEvent
        ? this.getCallbackSlaLabel(callbackEvent.createdAt)
        : 'No request',
      callbackTone: callbackEvent
        ? this.isOlderThanHours(callbackEvent.createdAt, 4)
          ? 'red'
          : 'amber'
        : 'slate',
      verification: documentsUploaded ? 'Complete' : 'Pending',
      verificationTone: documentsUploaded ? 'green' : 'amber',
    };
  }

  private getCallbackSlaLabel(createdAt: Date) {
    const diffHours = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60),
    );

    if (diffHours >= 4) return `Overdue by ${diffHours - 3}h`;
    return `${Math.max(1, 4 - diffHours)}h remaining`;
  }

  private isOlderThanHours(date: Date, hours: number) {
    return Date.now() - date.getTime() > hours * 60 * 60 * 1000;
  }
}
