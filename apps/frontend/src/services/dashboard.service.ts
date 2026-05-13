import { api } from '@/lib/api';

export const dashboardService = {
  async getSummary() {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  async getFunnelMetrics() {
    const response = await api.get('/dashboard/funnel');
    return response.data;
  },

  async getHotLeads() {
    const response = await api.get('/dashboard/hot-leads');
    return response.data;
  },

  async getPendingActions() {
    const response = await api.get(
      '/dashboard/pending-actions',
    );

    return response.data;
  },

  async getLeadRecommendation(leadId: string) {
    const response = await api.get(
      `/ai/lead-summary/${leadId}`,
    );

    return response.data;
  },
};