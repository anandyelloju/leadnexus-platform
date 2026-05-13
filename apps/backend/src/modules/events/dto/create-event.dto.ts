import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

import { EventType } from '../enums/event-type.enum';

export class CreateEventDto {
  @IsString()
    leadId!: string;

  @IsEnum(EventType)
    eventType!: EventType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}