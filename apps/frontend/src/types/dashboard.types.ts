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

export interface LeadScore {
  finalScore?: number;
}

export interface DashboardLead {
  id: string;
  name: string;
  phone: string;
  currentStage?: string;
  scores?: LeadScore;
}

export interface PendingDashboardAction {
  id: string;
  actionType: string;
  reason: string;
  lead?: {
    name: string;
  };
}
