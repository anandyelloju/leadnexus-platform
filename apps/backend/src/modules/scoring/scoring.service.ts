import { Injectable } from '@nestjs/common';

import { EventType } from '../events/enums/event-type.enum';
import { PrismaService } from '../../database/prisma.service';
import { getLeadStage } from './constants/lead-stage.constant';
import { EVENT_SCORE_RULES } from './constants/scoring-rules.constant';

@Injectable()
export class ScoringService {
  constructor(private readonly prisma: PrismaService) { }

  async calculateLeadScore(leadId: string) {
    const lead = await this.prisma.lead.findUnique({
      where: {
        id: leadId,
      },
      include: {
        events: true,
      },
    });

    if (!lead) {
      return;
    }

    let intentScore = 0;

    let eligibilityScore = 0;

    let engagementScore = 0;

    let riskScore = 0;

    for (const event of lead.events) {
      const rule = EVENT_SCORE_RULES[
        event.eventType as EventType
      ];

      if (!rule || rule.bucket === 'none') {
        continue;
      }

      switch (rule.bucket) {
        case 'intent':
          intentScore += rule.value;
          break;
        case 'eligibility':
          eligibilityScore += rule.value;
          break;
        case 'engagement':
          engagementScore += rule.value;
          break;
        case 'risk':
          riskScore += rule.value;
          break;
      }
    }

    if (
      lead.salary &&
      lead.salary >= 75000
    ) {
      eligibilityScore += 20;
    } else if (
      lead.salary &&
      lead.salary >= 50000
    ) {
      eligibilityScore += 10;
    }

    if (
      lead.loanAmount &&
      lead.salary
    ) {
      const yearlyIncome =
        lead.salary * 12;

      const loanRatio =
        lead.loanAmount / yearlyIncome;

      if (loanRatio <= 0.4) {
        eligibilityScore += 10;
      } else if (loanRatio <= 0.6) {
        eligibilityScore += 5;
      }
    }

    if (
      lead.employmentType ===
      'SALARIED'
    ) {
      eligibilityScore += 5;
    }

    const totalScore =
      intentScore +
      eligibilityScore +
      engagementScore +
      riskScore;

    const finalScore =
      totalScore < 0 ? 0 : totalScore;

    const currentStage = getLeadStage(finalScore);

    await this.prisma.$transaction([
      this.prisma.leadScore.upsert({
        where: {
          leadId,
        },
        update: {
          intentScore,
          eligibilityScore,
          engagementScore,
          riskScore,
          finalScore,
        },
        create: {
          leadId,
          intentScore,
          eligibilityScore,
          engagementScore,
          riskScore,
          finalScore,
        },
      }),
      this.prisma.lead.update({
        where: {
          id: leadId,
        },
        data: {
          currentStage,
        },
      }),
    ]);

    return {
      intentScore,
      eligibilityScore,
      engagementScore,
      riskScore,
      finalScore,
    };
  }
}