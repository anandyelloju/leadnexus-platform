'use client';

import { use, useEffect, useState } from 'react';

import { leadsService } from '@/services/leads.service';

interface Props {
  params: Promise<{ id: string }>;
}

export default function LeadDetailsPage({
  params,
}: Props) {
  const { id } = use(params);
  const [lead, setLead] = useState<any>(null);

  useEffect(() => {
    async function loadLead() {
      const data = await leadsService.getLeadById(id);
      setLead(data);
    }

    if (!id) return;
    void loadLead();
  }, []);

  if (!lead) {
    return <div>Loading lead...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            {lead.name}
          </h1>

          <p className="mt-2 text-slate-600">
            {lead.phone}
          </p>

          <div className="mt-6 grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-500">
                Current Stage
              </p>

              <p className="font-semibold text-slate-800">
                {lead.currentStage}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Final Score
              </p>

              <p className="font-semibold">
                {lead.scores?.finalScore || 0}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Salary
              </p>

              <p className="font-semibold text-slate-800">
                ₹{lead.salary}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Loan Amount
              </p>

              <p className="font-semibold">
                ₹{lead.loanAmount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Event Timeline
          </h2>

          <div className="space-y-4">
            {lead.events.map((event: any) => (
              <div
                key={event.id}
                className="border-l-2 border-slate-300 bg-slate-50/50 px-4 py-3"
              >
                <p className="font-medium text-slate-800">
                  {event.eventType}
                </p>

                <p className="text-sm text-slate-500">
                  {new Date(
                    event.createdAt,
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Pending Actions
          </h2>

          <div className="space-y-4">
            {lead.actions.map((action: any) => (
              <div
                key={action.id}
                className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {action.actionType}
                  </p>

                  <p className="text-sm text-slate-500">
                    {action.reason}
                  </p>
                </div>

                <span className="rounded bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-800">
                  {action.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}