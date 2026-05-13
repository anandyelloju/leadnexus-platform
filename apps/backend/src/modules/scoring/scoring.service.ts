import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { EVENT_SCORE_MAP } from './constants/scoring-rules.constant';
import { getLeadStage } from './constants/lead-stage.constant';
import { WorkflowsService } from '../workflows/workflows.service';

@Injectable()
export class ScoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workflowsService: WorkflowsService,
  ) {}

  async processLeadScore(
    leadId: string,
    eventType: string,
  ) {
    const scoreImpact =
      EVENT_SCORE_MAP[eventType] || 0;

    const existingScore =
      await this.prisma.leadScore.findUnique({
        where: {
          leadId,
        },
      });

    let finalScore = scoreImpact;

    if (!existingScore) {
      await this.prisma.leadScore.create({
        data: {
          leadId,
          intentScore: scoreImpact,
          finalScore,
        },
      });
    } else {
      finalScore =
        existingScore.finalScore + scoreImpact;

      await this.prisma.leadScore.update({
        where: {
          leadId,
        },
        data: {
          intentScore:
            existingScore.intentScore + scoreImpact,
          finalScore,
        },
      });
    }

    const currentStage = getLeadStage(finalScore);

    await this.prisma.lead.update({
      where: {
        id: leadId,
      },
      data: {
        currentStage,
      },
    });

    await this.workflowsService.triggerLeadWorkflow(
        leadId,
        currentStage,
    );
    
    return {
      finalScore,
      currentStage,
    };
  }
}