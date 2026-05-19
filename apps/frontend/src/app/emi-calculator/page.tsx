'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { ONBOARDING_EVENTS, trackOnboardingEvent } from '@/lib/analytics';
import {
  createEmiEstimate,
  formatCurrency,
  formatNumber,
  serializeEstimateToSearchParams,
  type EmiEstimate,
} from '@/lib/financial';
import { saveEmiEstimate } from '@/lib/onboarding-estimate';

const loanAmountMarks = [100000, 500000, 1000000, 1500000, 2000000];
const tenureMarks = [6, 18, 36, 48, 60];

type SliderFieldProps = {
  id: string;
  label: string;
  helper: string;
  value: number;
  min: number;
  max: number;
  step: number;
  marks: number[];
  valueLabel: string;
  onChange: (value: number) => void;
};

function SliderField({
  id,
  label,
  helper,
  value,
  min,
  max,
  step,
  marks,
  valueLabel,
  onChange,
}: SliderFieldProps) {
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label htmlFor={id} className="text-sm font-semibold text-slate-950">
            {label}
          </label>
          <p className="mt-1 text-sm leading-5 text-slate-500">{helper}</p>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Selected</p>
          <p className="text-base font-bold text-blue-950">{valueLabel}</p>
        </div>
      </div>

      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="banking-slider mt-6 w-full"
        style={{ '--slider-progress': `${progress}%` } as CSSProperties}
      />

      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
        {marks.map((mark) => (
          <span key={mark}>{id === 'loanAmount' ? `₹${formatNumber(mark)}` : `${mark}m`}</span>
        ))}
      </div>
    </div>
  );
}

function JourneyProgress({ hasEstimate }: { hasEstimate: boolean }) {
  const steps = [
    { label: 'EMI Estimate Completed', state: hasEstimate ? 'complete' : 'current' },
    { label: 'Callback Consultation', state: hasEstimate ? 'current' : 'pending' },
    { label: 'Application Submission', state: 'pending' },
  ];

  return (
    <ol className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:grid-cols-3">
      {steps.map((step) => (
        <li key={step.label} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <span
            className={[
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs',
              step.state === 'complete'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : step.state === 'current'
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-slate-300 bg-white text-slate-400',
            ].join(' ')}
            aria-hidden="true"
          >
            {step.state === 'complete' ? '✓' : step.state === 'current' ? '●' : '○'}
          </span>
          {step.label}
        </li>
      ))}
    </ol>
  );
}

function getInsight(estimate: EmiEstimate | null, tenure: number) {
  if (!estimate) {
    return 'Calculate once to unlock repayment guidance and the next recommended onboarding step.';
  }

  if (tenure >= 42) {
    return 'A longer tenure is keeping the monthly EMI lighter, but the total interest burden is higher.';
  }

  if (estimate.estimatedEmi > 35000) {
    return 'This EMI is relatively high. An advisor can help compare a longer tenure or revised loan amount.';
  }

  return 'This selection balances monthly affordability with a controlled repayment period.';
}

