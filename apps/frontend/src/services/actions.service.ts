import { api } from '@/lib/api';

export const actionsService = {
    async getPendingActions() {
        const response = await api.get(
            '/actions/pending',
        );

        return response.data;
    },

    async completeAction(actionId: string) {
        const response = await api.patch(
            `/actions/${actionId}/complete`,
        );

        return response.data;
    },
};