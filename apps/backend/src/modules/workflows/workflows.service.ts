import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { AgentsService } from '../agents/agents.service';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(
    WorkflowsService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly agentsService: AgentsService,
  ) {}

  async triggerLeadWorkflow(
    leadId: string,
    currentStage: string,
  ) {
    if (
      currentStage === 'INTERESTED' ||
      currentStage === 'QUALIFIED' ||
      currentStage === 'HOT'
    ) {
      await this.createCallbackTask(
        leadId,
        currentStage,
      );
    }

    this.logger.log(
      `Workflow processed for lead ${leadId}`,
    );
  }

  private async createCallbackTask(
    leadId: string,
    currentStage: string,
  ) {
    const existingTask =
      await this.prisma.leadAction.findFirst({
        where: {
          leadId,
          actionType: 'CALLBACK',
          status: 'PENDING',
        },
      });

    if (existingTask) {
      return;
    }

    const assignedAgent =
      await this.agentsService.getAvailableAgent();

    await this.prisma.lead.update({
      where: {
        id: leadId,
      },
      data: {
        assignedTo: assignedAgent?.id,
      },
    });

    await this.prisma.leadAction.create({
      data: {
        leadId,
        actionType: 'CALLBACK',
        generatedBy: 'SYSTEM',
        reason: `Lead reached ${currentStage} stage`,
      },
    });

    if (assignedAgent) {
      await this.agentsService.incrementAgentWorkload(
        assignedAgent.id,
      );
    }
  }
}