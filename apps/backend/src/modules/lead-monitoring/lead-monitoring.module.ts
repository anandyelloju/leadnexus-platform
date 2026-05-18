import { Module } from '@nestjs/common';

import { LeadMonitoringService } from './lead-monitoring.service';

@Module({
  providers: [LeadMonitoringService],
})
export class LeadMonitoringModule { }