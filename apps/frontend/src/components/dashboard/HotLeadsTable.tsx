import Link from 'next/link';
import { DashboardLead } from '@/types/dashboard.types';
import StatusChip from './StatusChip';

interface Props {
  leads: DashboardLead[];
}

export default function HotLeadsTable({
  leads,
}: Props) {
  const leadRows = Array.isArray(leads) ? leads : [];

  return (
    <section className="min-h-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            Hot Leads
          </h2>
          <p className="text-xs font-medium text-slate-500">
            High-score leads requiring action
          </p>
        </div>
        <button type="button" className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200">
          Sort: Score
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-[620px] text-sm text-slate-700">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-2 text-left text-[11px] font-bold uppercase text-slate-500">Name</th>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase text-slate-500">Phone</th>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase text-slate-500">Stage</th>
              <th className="px-3 py-2 text-left text-[11px] font-bold uppercase text-slate-500">Score</th>
              <th className="px-4 py-2 text-right text-[11px] font-bold uppercase text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody>
            {leadRows.slice(0, 5).map((lead) => {
              const score = lead.scores?.finalScore || 0;
              const stage = lead.currentStage || 'CALLBACK_PENDING';

              return (
                <tr
                  key={lead.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-blue-50/40"
                >
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-bold text-blue-700 hover:underline focus:outline-none focus:ring-4 focus:ring-blue-100"
                    >
                      {lead.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-slate-600">{lead.phone}</td>
                  <td className="px-3 py-2.5">
                    <StatusChip label={stage} tone={stage === 'CONVERTED' ? 'green' : 'blue'} />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-950">{score}</span>
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(score, 400) / 4}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <Link href={`/leads/${lead.id}`} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200">
                        View
                      </Link>
                      <button type="button" className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100">
                        Call
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {leadRows.length === 0 && (
          <div className="border-t border-slate-200 px-4 py-4 text-center text-xs font-semibold text-slate-500">
            No hot leads in the current filter.
          </div>
        )}
      </div>
    </section>
  );
}
