import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
  ) {}

  @Post()
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() req: Request,
  ) {
    // Accept sendBeacon/text/plain payloads which may not be parsed by body-parser
    let dto = createEventDto as any;
    try {
      if (!dto || !dto.leadId) {
        // try to parse raw body if available
        const raw = (req as any).rawBody || '';
        if (raw) {
          try {
            dto = JSON.parse(raw);
          } catch {}
        } else if (req.body && Object.keys(req.body).length > 0) {
          dto = req.body;
        }
      }
    } catch {}

    return this.eventsService.createEvent(dto);
  }

  @Get(':leadId')
  async getLeadEvents(
    @Param('leadId') leadId: string,
  ) {
    return this.eventsService.getLeadEvents(
      leadId,
    );
  }
}