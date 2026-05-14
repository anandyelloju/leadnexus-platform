'use client';

import { useEffect, useState } from 'react';

import FunnelChart from '@/components/dashboard/FunnelChart';
import HotLeadsTable from '@/components/dashboard/HotLeadsTable';
import SummaryCards from '@/components/dashboard/SummaryCards';
import AIRecommendationCard from '@/components/dashboard/AIRecommendationCard';
import PendingActionsTable from '@/components/dashboard/PendingActionsTable';

import { dashboardService } from '@/services/dashboard.service';

export default function DashboardPage() {
    const [summary, setSummary] = useState<any>(null);

    const [funnelMetrics, setFunnelMetrics] = useState<any[]>([]);

    const [hotLeads, setHotLeads] = useState<any[]>([]);

    const [recommendation, setRecommendation] = useState('');

    const [pendingActions, setPendingActions] = useState<any[]>([]);

    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            const [
                summaryData,
                funnelData,
                hotLeadsData,
                pendingActionsData,
            ] = await Promise.all([
                dashboardService.getSummary(),
                dashboardService.getFunnelMetrics(),
                dashboardService.getHotLeads(),
                dashboardService.getPendingActions(),
            ]);

            setSummary(summaryData);
            setFunnelMetrics(Array.isArray(funnelData) ? funnelData : []);
            setHotLeads(Array.isArray(hotLeadsData) ? hotLeadsData : []);
            setPendingActions(Array.isArray(pendingActionsData) ? pendingActionsData : []);

            if (Array.isArray(hotLeadsData) && hotLeadsData.length > 0) {
                const aiResponse = await dashboardService.getLeadRecommendation(
                    hotLeadsData[0].id,
                );

                setRecommendation(aiResponse.recommendation || 'No recommendation available');
            }

        } catch (error) {
            console.error(error);
            setError('Failed to load dashboard');
        }
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="text-center">
                    <p className="text-xl font-semibold text-red-600">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded bg-slate-900 px-4 py-2 text-white"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!summary) {
        return <div>Loading dashboard...</div>;
    }

    return (
        <main className="min-h-screen bg-slate-100 text-slate-900 p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    LeadNexus Dashboard
                </h1>

                <SummaryCards summary={summary} />

                <FunnelChart data={funnelMetrics} />

                <HotLeadsTable leads={hotLeads} />

                {recommendation && (<AIRecommendationCard recommendation={recommendation} />)}

                <PendingActionsTable
                    actions={pendingActions}
                    onRefresh={loadDashboard}
                />
            </div>
        </main>
    );
}