import { api } from '@/lib/api';

export const leadsService = {
    async getLeadById(id: string) {
        const response = await api.get(`/leads/${id}`);
        return response.data.data;
    },

    async getLeadInsights(id: string) {
        const response = await api.get(`/leads/${id}/insights`);
        return response.data.data;
    },

    async createLead(payload: Record<string, unknown>) {
        const response = await api.post('/leads', payload);
        return response.data.data;
    },

    async updateLead(id: string, payload: Record<string, unknown>) {
        const response = await api.patch(`/leads/${id}`, payload);
        return response.data.data;
    },
};
