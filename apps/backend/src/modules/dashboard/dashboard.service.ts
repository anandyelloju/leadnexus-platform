import { Injectable } from '@nestjs/common';
import { LeadStage } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getFunnelMetrics() {
    const stages: LeadStage[] = [
      LeadStage.NEW,
      LeadStage.ENGAGED,
      LeadStage.INTERESTED,
      LeadStage.QUALIFIED,
      LeadStage.HOT,
      LeadStage.APPLICATION_STARTED,
      LeadStage.DROPPED,
      LeadStage.CONVERTED,
    ];

    const metrics = await Promise.all(
      stages.map(async (stage) => {
        const count = await this.prisma.lead.count({
          where: {
            currentStage: stage,
          },
        });

        return {
          stage,
          count,
        };
      }),
    );

    return metrics;
  }

  async getHotLeads() {
    return this.prisma.lead.findMany({
      where: {
        currentStage: {
          in: ['HOT', 'QUALIFIED'],
        },
      },
      include: {
        scores: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }

  async getPendingActionsCount() {
    return this.prisma.leadAction.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        lead: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }

  async getDashboardSummary() {
    const totalLeads = await this.prisma.lead.count();

    const hotLeads = await this.prisma.lead.count({
      where: {
        currentStage: 'HOT',
      },
    });

    const convertedLeads = await this.prisma.lead.count({
      where: {
        currentStage: 'CONVERTED',
      },
    });

    const pendingActions = await this.prisma.leadAction.count({
      where: {
        status: 'PENDING',
      },
    });

    return {
      totalLeads,
      hotLeads,
      convertedLeads,
      pendingActions,
    };
  }
}
