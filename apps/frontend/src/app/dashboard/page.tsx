'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import FunnelChart from '@/components/dashboard/FunnelChart';
import HotLeadsTable from '@/components/dashboard/HotLeadsTable';
import SummaryCards from '@/components/dashboard/SummaryCards';
import AIRecommendationCard from '@/components/dashboard/AIRecommendationCard';
import PendingActionsTable from '@/components/dashboard/PendingActionsTable';

import { dashboardService } from '@/services/dashboard.service';
import {
    DashboardLead,
    DashboardSummary,
    FunnelMetric,
    PendingDashboardAction,
} from '@/types/dashboard.types';

export default function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);

    const [funnelMetrics, setFunnelMetrics] = useState<FunnelMetric[]>([]);

    const [hotLeads, setHotLeads] = useState<DashboardLead[]>([]);

    const [recommendation, setRecommendation] = useState('');

    const [pendingActions, setPendingActions] = useState<PendingDashboardAction[]>([]);

    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');

        if (!isAdmin) {
            router.push('/admin/login');
            return;
        }

        loadDashboard();
    }, [router]);

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

            setSummary(summaryData as DashboardSummary);
            setFunnelMetrics(Array.isArray(funnelData) ? funnelData as FunnelMetric[] : []);
            setHotLeads(Array.isArray(hotLeadsData) ? hotLeadsData as DashboardLead[] : []);
            setPendingActions(Array.isArray(pendingActionsData) ? pendingActionsData as PendingDashboardAction[] : []);

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
        return (
            <main className="min-h-screen bg-slate-100 px-4 py-4 text-slate-900">
                <div className="mx-auto max-w-7xl rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm">
                    Loading operations dashboard...
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-[calc(100vh-57px)] bg-slate-100 px-4 py-3 text-slate-900 sm:px-5">
            <div className="mx-auto grid max-w-7xl gap-3 xl:max-h-[calc(100vh-81px)] xl:grid-rows-[auto_auto_minmax(0,1fr)]">
                <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-950">
                                Operations Dashboard
                            </h1>
                            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold uppercase text-emerald-700">
                                Live
                            </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                            Lead command center | Last updated just now
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <button type="button" className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100">
                            Today
                        </button>
                        <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200">
                            Hot Leads
                        </button>
                        <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200">
                            Pending Verification
                        </button>
                        <button type="button" className="rounded-md bg-slate-950 px-3 py-1.5 text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300">
                            Assign Lead
                        </button>
                    </div>
                </section>

                <SummaryCards summary={summary} />

                <section className="grid min-h-0 gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                    <div className="grid min-h-0 gap-3 lg:grid-rows-[auto_minmax(0,1fr)]">
                        <FunnelChart data={funnelMetrics} />
                        <HotLeadsTable leads={hotLeads} />
                    </div>

                    <div className="grid min-h-0 gap-3 lg:grid-rows-[auto_minmax(0,1fr)]">
                        <AIRecommendationCard recommendation={recommendation} lead={hotLeads[0]} />
                        <PendingActionsTable
                            actions={pendingActions}
                            onRefresh={loadDashboard}
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}
