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

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Funnel Metrics
      </h2>

      {chartData.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          Funnel metrics are unavailable at the moment.
        </div>
      ) : (
        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <BarChart data={chartData}>
            <XAxis dataKey="stage" tick={{ fill: '#475569' }} />
            <YAxis tick={{ fill: '#475569' }} />
            <Tooltip contentStyle={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#0f172a' }} />
            <Bar dataKey="count" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}