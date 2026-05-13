import { Controller, Get } from '@nestjs/common';

import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
  ) {}

  @Get('summary')
  async getDashboardSummary() {
    return this.dashboardService.getDashboardSummary();
  }

  @Get('funnel')
  async getFunnelMetrics() {
    return this.dashboardService.getFunnelMetrics();
  }

  @Get('hot-leads')
  async getHotLeads() {
    return this.dashboardService.getHotLeads();
  }

  @Get('pending-actions')
  async getPendingActionsCount() {
    return this.dashboardService.getPendingActionsCount();
  }
}