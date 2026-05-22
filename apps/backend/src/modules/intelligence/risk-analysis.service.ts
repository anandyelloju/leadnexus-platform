import { Injectable } from '@nestjs/common';

import {
  BehavioralScoringService,
  IntelligenceLead,
} from './behavioral-scoring.service';

export type RiskLevel = 'Low' | 'Moderate' | 'High';

@Injectable()
export class RiskAnalysisService {
  constructor(private readonly behavioralScoring: BehavioralScoringService) {}

  getRiskLevel(lead: IntelligenceLead): RiskLevel {
    const warnings = this.getRiskWarnings(lead);
    const riskScore = this.behavioralScoring.normalizeScore(
      lead.scores?.riskScore,
    );

    if (warnings.length >= 2 || riskScore >= 70) return 'High';
    if (warnings.length === 1 || riskScore >= 35) return 'Moderate';

    return 'Low';
  }

  getRiskWarnings(lead: IntelligenceLead) {
    const warnings: string[] = [];
    const abandonedForms = this.behavioralScoring.countEvents(
      lead,
      'FORM_ABANDONED',
    );
    const otpSignals =
      this.behavioralScoring.countEvents(lead, 'OTP_FAILED') +
      this.behavioralScoring.countEvents(lead, 'OTP_ATTEMPTED');
    const ratio = this.behavioralScoring.getIncomeLoanRatio(lead);
    const salaryEvents = (lead.events ?? []).filter(
      (event) => event.eventType === 'SALARY_ENTERED',
    );
    const inconsistentSalary = salaryEvents.some((event) => {
      if (!event.metadata || typeof event.metadata !== 'object' || !lead.salary) {
        return false;
      }

      const salary = (event.metadata as Record<string, unknown>).salary;

      return typeof salary === 'number' && Math.abs(salary - lead.salary) > 5000;
    });

    if (abandonedForms > 0) {
      warnings.push('Application abandonment requires advisor review');
    }

    if (otpSignals >= 3) {
      warnings.push('Excessive OTP attempts detected');
    }

    if (ratio && ratio > 0.65) {
      warnings.push('Salary-to-loan ratio exceeds underwriting threshold');
    }

    if (inconsistentSalary) {
      warnings.push('Inconsistent salary information across application events');
    }

    if (
      this.behavioralScoring.countEvents(lead, 'LANDING_PAGE_VIEWED') >= 5 &&
      !this.behavioralScoring.hasEvent(lead, 'OTP_VERIFIED')
    ) {
      warnings.push('Repeated sessions without identity verification');
    }

    return warnings;
  }
}
