import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getFunnelMetrics() {
    const stages = [
      'NEW',
      'ENGAGED',
      'INTERESTED',
      'QUALIFIED',
      'HOT',
      'APPLICATION_STARTED',
      'DROPPED',
      'CONVERTED',
    ];

    const metrics = await Promise.all(
      stages.map(async (stage) => {
        const count = await this.prisma.lead.count({
          where: {
            currentStage: stage as any,
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
    const count =
      await this.prisma.leadAction.count({
        where: {
          status: 'PENDING',
        },
      });

    return {
      pendingActions: count,
    };
  }

  async getDashboardSummary() {
    const totalLeads =
      await this.prisma.lead.count();

    const hotLeads =
      await this.prisma.lead.count({
        where: {
          currentStage: 'HOT',
        },
      });

    const convertedLeads =
      await this.prisma.lead.count({
        where: {
          currentStage: 'CONVERTED',
        },
      });

    const pendingActions =
      await this.prisma.leadAction.count({
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