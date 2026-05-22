export interface DashboardSummary {
  totalLeads: number;
  hotLeads: number;
  convertedLeads: number;
  pendingActions: number;
  verificationQueue?: number;
  approvalQueue?: number;
  pendingCallbacks?: number;
  riskAlerts?: number;
  rejectedLeads?: number;
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

export interface DashboardInsights {
  highIntentLeads: number;
  pendingCallbacks: number;
  verificationQueue: number;
  fraudRiskCount: number;
  slaBreaches: number;
  engagementTrend: number;
  approvalQueue?: number;
  convertedToday?: number;
  topRecommendation: string;
  insights: string[];
  provider?: string;
  generatedBy?: 'ai' | 'rules';
}

export interface PendingDashboardAction {
  id: string;
  actionType: string;
  reason: string;
  lead?: {
    name: string;
  };
}
