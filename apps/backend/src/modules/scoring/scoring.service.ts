import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EVENT_SCORE_MAP } from './constants/scoring-rules.constant';

@Injectable()
export class ScoringService {
  constructor(private readonly prisma: PrismaService) {}

  async processLeadScore(leadId: string, eventType: string) {
    const scoreImpact = EVENT_SCORE_MAP[eventType] || 0;

    const existingScore = await this.prisma.leadScore.findUnique({
      where: {
        leadId,
      },
    });

    if (!existingScore) {
      return this.prisma.leadScore.create({
        data: {
          leadId,
          intentScore: scoreImpact,
          finalScore: scoreImpact,
        },
      });
    }

    const updatedIntent =
      existingScore.intentScore + scoreImpact;

    return this.prisma.leadScore.update({
      where: {
        leadId,
      },
      data: {
        intentScore: updatedIntent,
        finalScore: updatedIntent,
      },
    });
  }
}