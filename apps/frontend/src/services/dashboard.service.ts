import { api } from '@/lib/api';

export const dashboardService = {
  async getSummary() {
    const response = await api.get('/dashboard/summary');
    return response.data.data;
  },

  async getFunnelMetrics() {
    const response = await api.get('/dashboard/funnel');
    return response.data.data;
  },

  async getHotLeads() {
    const response = await api.get('/dashboard/hot-leads');
    return response.data.data;
  },

  async getPendingActions() {
    const response = await api.get(
      '/dashboard/pending-actions',
    );

    return response.data.data;
  },

  async getInsights() {
    const response = await api.get('/dashboard/insights');

    return response.data.data;
  },
};
