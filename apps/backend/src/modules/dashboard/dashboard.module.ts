import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';
import { BehavioralScoringService } from '../intelligence/behavioral-scoring.service';
import { RecommendationEngine } from '../intelligence/recommendation-engine';
import { RiskAnalysisService } from '../intelligence/risk-analysis.service';
import { DashboardController } from './dashboard.controller';
import { DashboardIntelligenceService } from './dashboard-intelligence.service';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [AiModule],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    DashboardIntelligenceService,
    BehavioralScoringService,
    RiskAnalysisService,
    RecommendationEngine,
  ],
})
export class DashboardModule {}
