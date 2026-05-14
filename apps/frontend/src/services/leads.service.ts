import { api } from '@/lib/api';

export const leadsService = {
    async getLeadById(id: string) {
        const response = await api.get(`/leads/${id}`);
        return response.data;
    },

    async createLead(payload: any) {
        const response = await api.post(
            '/leads',
            payload,
        );

        return response.data.data;
    },
};