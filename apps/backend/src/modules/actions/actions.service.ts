import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ActionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllActions() {
    return this.prisma.leadAction.findMany({
      include: {
        lead: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getPendingActions() {
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
    });
  }

  async completeAction(actionId: string) {
    return this.prisma.leadAction.update({
      where: {
        id: actionId,
      },
      data: {
        status: 'COMPLETED',
      },
    });
  }
}