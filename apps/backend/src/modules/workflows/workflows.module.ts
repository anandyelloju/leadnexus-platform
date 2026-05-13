import { Global, Module } from '@nestjs/common';

import { WorkflowsService } from './workflows.service';
import { AgentsModule } from '../agents/agents.module';

@Global()
@Module({
  imports: [AgentsModule],
  providers: [WorkflowsService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}