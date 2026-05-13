import { Module } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [WorkflowsModule],
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}