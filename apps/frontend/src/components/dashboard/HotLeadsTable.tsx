interface Props {
  leads: any[];
}

export default function HotLeadsTable({
  leads,
}: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Hot Leads
      </h2>

      <table className="w-full text-sm text-slate-700">
        <thead>
          <tr className="border-b bg-slate-50 text-left text-slate-600">
            <th className="py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-600">Name</th>
            <th className="py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-600">Phone</th>
            <th className="py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-600">Stage</th>
            <th className="py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-600">Score</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="border-b last:border-b-0 hover:bg-slate-50"
            >
              <td className="py-3">{lead.name}</td>
              <td className="py-3">{lead.phone}</td>
              <td className="py-3">{lead.currentStage}</td>
              <td className="py-3">
                {lead.scores?.finalScore || 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}