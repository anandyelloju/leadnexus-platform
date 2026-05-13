import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { LeadsModule } from './modules/leads/leads.module';
import { EventsModule } from './modules/events/events.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    LeadsModule,
    EventsModule,
    ScoringModule,
    WorkflowsModule,
  ],
})
export class AppModule {}