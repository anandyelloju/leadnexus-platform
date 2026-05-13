interface Props {
  summary: {
    totalLeads: number;
    hotLeads: number;
    convertedLeads: number;
    pendingActions: number;
  };
}

export default function SummaryCards({
  summary,
}: Props) {
  const cards = [
    {
      title: 'Total Leads',
      value: summary.totalLeads,
    },
    {
      title: 'Hot Leads',
      value: summary.hotLeads,
    },
    {
      title: 'Converted',
      value: summary.convertedLeads,
    },
    {
      title: 'Pending Actions',
      value: summary.pendingActions,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h3 className="text-sm text-slate-500">
            {card.title}
          </h3>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}