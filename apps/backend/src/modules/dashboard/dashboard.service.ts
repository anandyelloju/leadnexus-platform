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
      LeadStage.HOT,
      LeadStage.APPLICATION_STARTED,
      LeadStage.DOCUMENTS_PENDING,
      LeadStage.UNDER_REVIEW,
      LeadStage.VERIFIED,
      LeadStage.APPROVED,
      LeadStage.CONVERTED,
      LeadStage.REJECTED,
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
          in: ['HOT', 'APPLICATION_STARTED', 'DOCUMENTS_PENDING'],
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
    const verificationQueue = await this.prisma.lead.count({
      where: {
        currentStage: {
          in: ['DOCUMENTS_PENDING', 'UNDER_REVIEW'],
        },
      },
    });
    const approvalQueue = await this.prisma.lead.count({
      where: {
        currentStage: 'VERIFIED',
      },
    });
    const rejectedLeads = await this.prisma.lead.count({
      where: {
        currentStage: 'REJECTED',
      },
    });
    const pendingCallbacks = await this.prisma.leadAction.count({
      where: {
        status: 'PENDING',
        actionType: {
          contains: 'CALLBACK',
        },
      },
    });
    const riskAlerts = await this.prisma.leadScore.count({
      where: {
        riskScore: {
          lte: -20,
        },
      },
    });

    return {
      totalLeads,
      hotLeads,
      convertedLeads,
      pendingActions,
      verificationQueue,
      approvalQueue,
      pendingCallbacks,
      riskAlerts,
      rejectedLeads,
    };
  }
}
