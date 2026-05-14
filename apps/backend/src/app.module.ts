import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { LeadsModule } from './modules/leads/leads.module';
import { EventsModule } from './modules/events/events.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { AgentsModule } from './modules/agents/agents.module';
import { ActionsModule } from './modules/actions/actions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        PORT: Joi.number().required(),
        OPENAI_API_KEY: Joi.string().required(),
      }),
    }),
    PrismaModule,
    HealthModule,
    LeadsModule,
    EventsModule,
    ScoringModule,
    WorkflowsModule,
    AgentsModule,
    ActionsModule,
    DashboardModule,
    AiModule,
  ],
})
export class AppModule { }