import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
  ) {}

  async createEvent(createEventDto: CreateEventDto) {
    const leadExists = await this.prisma.lead.findUnique({
      where: {
        id: createEventDto.leadId,
      },
    });

    if (!leadExists) {
      throw new NotFoundException('Lead not found');
    }

    const event = await this.prisma.leadEvent.create({
      data: {
        leadId: createEventDto.leadId,
        eventType: createEventDto.eventType,
        metadata: createEventDto.metadata,
      },
    });

    await this.scoringService.calculateLeadScore(
      createEventDto.leadId,
    );

    return event;
  }

  async getLeadEvents(leadId: string) {
    return this.prisma.leadEvent.findMany({
      where: {
        leadId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}