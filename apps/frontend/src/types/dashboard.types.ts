export interface DashboardSummary {
  totalLeads: number;
  hotLeads: number;
  convertedLeads: number;
  pendingActions: number;
}

export interface FunnelMetric {
  stage: string;
  count: number;
}