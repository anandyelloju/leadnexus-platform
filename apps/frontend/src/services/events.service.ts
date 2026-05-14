import { api } from '@/lib/api';

export const eventsService = {
    async createEvent(payload: any) {
        const response = await api.post(
            '/events',
            payload,
        );

        return response.data.data;
    },
};