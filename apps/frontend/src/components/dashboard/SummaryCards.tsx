interface Props {
  summary: {
    totalLeads: number;
    hotLeads: number;
    convertedLeads: number;
    pendingActions: number;
    verificationQueue?: number;
    approvalQueue?: number;
    pendingCallbacks?: number;
    riskAlerts?: number;
  };
}

export default function SummaryCards({
  summary,
}: Props) {
  const cards = [
    {
      title: 'Total Leads',
      value: summary.totalLeads,
      trend: '+12% from yesterday',
      tone: 'text-blue-700',
    },
    {
      title: 'Hot Leads',
      value: summary.hotLeads,
      trend: 'Advisor priority',
      tone: 'text-rose-700',
    },
    {
      title: 'Converted',
      value: summary.convertedLeads,
      trend: 'Manual conversion',
      tone: 'text-emerald-700',
    },
    {
      title: 'Verification Queue',
      value: summary.verificationQueue ?? summary.pendingActions,
      trend: `${summary.approvalQueue ?? 0} awaiting approval`,
      tone: 'text-amber-700',
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <h3 className="text-xs font-bold uppercase text-slate-500">
            {card.title}
          </h3>

          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-2xl font-bold leading-none text-slate-950">
              {card.value}
            </p>
            <p className={`text-xs font-bold ${card.tone}`}>
              {card.trend}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}
