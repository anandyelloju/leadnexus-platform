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
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Funnel Metrics
      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <BarChart data={data}>
          <XAxis dataKey="stage" tick={{ fill: '#475569' }} />
          <YAxis tick={{ fill: '#475569' }} />
          <Tooltip contentStyle={{ backgroundColor: '#f8fafc', borderColor: '#cbd5e1', color: '#0f172a' }} />
          <Bar dataKey="count" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}