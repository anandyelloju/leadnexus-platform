import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { BehavioralScoringService } from '../intelligence/behavioral-scoring.service';
import { RecommendationEngine } from '../intelligence/recommendation-engine';
import { RiskAnalysisService } from '../intelligence/risk-analysis.service';
import { LeadInsightsService } from './lead-insights.service';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [AiModule],
  controllers: [LeadsController],
  providers: [
    LeadsService,
    LeadInsightsService,
    BehavioralScoringService,
    RiskAnalysisService,
    RecommendationEngine,
  ],
})
export class LeadsModule {}
