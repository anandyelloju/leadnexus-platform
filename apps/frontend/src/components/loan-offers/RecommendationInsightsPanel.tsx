type RecommendationInsightsPanelProps = {
  insights: string[];
  nextBestActions: string[];
};

export function RecommendationInsightsPanel({ insights, nextBestActions }: RecommendationInsightsPanelProps) {
  return (
    <aside className="space-y-5">
      <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-900/5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">LN recommendation insights</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">Why these offers?</h2>
        <ul className="mt-5 space-y-3">
          {insights.map((insight) => (
            <li key={insight} className="flex gap-3 text-sm leading-6 text-slate-700">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-700" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Next best actions</p>
        <div className="mt-4 space-y-3">
          {nextBestActions.map((action, index) => (
            <div key={action} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-blue-700 ring-1 ring-blue-100">
                {index + 1}
              </span>
              <p className="text-sm font-semibold leading-5 text-slate-800">{action}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-bold text-emerald-950">Trust signals</p>
        <p className="mt-2 text-sm leading-6 text-emerald-900">
          Personalized recommendations use secure eligibility evaluation. Checking these offers has no impact on credit score.
        </p>
      </section>
    </aside>
  );
}
