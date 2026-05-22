import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadInsightsService } from './lead-insights.service';
import { LeadStageService } from './lead-stage.service';
import { UnderwritingService } from './underwriting.service';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';
import { VerificationService } from './verification.service';

@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadInsightsService: LeadInsightsService,
    private readonly leadStageService: LeadStageService,
    private readonly verificationService: VerificationService,
    private readonly underwritingService: UnderwritingService,
  ) {}

  @Post()
  async createLead(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.createLead(createLeadDto);
  }

  @Patch(':id')
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.updateLead(id, updateLeadDto);
  }

  @Get()
  async getAllLeads() {
    return this.leadsService.getAllLeads();
  }

  @Get('phone/search')
  async findLeadByPhone(@Query('phone') phone: string) {
    return this.leadsService.findLeadByPhone(phone);
  }

  @Get(':id/insights')
  async getLeadInsights(@Param('id') id: string) {
    return this.leadInsightsService.generateLeadInsights(id);
  }

  @Patch(':id/stage')
  async updateStage(
    @Param('id') id: string,
    @Body() body: { stage: any; actor?: string; reason?: string },
  ) {
    return this.leadStageService.updateStage(
      id,
      body.stage,
      body.actor,
      body.reason,
    );
  }

  @Patch(':id/verification/:key')
  async updateVerificationItem(
    @Param('id') id: string,
    @Param('key') key: string,
    @Body() body: { completed: boolean; completedBy?: string },
  ) {
    return this.verificationService.updateItem(
      id,
      key,
      body.completed,
      body.completedBy,
    );
  }

  @Post(':id/notes')
  async addUnderwritingNote(
    @Param('id') id: string,
    @Body() body: { note: string; author?: string; noteType?: string },
  ) {
    return this.underwritingService.addNote(
      id,
      body.note,
      body.author,
      body.noteType,
    );
  }

  @Get(':id')
  async getLeadById(@Param('id') id: string) {
    return this.leadsService.getLeadById(id);
  }
}
