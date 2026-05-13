import { Global, Module } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';

@Global()
@Module({
  providers: [WorkflowsService],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}