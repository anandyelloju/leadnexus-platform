'use client';

import { useState } from 'react';
import { actionsService } from '@/services/actions.service';

interface Props {
    actions: any[];
    onRefresh: () => void;
}

export default function PendingActionsTable({
    actions,
    onRefresh,
}: Props) {
    const [loadingId, setLoadingId] = useState('');

    const safeActions = Array.isArray(actions) ? actions : [];

    async function completeAction(id: string) {
        try {
            setLoadingId(id);
            await actionsService.completeAction(id);
            onRefresh();
        } finally {
            setLoadingId('');
        }
    }

    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Pending Actions
            </h2>

            <div className="space-y-4">
                {safeActions.length > 0 ? (
                    safeActions.map((action) => (
                        <div
                            key={action.id}
                            className="flex items-center justify-between rounded border p-4 hover:bg-slate-50 transition-colors"
                        >
                            <div>
                                <p className="font-medium text-slate-900">
                                    {action.actionType}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {action.reason}
                                </p>
                                {action.lead && (
                                    <p className="text-xs text-blue-600 mt-1">Lead: {action.lead.name}</p>
                                )}
                            </div>

                            <button
                                onClick={() => completeAction(action.id)}
                                disabled={loadingId === action.id}
                                className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-400 transition-colors"
                            >
                                {loadingId === action.id ? 'Completing...' : 'Complete'}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6">
                        <p className="text-sm text-slate-500">No pending actions for today.</p>
                    </div>
                )}
            </div>
        </div>
    );
}