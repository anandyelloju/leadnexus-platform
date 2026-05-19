'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Props {
  data: {
    stage: string;
    count: number;
  }[];
}

export default function FunnelChart({
  data,
}: Props) {
  const chartData = Array.isArray(data) ? data : [];
  const total = chartData.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            Funnel Metrics
          </h2>
          <p className="text-xs font-medium text-slate-500">
            {total} active stage events
          </p>
        </div>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold uppercase text-slate-600">
          Today
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs font-medium text-slate-500">
          Funnel metrics are unavailable at the moment.
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={170}
        >
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 12 }}>
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="stage" type="category" width={92} tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#0f172a' }} />
            <Bar dataKey="count" fill="#2563eb" radius={[0, 5, 5, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}
