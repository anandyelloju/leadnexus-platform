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

    async updateLeadStage(id: string, payload: { stage: string; actor?: string; reason?: string }) {
        const response = await api.patch(`/leads/${id}/stage`, payload);
        return response.data.data;
    },

    async updateVerificationItem(
        id: string,
        key: string,
        payload: { completed: boolean; completedBy?: string },
    ) {
        const response = await api.patch(`/leads/${id}/verification/${key}`, payload);
        return response.data.data;
    },

    async addUnderwritingNote(
        id: string,
        payload: { note: string; author?: string; noteType?: string },
    ) {
        const response = await api.post(`/leads/${id}/notes`, payload);
        return response.data.data;
    },
};
