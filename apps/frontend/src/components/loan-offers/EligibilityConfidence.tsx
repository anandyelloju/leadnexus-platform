import { formatCurrency } from '@/lib/financial';
import type { EligibilitySummary } from '@/lib/loan-recommendations';

const tierClassName: Record<EligibilitySummary['tier'], string> = {
  excellent: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  high: 'border-blue-200 bg-blue-50 text-blue-800',
  moderate: 'border-amber-200 bg-amber-50 text-amber-800',
  manual: 'border-slate-200 bg-slate-50 text-slate-700',
};

export function EligibilityConfidence({ eligibility }: { eligibility: EligibilitySummary }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Eligibility summary</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">{eligibility.label}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Personalized recommendations based on income, documents, lead score, and engagement signals.
          </p>
        </div>
        <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-sm font-bold ${tierClassName[eligibility.tier]}`}>
          {eligibility.status}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm font-bold text-slate-800">
          <span>Confidence</span>
          <span>{eligibility.score}%</span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Eligibility confidence"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={eligibility.score}
        >
          <div className="h-full rounded-full bg-blue-700" style={{ width: `${eligibility.score}%` }} />
        </div>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Pre-qualified range', formatCurrency(eligibility.preQualifiedAmount)],
          ['Requested amount', formatCurrency(eligibility.requestedAmount)],
          ['Affordability', `${eligibility.affordabilityRatio}% income EMI`],
          ['Documents', eligibility.documentStatus],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <dt className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-bold text-slate-950">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
