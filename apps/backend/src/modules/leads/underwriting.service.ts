import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UnderwritingService {
  constructor(private readonly prisma: PrismaService) {}

  async addNote(
    leadId: string,
    note: string,
    author = 'Operations User',
    noteType = 'UNDERWRITING',
  ) {
    const lead = await this.prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const underwritingNote = await this.prisma.underwritingNote.create({
      data: {
        leadId,
        note,
        author,
        noteType,
      },
    });

    await this.prisma.leadEvent.create({
      data: {
        leadId,
        eventType: 'UNDERWRITING_NOTE_ADDED',
        metadata: {
          author,
          noteType,
        },
      },
    });

    return underwritingNote;
  }
}
