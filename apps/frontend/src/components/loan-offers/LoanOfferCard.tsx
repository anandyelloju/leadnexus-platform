import { formatCurrency } from '@/lib/financial';
import type { LoanOffer } from '@/lib/loan-recommendations';

type LoanOfferCardProps = {
  offer: LoanOffer;
  isTopRecommendation: boolean;
  isCompared: boolean;
  isSaved: boolean;
  onCompare: () => void;
  onSave: () => void;
  onApply: () => void;
  onCallback: () => void;
};

export function LoanOfferCard({
  offer,
  isTopRecommendation,
  isCompared,
  isSaved,
  onCompare,
  onSave,
  onApply,
  onCallback,
}: LoanOfferCardProps) {
  return (
    <article
      className={[
        'rounded-2xl border bg-white p-5 shadow-sm transition focus-within:ring-4 focus-within:ring-blue-100 hover:-translate-y-0.5 hover:shadow-md sm:p-6',
        isTopRecommendation ? 'border-blue-300 shadow-blue-900/10' : 'border-slate-200 shadow-slate-200/70',
      ].join(' ')}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            {offer.badges.map((badge) => (
              <span
                key={badge}
                className={[
                  'rounded-full px-2.5 py-1 text-xs font-bold',
                  badge === 'Best Match' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-800',
                ].join(' ')}
              >
                {badge}
              </span>
            ))}
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-950">{offer.productName}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">{offer.category}</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-right">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">Approval</p>
          <p className="text-lg font-black text-emerald-950">{offer.approvalProbability}%</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{offer.headline}</p>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        {[
          ['Interest rate', `${offer.interestRateMin}% - ${offer.interestRateMax}%`],
          ['Eligible amount', formatCurrency(offer.eligibleAmount)],
          ['Estimated EMI', `${formatCurrency(offer.estimatedEmi)}/mo`],
          ['Processing', offer.processingSpeed],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">{label}</dt>
            <dd className="mt-1 text-sm font-bold text-slate-950">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Why it matches</p>
        <ul className="mt-3 space-y-2">
          {offer.rationale.map((reason) => (
            <li key={reason} className="flex gap-2 text-sm leading-5 text-slate-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-700" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-slate-500">Confidence</span>
          <span className="font-bold text-slate-950">{offer.confidenceLabel}</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${offer.approvalProbability}%` }} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onApply}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-blue-900/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
        >
          Apply Now
        </button>
        <button
          type="button"
          onClick={onCallback}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
        >
          Request Callback
        </button>
        <button
          type="button"
          onClick={onCompare}
          aria-pressed={isCompared}
          className={[
            'inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-blue-100',
            isCompared ? 'border-blue-700 bg-blue-50 text-blue-800' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
          ].join(' ')}
        >
          {isCompared ? 'Comparing' : 'Compare Offer'}
        </button>
        <button
          type="button"
          onClick={onSave}
          aria-pressed={isSaved}
          className={[
            'inline-flex min-h-11 items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-blue-100',
            isSaved ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
          ].join(' ')}
        >
          {isSaved ? 'Saved' : 'Save Offer'}
        </button>
      </div>
    </article>
  );
}
