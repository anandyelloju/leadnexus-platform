import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LeadStage } from '@prisma/client';

import { PrismaService } from '../../database/prisma.service';
import { VerificationService } from './verification.service';

const DECISION_STAGES = new Set<LeadStage>([
  LeadStage.APPROVED,
  LeadStage.CONVERTED,
  LeadStage.REJECTED,
]);

@Injectable()
export class LeadStageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: VerificationService,
  ) {}

  async updateStage(
    leadId: string,
    stage: LeadStage,
    actor = 'Operations User',
    reason?: string,
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        verificationItems: true,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    await this.validateTransition(lead.currentStage, stage, lead.verificationItems);

    const now = new Date();
    const data: Record<string, unknown> = {
      currentStage: stage,
    };

    if (stage === LeadStage.UNDER_REVIEW) {
      data.approvalStatus = 'IN_REVIEW';
    }

    if (stage === LeadStage.VERIFIED) {
      data.approvalStatus = 'VERIFIED';
    }

    if (stage === LeadStage.APPROVED) {
      data.approvalStatus = 'APPROVED';
      data.approvedAt = now;
      data.underwritingDecision = reason ?? 'Approved by operations review';
    }

    if (stage === LeadStage.CONVERTED) {
      data.approvalStatus = 'CONVERTED';
      data.convertedAt = now;
    }

    if (stage === LeadStage.REJECTED) {
      data.approvalStatus = 'REJECTED';
      data.rejectedAt = now;
      data.underwritingDecision = reason ?? 'Rejected by operations review';
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id: leadId },
      data,
      include: {
        scores: true,
        actions: true,
        events: {
          orderBy: { createdAt: 'desc' },
        },
        verificationItems: {
          orderBy: { createdAt: 'asc' },
        },
        underwritingNotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    await this.prisma.leadEvent.create({
      data: {
        leadId,
        eventType: this.getStageEventType(stage),
        metadata: {
          from: lead.currentStage,
          to: stage,
          actor,
          reason,
        },
      },
    });

    await this.createFollowUpAction(leadId, stage, actor);

    return updatedLead;
  }

  private async validateTransition(
    currentStage: LeadStage,
    nextStage: LeadStage,
    verificationItems: Array<{ completed: boolean }>,
  ) {
    if (currentStage === LeadStage.CONVERTED && nextStage !== LeadStage.CONVERTED) {
      throw new BadRequestException('Converted leads cannot be moved backward');
    }

    if (nextStage === LeadStage.CONVERTED && currentStage !== LeadStage.APPROVED) {
      throw new BadRequestException('Lead must be approved before conversion');
    }

    const completionRatio = this.verificationService.getCompletionRatio(verificationItems);

    if (
      (nextStage === LeadStage.VERIFIED || nextStage === LeadStage.APPROVED) &&
      completionRatio < 1
    ) {
      throw new BadRequestException(
        'Complete all verification checklist items before this stage',
      );
    }

    if (nextStage === LeadStage.APPROVED && currentStage !== LeadStage.VERIFIED) {
      throw new BadRequestException('Lead must be verified before approval');
    }

    if (DECISION_STAGES.has(currentStage) && nextStage === LeadStage.UNDER_REVIEW) {
      throw new BadRequestException('Decisioned leads cannot be returned to review');
    }
  }

  private async createFollowUpAction(
    leadId: string,
    stage: LeadStage,
    actor: string,
  ) {
    const actionMap: Partial<Record<LeadStage, { actionType: string; reason: string }>> = {
      [LeadStage.DOCUMENTS_PENDING]: {
        actionType: 'REQUEST_MORE_INFORMATION',
        reason: 'Customer documents or verification evidence are incomplete.',
      },
      [LeadStage.UNDER_REVIEW]: {
        actionType: 'COMPLETE_UNDERWRITING_REVIEW',
        reason: 'Operations review is required before verification.',
      },
      [LeadStage.VERIFIED]: {
        actionType: 'APPROVAL_DECISION_REQUIRED',
        reason: 'Verification complete; human approval decision required.',
      },
      [LeadStage.APPROVED]: {
        actionType: 'CONVERSION_FOLLOW_UP',
        reason: 'Lead approved; staff may convert after final customer confirmation.',
      },
    };

    const action = actionMap[stage];

    if (!action) return;

    await this.prisma.leadAction.create({
      data: {
        leadId,
        actionType: action.actionType,
        generatedBy: actor,
        reason: action.reason,
      },
    });
  }

  private getStageEventType(stage: LeadStage) {
    const events: Partial<Record<LeadStage, string>> = {
      [LeadStage.DOCUMENTS_PENDING]: 'MORE_INFORMATION_REQUESTED',
      [LeadStage.UNDER_REVIEW]: 'LEAD_UNDER_REVIEW',
      [LeadStage.VERIFIED]: 'LEAD_VERIFIED',
      [LeadStage.APPROVED]: 'LEAD_APPROVED',
      [LeadStage.CONVERTED]: 'LEAD_CONVERTED',
      [LeadStage.REJECTED]: 'LEAD_REJECTED',
    };

    return events[stage] ?? 'LEAD_STAGE_CHANGED';
  }
}
