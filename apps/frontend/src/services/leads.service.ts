import { api } from '@/lib/api';

export const leadsService = {
    async getLeadById(id: string) {
        const response = await api.get(`/leads/${id}`);
        return response.data.data;
    },

    async createLead(payload: any) {
        const response = await api.post('/leads', payload);
        return response.data.data;
    },

    async updateLead(id: string, payload: any) {
        const response = await api.patch(`/leads/${id}`, payload);
        return response.data.data;
    },

    async findLeadByPhone(phone: string) {
        const response = await api.get(`/leads/phone/search?phone=${phone}`,);
        return response.data.data;
    },
};