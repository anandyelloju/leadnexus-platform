import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

export const DEFAULT_VERIFICATION_ITEMS = [
  { key: 'salary_verified', label: 'Salary Information Verified' },
  { key: 'documents_uploaded', label: 'Documents Uploaded' },
  { key: 'callback_completed', label: 'Callback Completed' },
  { key: 'eligibility_reviewed', label: 'Eligibility Reviewed' },
  { key: 'identity_verified', label: 'Identity Verified' },
];

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureChecklist(leadId: string) {
    await Promise.all(
      DEFAULT_VERIFICATION_ITEMS.map((item) =>
        this.prisma.leadVerificationItem.upsert({
          where: {
            leadId_key: {
              leadId,
              key: item.key,
            },
          },
          update: {},
          create: {
            leadId,
            key: item.key,
            label: item.label,
          },
        }),
      ),
    );

    return this.prisma.leadVerificationItem.findMany({
      where: { leadId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateItem(
    leadId: string,
    key: string,
    completed: boolean,
    completedBy = 'Operations User',
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    await this.ensureChecklist(leadId);

    const item = await this.prisma.leadVerificationItem.update({
      where: {
        leadId_key: {
          leadId,
          key,
        },
      },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
        completedBy: completed ? completedBy : null,
      },
    });

    await this.prisma.leadEvent.create({
      data: {
        leadId,
        eventType: completed
          ? 'VERIFICATION_ITEM_COMPLETED'
          : 'VERIFICATION_ITEM_REOPENED',
        metadata: {
          key,
          label: item.label,
          completedBy,
        },
      },
    });

    return item;
  }

  getCompletionRatio(items: Array<{ completed: boolean }>) {
    if (items.length === 0) return 0;

    return items.filter((item) => item.completed).length / items.length;
  }
}
