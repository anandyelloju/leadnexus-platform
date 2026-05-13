'use client';

import { useEffect, useState } from 'react';

import FunnelChart from '@/components/dashboard/FunnelChart';
import HotLeadsTable from '@/components/dashboard/HotLeadsTable';
import SummaryCards from '@/components/dashboard/SummaryCards';

import { dashboardService } from '@/services/dashboard.service';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);

  const [funnelMetrics, setFunnelMetrics] =
    useState([]);

  const [hotLeads, setHotLeads] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [
        summaryData,
        funnelData,
        hotLeadsData,
      ] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getFunnelMetrics(),
        dashboardService.getHotLeads(),
      ]);

      setSummary(summaryData);
      setFunnelMetrics(funnelData);
      setHotLeads(hotLeadsData);
    } catch (error) {
      console.error(error);
    }
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
      </div>
    </main>
  );
}