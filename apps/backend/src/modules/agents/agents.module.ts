import { Global, Module } from '@nestjs/common';

import { AgentsService } from './agents.service';

@Global()
@Module({
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}