'use client';

import { use, useEffect, useState } from 'react';

import LeadOperationsWorkspace, { Lead, LeadInsights } from '@/components/leads/LeadOperationsWorkspace';
import { leadsService } from '@/services/leads.service';

interface Props {
  params: Promise<{ id: string }>;
}

export default function LeadDetailsPage({
  params,
}: Props) {
  const { id } = use(params);
  const [lead, setLead] = useState<Lead | null>(null);
  const [insights, setInsights] = useState<LeadInsights | null>(null);
  const [error, setError] = useState('');

  async function loadLead() {
      try {
        const [data, insightData] = await Promise.all([
          leadsService.getLeadById(id),
          leadsService.getLeadInsights(id),
        ]);
        setLead(data as Lead);
        setInsights(insightData as LeadInsights);
      } catch (loadError) {
        console.error(loadError);
        setError('Failed to load lead intelligence workspace');
      }
  }

  useEffect(() => {
    if (!id) return;
    void loadLead();
  }, [id]);

  if (error) {
    return (
      <main className="min-h-[calc(100vh-57px)] bg-slate-100 px-4 py-4 text-slate-900">
        <div className="mx-auto max-w-7xl rounded-lg border border-rose-200 bg-white p-4 text-sm font-semibold text-rose-700 shadow-sm">
          {error}
        </div>
      </main>
    );
  }

  if (!lead) {
    return (
      <main className="min-h-[calc(100vh-57px)] bg-slate-100 px-4 py-4 text-slate-900">
        <div className="mx-auto max-w-7xl rounded-lg border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600 shadow-sm">
          Loading lead intelligence workspace...
        </div>
      </main>
    );
  }

  return <LeadOperationsWorkspace lead={lead} insights={insights} onRefresh={loadLead} />;
}
