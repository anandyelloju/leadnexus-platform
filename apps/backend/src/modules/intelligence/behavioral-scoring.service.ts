import { Injectable } from '@nestjs/common';

export interface IntelligenceEvent {
  eventType: string;
  createdAt: Date;
  metadata?: unknown;
}

export interface IntelligenceScore {
  intentScore?: number;
  eligibilityScore?: number;
  engagementScore?: number;
  riskScore?: number;
  finalScore?: number;
}

export interface IntelligenceAction {
  actionType: string;
  status: string;
  createdAt: Date;
}

export interface IntelligenceLead {
  id: string;
  salary?: number | null;
  loanAmount?: number | null;
  employmentType?: string | null;
  currentStage?: string;
  assignedTo?: string | null;
  createdAt: Date;
  updatedAt: Date;
  events?: IntelligenceEvent[];
  actions?: IntelligenceAction[];
  scores?: IntelligenceScore | null;
  verificationItems?: Array<{ completed: boolean; key?: string; label?: string }>;
}

@Injectable()
export class BehavioralScoringService {
  countEvents(lead: IntelligenceLead, eventType: string) {
    return (lead.events ?? []).filter((event) => event.eventType === eventType)
      .length;
  }

  hasEvent(lead: IntelligenceLead, eventType: string) {
    return this.countEvents(lead, eventType) > 0;
  }

  normalizeScore(score?: number | null) {
    if (!score) return 0;
    if (score > 100) return Math.min(100, Math.round(score / 4));
    return Math.max(0, Math.min(100, score));
  }

  getCallbackIntent(lead: IntelligenceLead): 'High' | 'Medium' | 'Low' {
    const emiUses = this.countEvents(lead, 'EMI_CALCULATOR_USED');
    const callbackRequests = this.countEvents(lead, 'CALLBACK_REQUESTED');
    const applicationSignals =
      this.countEvents(lead, 'FORM_STARTED') +
      this.countEvents(lead, 'DOCUMENT_UPLOADED');
    const intentScore = this.normalizeScore(lead.scores?.intentScore);

    if (
      callbackRequests > 0 &&
      (emiUses >= 2 || applicationSignals > 0 || intentScore >= 60)
    ) {
      return 'High';
    }

    if (callbackRequests > 0 || emiUses >= 2 || applicationSignals > 0) {
      return 'Medium';
    }

    return 'Low';
  }

  getConversionProbability(lead: IntelligenceLead) {
    const score = this.normalizeScore(lead.scores?.finalScore);
    const intent = this.getCallbackIntent(lead);
    const documentUploads = this.countEvents(lead, 'DOCUMENT_UPLOADED');
    const verificationProgress = this.getVerificationCompletion(lead);
    const onboardingSignals =
      this.countEvents(lead, 'FORM_STARTED') +
      this.countEvents(lead, 'SALARY_ENTERED') +
      this.countEvents(lead, 'OTP_VERIFIED');
    const emiUses = this.countEvents(lead, 'EMI_CALCULATOR_USED');
    const salarySignal = lead.salary
      ? lead.salary >= 75000
        ? 14
        : lead.salary >= 50000
          ? 9
          : 4
      : 0;
    const callbackSignal = intent === 'High' ? 14 : intent === 'Medium' ? 8 : 0;
    const documentSignal = Math.min(documentUploads * 8, 16);
    const verificationSignal = Math.round(verificationProgress * 14);
    const onboardingSignal = Math.min(onboardingSignals * 5, 18);
    const engagementSignal = Math.min(emiUses * 4, 12);

    return Math.max(
      18,
      Math.min(
        96,
        Math.round(
          score * 0.46 +
            salarySignal +
            callbackSignal +
            documentSignal +
            verificationSignal +
            onboardingSignal +
            engagementSignal,
        ),
      ),
    );
  }

  getIncomeLoanRatio(lead: IntelligenceLead) {
    if (!lead.salary || !lead.loanAmount) return null;
    return lead.loanAmount / (lead.salary * 12);
  }

  getVerificationCompletion(lead: IntelligenceLead) {
    const items = lead.verificationItems ?? [];

    if (items.length === 0) {
      return this.hasEvent(lead, 'DOCUMENT_UPLOADED') ? 0.35 : 0;
    }

    return items.filter((item) => item.completed).length / items.length;
  }
}