export default function EmiCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [tenure, setTenure] = useState(24);
  const [estimate, setEstimate] = useState<EmiEstimate | null>(null);

  useEffect(() => {
    void trackOnboardingEvent(ONBOARDING_EVENTS.EMI_CALCULATOR_OPENED, {
      persistToServer: true,
      metadata: { page: '/emi-calculator' },
    });
  }, []);

  const callbackHref = useMemo(() => {
    if (!estimate) {
      return '/callback-request';
    }

    return `/callback-request?${serializeEstimateToSearchParams(estimate)}`;
  }, [estimate]);

  function handleAmountChange(value: number) {
    setLoanAmount(value);
    setEstimate(null);
    void trackOnboardingEvent(ONBOARDING_EVENTS.LOAN_AMOUNT_CHANGED, {
      metadata: { loanAmount: value },
    });
  }

  function handleTenureChange(value: number) {
    setTenure(value);
    setEstimate(null);
    void trackOnboardingEvent(ONBOARDING_EVENTS.TENURE_CHANGED, {
      metadata: { tenure: value },
    });
  }

  function handleCalculate() {
    const nextEstimate = createEmiEstimate(loanAmount, tenure);
    setEstimate(nextEstimate);
    saveEmiEstimate(nextEstimate);

    void trackOnboardingEvent(ONBOARDING_EVENTS.CALCULATE_EMI_CLICKED, {
      persistToServer: true,
      metadata: nextEstimate,
    });
    void trackOnboardingEvent(ONBOARDING_EVENTS.EMI_RESULT_VIEWED, {
      persistToServer: true,
      metadata: nextEstimate,
    });
  }

  function handleCallbackClick() {
    if (!estimate) {
      return;
    }

    void trackOnboardingEvent(ONBOARDING_EVENTS.CALLBACK_CTA_CLICKED, {
      persistToServer: true,
      metadata: estimate,
    });
  }

  function handleApplicationClick() {
    void trackOnboardingEvent(ONBOARDING_EVENTS.CONTINUE_APPLICATION_CLICKED, {
      persistToServer: true,
      serverEventType: 'FORM_STARTED',
      metadata: estimate ?? { loanAmount, tenure },
    });
  }

  const insight = getInsight(estimate, tenure);

  return (
    <main className="min-h-[calc(100dvh-73px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Loan repayment planning
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
              Estimate Your Monthly EMI
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Adjust your loan details to explore repayment options tailored to your financial goals.
            </p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-blue-800 shadow-sm shadow-slate-200/70">
            Advisor-ready estimate flow
          </div>
        </header>

        <JourneyProgress hasEstimate={Boolean(estimate)} />

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <SliderField
              id="loanAmount"
              label="Loan Amount"
              helper="Choose the principal amount you want to estimate."
              value={loanAmount}
              min={100000}
              max={2000000}
              step={50000}
              marks={loanAmountMarks}
              valueLabel={formatCurrency(loanAmount)}
              onChange={handleAmountChange}
            />

            <SliderField
              id="tenure"
              label="Tenure"
              helper="Select the repayment period that matches your monthly comfort."
              value={tenure}
              min={6}
              max={60}
              step={6}
              marks={tenureMarks}
              valueLabel={`${tenure} months`}
              onChange={handleTenureChange}
            />

            <button
              type="button"
              onClick={handleCalculate}
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-blue-700 px-6 text-sm font-semibold text-white shadow-sm shadow-blue-900/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              Calculate EMI
            </button>
          </div>

          <aside className="space-y-4">
            <section
              className={[
                'rounded-lg border bg-white p-5 shadow-sm shadow-slate-200/80 transition-all duration-300',
                estimate ? 'translate-y-0 border-blue-100 opacity-100' : 'border-slate-200 opacity-100',
              ].join(' ')}
              aria-live="polite"
            >
              {estimate ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                    Estimated Monthly EMI
                  </p>
                  <p className="mt-2 text-4xl font-semibold tracking-normal text-slate-950">
                    {formatCurrency(estimate.estimatedEmi)}
                    <span className="text-base font-semibold text-slate-500">/month</span>
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    This estimate may vary based on final eligibility and interest rates.
                  </p>

                  <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      ['Total repayment', formatCurrency(estimate.totalRepayment)],
                      ['Interest payable', formatCurrency(estimate.interestPayable)],
                      ['Selected tenure', `${estimate.tenure} months`],
                      ['Loan amount', formatCurrency(estimate.loanAmount)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {label}
                        </dt>
                        <dd className="mt-1 text-base font-bold text-slate-950">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : (
                <div className="flex min-h-64 flex-col justify-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estimate locked
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Calculate to reveal your repayment summary
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Your EMI, total repayment, and advisor-ready summary will appear here after you confirm the inputs.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Financial insight
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">Recommended next move</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{insight}</p>

              {estimate && (
                <div className="mt-5 grid gap-3">
                  <Link
                    href={callbackHref}
                    onClick={handleCallbackClick}
                    className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-900/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    Discuss This Estimate
                  </Link>
                  <Link
                    href="/apply"
                    onClick={handleApplicationClick}
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                  >
                    Continue Application
                  </Link>
                </div>
              )}
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
