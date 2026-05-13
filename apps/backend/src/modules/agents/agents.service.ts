import { Injectable, OnModuleInit } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { SAMPLE_AGENTS } from './constants/sample-agents.constant';

@Injectable()
export class AgentsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const existingAgents =
      await this.prisma.salesAgent.count();

    if (existingAgents > 0) {
      return;
    }

    await this.prisma.salesAgent.createMany({
      data: SAMPLE_AGENTS,
    });
  }

  async getAvailableAgent() {
    return this.prisma.salesAgent.findFirst({
      orderBy: {
        workload: 'asc',
      },
    });
  }

  async incrementAgentWorkload(agentId: string) {
    return this.prisma.salesAgent.update({
      where: {
        id: agentId,
      },
      data: {
        workload: {
          increment: 1,
        },
      },
    });
  }
}