import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('lead-summary/:leadId')
  async generateLeadSummary(
    @Param('leadId') leadId: string,
  ) {
    return this.aiService.generateLeadSummary(
      leadId,
    );
  }
}