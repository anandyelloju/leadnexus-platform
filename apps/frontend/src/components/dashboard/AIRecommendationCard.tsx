import { DashboardInsights } from '@/types/dashboard.types';

interface Props {
  insights?: DashboardInsights | null;
}

export default function AIRecommendationCard({
  insights,
}: Props) {
  const insightItems = insights?.insights?.length
    ? insights.insights
    : [
      'Portfolio intelligence is syncing',
      'Callback queue status is being evaluated',
      'Verification workload is being calculated',
      'SLA health is being monitored',
    ];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            AI Insights
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Next-best action engine
          </p>
        </div>
        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-bold uppercase text-amber-700">
          Priority
        </span>
      </div>

      <div className="grid gap-2">
        {insightItems.map((insight) => (
          <div key={insight} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <p className="text-xs font-semibold text-slate-700">{insight}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
        <p className="text-[11px] font-bold uppercase text-blue-700">
          Recommended Action
        </p>
        <p className="mt-1 text-sm font-bold text-slate-950">
          {insights?.topRecommendation || 'Maintain active nurturing and monitor new intent signals.'}
        </p>
      </div>
    </section>
  );
}
