import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

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
  ) {
    return this.eventsService.createEvent(
      createEventDto,
    );
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