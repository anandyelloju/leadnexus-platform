import { Injectable } from '@nestjs/common';

import { AiService } from '../ai/ai.service';
import {
  BehavioralScoringService,
  IntelligenceLead,
} from '../intelligence/behavioral-scoring.service';
import { RecommendationEngine } from '../intelligence/recommendation-engine';
import { RiskAnalysisService } from '../intelligence/risk-analysis.service';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardIntelligenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly behavioralScoring: BehavioralScoringService,
    private readonly recommendationEngine: RecommendationEngine,
    private readonly riskAnalysis: RiskAnalysisService,
  ) {}

  async generateSummary() {
    const leads = (await this.prisma.lead.findMany({
      include: {
        events: true,
        scores: true,
        actions: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })) as IntelligenceLead[];

    const highIntentLeads = leads.filter(
      (lead) => this.behavioralScoring.getCallbackIntent(lead) === 'High',
    ).length;
    const pendingCallbacks = leads.filter((lead) =>
      this.hasPendingCallback(lead),
    ).length;
    const verificationQueue = leads.filter((lead) =>
      this.needsVerification(lead),
    ).length;
    const fraudRiskCount = leads.filter(
      (lead) => this.riskAnalysis.getRiskLevel(lead) !== 'Low',
    ).length;
    const slaBreaches = leads.filter((lead) => this.hasSlaBreach(lead)).length;
    const engagementTrend = this.getEmiEngagementTrend(leads);

    const summary = {
      highIntentLeads,
      pendingCallbacks,
      verificationQueue,
      fraudRiskCount,
      slaBreaches,
      engagementTrend,
      topRecommendation: '',
      insights: [] as string[],
    };

    summary.topRecommendation =
      this.recommendationEngine.getDashboardRecommendation(summary);
    summary.insights = this.buildInsights(summary);

    return this.aiService.generateDashboardInsights(summary);
  }

  private buildInsights(summary: {
    highIntentLeads: number;
    pendingCallbacks: number;
    verificationQueue: number;
    fraudRiskCount: number;
    slaBreaches: number;
    engagementTrend: number;
  }) {
    return [
      `${summary.highIntentLeads} leads show high callback intent`,
      `${summary.verificationQueue} applications pending verification`,
      `${summary.fraudRiskCount} fraud-risk profiles detected`,
      `EMI engagement ${summary.engagementTrend >= 0 ? 'increased' : 'decreased'} ${Math.abs(summary.engagementTrend)}% today`,
      `${summary.slaBreaches} leads nearing SLA breach`,
    ];
  }

  private hasPendingCallback(lead: IntelligenceLead) {
    const pendingCallbackAction = (lead.actions ?? []).some(
      (action) =>
        action.status === 'PENDING' &&
        action.actionType.toLowerCase().includes('callback'),
    );

    return (
      pendingCallbackAction ||
      (this.behavioralScoring.hasEvent(lead, 'CALLBACK_REQUESTED') &&
        !(lead.actions ?? []).some(
          (action) =>
            action.status === 'COMPLETED' &&
            action.actionType.toLowerCase().includes('callback'),
        ))
    );
  }

  private needsVerification(lead: IntelligenceLead) {
    const verificationAction = (lead.actions ?? []).some(
      (action) =>
        action.status === 'PENDING' &&
        action.actionType.toLowerCase().includes('verification'),
    );
    const applicationStage = [
      'APPLICATION_STARTED',
      'QUALIFIED',
      'HOT',
    ].includes(lead.currentStage ?? '');

    return (
      verificationAction ||
      (applicationStage &&
        !this.behavioralScoring.hasEvent(lead, 'DOCUMENT_UPLOADED'))
    );
  }

  private hasSlaBreach(lead: IntelligenceLead) {
    const now = Date.now();
    const callbackEvent = (lead.events ?? [])
      .filter((event) => event.eventType === 'CALLBACK_REQUESTED')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const pendingAction = (lead.actions ?? []).find(
      (action) => action.status === 'PENDING',
    );
    const highIntentAgeHours =
      (now - lead.updatedAt.getTime()) / (1000 * 60 * 60);

    if (
      callbackEvent &&
      now - callbackEvent.createdAt.getTime() > 4 * 60 * 60 * 1000 &&
      this.hasPendingCallback(lead)
    ) {
      return true;
    }

    if (
      pendingAction &&
      now - pendingAction.createdAt.getTime() > 24 * 60 * 60 * 1000
    ) {
      return true;
    }

    return (
      !lead.assignedTo &&
      this.behavioralScoring.getCallbackIntent(lead) === 'High' &&
      highIntentAgeHours > 8
    );
  }

  private getEmiEngagementTrend(leads: IntelligenceLead[]) {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const today = this.countEventsBetween(
      leads,
      'EMI_CALCULATOR_USED',
      startOfToday,
      now,
    );
    const yesterday = this.countEventsBetween(
      leads,
      'EMI_CALCULATOR_USED',
      startOfYesterday,
      startOfToday,
    );

    if (yesterday === 0) return today > 0 ? 100 : 0;

    return Math.round(((today - yesterday) / yesterday) * 100);
  }

  private countEventsBetween(
    leads: IntelligenceLead[],
    eventType: string,
    from: Date,
    to: Date,
  ) {
    return leads.reduce(
      (total, lead) =>
        total +
        (lead.events ?? []).filter(
          (event) =>
            event.eventType === eventType &&
            event.createdAt >= from &&
            event.createdAt < to,
        ).length,
      0,
    );
  }
}
