import { Injectable } from '@nestjs/common';

import {
  BehavioralScoringService,
  IntelligenceLead,
} from './behavioral-scoring.service';
import { RiskAnalysisService } from './risk-analysis.service';

@Injectable()
export class RecommendationEngine {
  constructor(
    private readonly behavioralScoring: BehavioralScoringService,
    private readonly riskAnalysis: RiskAnalysisService,
  ) {}

  getLeadRecommendation(lead: IntelligenceLead) {
    const callbackIntent = this.behavioralScoring.getCallbackIntent(lead);
    const conversionProbability =
      this.behavioralScoring.getConversionProbability(lead);
    const riskLevel = this.riskAnalysis.getRiskLevel(lead);
    const documentsUploaded = this.behavioralScoring.countEvents(
      lead,
      'DOCUMENT_UPLOADED',
    );
    const verificationCompletion =
      this.behavioralScoring.getVerificationCompletion(lead);

    if (lead.currentStage === 'APPROVED') {
      return 'Convert Lead after final customer confirmation';
    }

    if (lead.currentStage === 'VERIFIED') {
      return 'Approve Lead';
    }

    if (lead.currentStage === 'UNDER_REVIEW' && verificationCompletion < 1) {
      return 'Complete verification checklist before decision';
    }

    if (riskLevel === 'High') {
      return 'Manual Review Required';
    }

    if (verificationCompletion === 1 && conversionProbability >= 70) {
      return 'Approve Lead';
    }

    if (callbackIntent === 'High' && conversionProbability >= 65) {
      return 'Assign advisor immediately';
    }

    if (documentsUploaded === 0 && conversionProbability >= 55) {
      return 'Request documents and schedule verification callback';
    }

    if (callbackIntent !== 'Low') {
      return 'Schedule callback and validate affordability';
    }

    return 'Nurture with verification follow-up';
  }

  getDashboardRecommendation(summary: {
    highIntentLeads: number;
    pendingCallbacks: number;
    verificationQueue: number;
    fraudRiskCount: number;
    slaBreaches: number;
  }) {
    if (summary.slaBreaches > 0) {
      return 'Clear SLA breaches before opening new advisor queues.';
    }

    if (summary.fraudRiskCount > 0) {
      return 'Route elevated-risk profiles to manual review.';
    }

    if (summary.pendingCallbacks > 0 || summary.highIntentLeads > 0) {
      return 'Assign advisors to high-intent callbacks.';
    }

    if (summary.verificationQueue > 0) {
      return 'Prioritize document verification to unlock conversions.';
    }

    return 'Maintain active nurturing and monitor new intent signals.';
  }
}
