import { formatCurrency } from '@/lib/financial';
import type { LoanOffer } from '@/lib/loan-recommendations';

export function OfferComparison({ offers }: { offers: LoanOffer[] }) {
  if (offers.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Compare offers</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">Select offers to compare</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Compare EMI, interest range, approval speed, repayment flexibility, and processing fees before applying.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Compare offers</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">Decision workspace</h2>
        </div>
        <p className="text-sm font-semibold text-slate-500">{offers.length} selected</p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[760px] w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              <th className="rounded-tl-xl border-y border-l border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-600">
                Offer
              </th>
              {offers.map((offer, index) => (
                <th
                  key={offer.id}
                  className={[
                    'border-y border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-950',
                    index === offers.length - 1 ? 'rounded-tr-xl border-r' : '',
                  ].join(' ')}
                >
                  {offer.productName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Estimated EMI', (offer: LoanOffer) => `${formatCurrency(offer.estimatedEmi)}/mo`],
              ['Interest rate', (offer: LoanOffer) => `${offer.interestRateMin}% - ${offer.interestRateMax}%`],
              ['Approval speed', (offer: LoanOffer) => offer.processingSpeed],
              ['Repayment flexibility', (offer: LoanOffer) => offer.repaymentFlexibility],
              ['Processing fees', (offer: LoanOffer) => offer.processingFee],
              ['Approval likelihood', (offer: LoanOffer) => `${offer.approvalProbability}%`],
            ].map(([label, getValue], rowIndex) => (
              <tr key={String(label)}>
                <th
                  className={[
                    'border-b border-l border-slate-200 px-4 py-3 font-bold text-slate-600',
                    rowIndex === 5 ? 'rounded-bl-xl' : '',
                  ].join(' ')}
                >
                  {String(label)}
                </th>
                {offers.map((offer, index) => (
                  <td
                    key={`${offer.id}-${label}`}
                    className={[
                      'border-b border-slate-200 px-4 py-3 font-semibold text-slate-900',
                      index === offers.length - 1 ? 'border-r' : '',
                      rowIndex === 5 && index === offers.length - 1 ? 'rounded-br-xl' : '',
                    ].join(' ')}
                  >
                    {(getValue as (offer: LoanOffer) => string)(offer)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
