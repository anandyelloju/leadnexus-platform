'use client';

import { useState } from 'react';
import { actionsService } from '@/services/actions.service';
import { PendingDashboardAction } from '@/types/dashboard.types';
import StatusChip from './StatusChip';

interface Props {
    actions: PendingDashboardAction[];
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
        <section className="min-h-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                    <h2 className="text-sm font-bold text-slate-950">
                        Pending Actions
                    </h2>
                    <p className="text-xs font-medium text-slate-500">
                        Queue health and next tasks
                    </p>
                </div>
                <StatusChip label={`${safeActions.length} Open`} tone={safeActions.length > 0 ? 'amber' : 'green'} />
            </div>

            <div className="max-h-[260px] space-y-2 overflow-auto p-3">
                {safeActions.length > 0 ? (
                    safeActions.slice(0, 5).map((action) => (
                        <div
                            key={action.id}
                            className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                        >
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <StatusChip label={action.actionType} tone="blue" />
                                    {action.lead && (
                                        <p className="truncate text-xs font-bold text-slate-900">{action.lead.name}</p>
                                    )}
                                </div>
                                <p className="mt-1 truncate text-xs font-medium text-slate-500">
                                    {action.reason}
                                </p>
                                <p className="sr-only">
                                    {action.actionType}
                                </p>
                            </div>

                            <button
                                onClick={() => completeAction(action.id)}
                                disabled={loadingId === action.id}
                                className="shrink-0 rounded-md bg-slate-950 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:bg-slate-400"
                            >
                                {loadingId === action.id ? 'Completing...' : 'Complete'}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center">
                        <p className="text-xs font-semibold text-slate-500">No pending actions for today.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
