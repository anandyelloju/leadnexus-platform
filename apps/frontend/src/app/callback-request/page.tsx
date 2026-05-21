'use client';

import type { ReactNode } from 'react';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import {
    formatCurrency,
    parseEstimateFromSearchParams,
    type EmiEstimate,
} from '@/lib/financial';
import { saveNewSubmissionReference } from '@/lib/submission-reference';
import { eventsService } from '@/services/events.service';

type IconName = 'phone' | 'shield' | 'support' | 'check' | 'clock' | 'file' | 'wallet';
type JourneyStepState = 'complete' | 'current' | 'pending';

type JourneyStep = {
    label: string;
    detail: string;
    state: JourneyStepState;
};

const iconPaths: Record<IconName, ReactNode> = {
    phone: (
        <path d="M7.5 5.5 9 4a1.5 1.5 0 0 1 2.1 0l1.2 1.2a1.5 1.5 0 0 1 .2 1.9l-.7 1.1a13.5 13.5 0 0 0 4 4l1.1-.7a1.5 1.5 0 0 1 1.9.2L20 12.9a1.5 1.5 0 0 1 0 2.1l-1.5 1.5c-.8.8-2 .9-3 .4A18.2 18.2 0 0 1 7.1 8.5c-.5-1-.4-2.2.4-3Z" />
    ),
    shield: (
        <path d="M12 3.5 19 6v5.1c0 4.1-2.7 7.8-7 9.4-4.3-1.6-7-5.3-7-9.4V6l7-2.5Z" />
    ),
    support: (
        <>
            <path d="M5 12a7 7 0 0 1 14 0" />
            <path d="M5 12v3a2 2 0 0 0 2 2h1v-6H7a2 2 0 0 0-2 2Z" />
            <path d="M19 12v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
            <path d="M14 19h-3" />
        </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
        <>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l2.5 2" />
        </>
    ),
    file: (
        <>
            <path d="M7 3.5h6l4 4V20H7V3.5Z" />
            <path d="M13 3.5V8h4" />
            <path d="M9.5 12h5" />
            <path d="M9.5 15h4" />
        </>
    ),
    wallet: (
        <>
            <path d="M4.5 7.5h14A1.5 1.5 0 0 1 20 9v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17V7a2.5 2.5 0 0 1 2.5-2.5H17" />
            <path d="M16 13h.01" />
        </>
    ),
};

function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={className}
        >
            {iconPaths[name]}
        </svg>
    );
}

function getConsultationJourney(estimate: EmiEstimate | null, loading: boolean): JourneyStep[] {
    if (!estimate) {
        return [
            {
                label: loading ? 'Submitting Callback Request' : 'Callback Consultation',
                detail: loading ? 'Sending your request to the advisor queue.' : 'Advisor will call back and help choose the next best loan step.',
                state: 'current',
            },
            {
                label: 'Profile Review',
                detail: 'Your onboarding profile and eligibility signals will be reviewed.',
                state: 'pending',
            },
            {
                label: 'Offer Discussion',
                detail: 'Available loan options can be discussed during the consultation.',
                state: 'pending',
            },
            {
                label: 'Application Submission',
                detail: 'Submit the final application after advisor guidance.',
                state: 'pending',
            },
        ];
    }

    return [
        {
            label: `${formatCurrency(estimate.loanAmount)} Estimate Ready`,
            detail: `${estimate.tenure} month plan with ${formatCurrency(estimate.estimatedEmi)} estimated EMI.`,
            state: 'complete',
        },
        {
            label: loading ? 'Submitting Callback Request' : 'Callback Consultation',
            detail: loading ? 'Sending your request to the advisor queue.' : 'Advisor will review your repayment plan and eligibility signals.',
            state: 'current',
        },
        {
            label: 'Personalized Offer Review',
            detail: `Compare repayment, total interest, and tenure fit for ${formatCurrency(estimate.loanAmount)}.`,
            state: 'pending',
        },
        {
            label: 'Application Submission',
            detail: 'Continue with documents and final verification after selecting an offer.',
            state: 'pending',
        },
    ];
}

function CallbackRequestContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [estimate, setEstimate] = useState<EmiEstimate | null>(null);

    useEffect(() => {
        const leadId = localStorage.getItem('leadId');
        if (!leadId) {
            router.push('/start');
        }
    }, [router]);

    useEffect(() => {
        const estimateFromUrl = parseEstimateFromSearchParams(
            new URLSearchParams(searchParams.toString()),
        );

        queueMicrotask(() => {
            setEstimate(estimateFromUrl);
        });
    }, [searchParams]);

    const summaryItems = estimate
        ? [
            { label: 'Loan Amount', value: formatCurrency(estimate.loanAmount) },
            { label: 'Tenure', value: `${estimate.tenure} months` },
            { label: 'Estimated EMI', value: formatCurrency(estimate.estimatedEmi), featured: true },
        ]
        : [];
    const advisorItems = [
        'Review your eligibility',
        'Explain interest rates',
        'Discuss loan options',
        'Guide documentation requirements',
    ];
    const timelineItems = [
        { label: 'Typical callback time', value: '2-4 business hours' },
        { label: 'Support availability', value: 'Mon-Sat' },
        { label: 'Consultation terms', value: 'No obligation' },
    ];
    const trustItems = [
        { icon: 'shield' as const, label: 'Secure financial consultation' },
        { icon: 'file' as const, label: 'Encrypted customer information' },
        { icon: 'check' as const, label: 'No impact on credit score' },
    ];
    const journeyItems = getConsultationJourney(estimate, loading);
    const currentJourneyStep = journeyItems.find((step) => step.state === 'current') ?? journeyItems.at(-1);

    async function handleRequestCallback() {
        const leadId = localStorage.getItem('leadId');
        if (!leadId) {
            router.push('/start');
            return;
        }

        try {
            setLoading(true);

            await eventsService.createEvent({
                leadId,
                eventType: 'CALLBACK_REQUESTED',
                metadata: {
                    source: estimate ? 'callback_request_with_estimate' : 'direct_callback_request',
                    ...(estimate
                        ? {
                            estimateSessionId: estimate.sessionId,
                            estimatedEmi: estimate.estimatedEmi,
                            loanAmount: estimate.loanAmount,
                            tenure: estimate.tenure,
                        }
                        : {}),
                },
            });

            saveNewSubmissionReference();
            router.push('/thank-you');
        } catch (error) {
            console.error('Callback request failed', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-[calc(100dvh-73px)] bg-slate-50 px-4 py-4 sm:px-6 lg:h-[calc(100dvh-73px)] lg:overflow-hidden lg:py-5 lg:[@media(max-height:760px)]:h-auto lg:[@media(max-height:760px)]:overflow-visible lg:[@media(max-height:760px)]:py-3">
            <div className="mx-auto flex h-full max-w-6xl flex-col gap-4 lg:[@media(max-height:760px)]:gap-3">
                <header className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/70 sm:flex-row sm:items-center lg:px-5 lg:[@media(max-height:760px)]:py-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                            Loan consultation
                        </p>
                        <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl lg:[@media(max-height:760px)]:text-2xl">
                            Request a Loan Consultation
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 lg:[@media(max-height:760px)]:mt-1 lg:[@media(max-height:760px)]:leading-5">
                            Our loan specialists will review your EMI estimate and contact you with personalized guidance.
                        </p>
                    </div>

                    <div className="flex min-w-fit items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
                        <Icon name="phone" className="h-4 w-4" />
                        Callback requested next
                    </div>
                </header>

                <section
                    className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:[@media(max-height:760px)]:gap-3"
                    aria-label="Callback request workflow"
                >
                    <div className="flex min-h-0 flex-col gap-4 lg:[@media(max-height:760px)]:gap-3">
                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80 lg:p-5 lg:[@media(max-height:760px)]:p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Loan estimate
                                    </p>
                                    <h2 className="mt-1 text-lg font-bold text-slate-950">
                                        Summary for advisor review
                                    </h2>
                                </div>
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm shadow-slate-900/20">
                                    <Icon name="wallet" className="h-5 w-5" />
                                </span>
                            </div>

                            {estimate ? (
                                <>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">
                                        Based on your EMI estimate:
                                    </p>
                                    <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:[@media(max-height:760px)]:mt-3 lg:[@media(max-height:760px)]:gap-2">
                                        {summaryItems.map((item) => (
                                            <div
                                                key={item.label}
                                                className={[
                                                    'rounded-2xl border px-4 py-3 lg:[@media(max-height:760px)]:py-2.5',
                                                    item.featured
                                                        ? 'border-blue-200 bg-blue-50 text-blue-950'
                                                        : 'border-slate-200 bg-slate-50 text-slate-950',
                                                ].join(' ')}
                                            >
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    {item.label}
                                                </p>
                                                <p
                                                    className={[
                                                        'mt-1 font-bold tracking-normal',
                                                        item.featured ? 'text-2xl text-blue-800' : 'text-xl',
                                                    ].join(' ')}
                                                >
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-2">
                                        <p className="text-slate-600">
                                            Total repayment: <span className="font-bold text-slate-950">{formatCurrency(estimate.totalRepayment)}</span>
                                        </p>
                                        <p className="text-slate-600">
                                            Session: <span className="font-bold text-slate-950">{estimate.sessionId.slice(0, 8)}</span>
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                                    No EMI estimate is attached. The advisor can still call back and help you choose the right amount, tenure, and next step.
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80 lg:p-5 lg:[@media(max-height:760px)]:p-4">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                                    <Icon name="support" />
                                </span>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Dedicated support
                                    </p>
                                    <h2 className="text-lg font-bold text-slate-950">
                                        A loan advisor will contact you to:
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:[@media(max-height:760px)]:mt-3">
                                {advisorItems.map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-2 text-sm font-medium text-slate-700"
                                    >
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                                            <Icon name="check" className="h-3.5 w-3.5" />
                                        </span>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="flex min-h-0 flex-col gap-4 lg:[@media(max-height:760px)]:gap-3">
                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80 lg:p-5 lg:[@media(max-height:760px)]:p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Application Journey
                                    </p>
                                    <h2 className="mt-1 text-lg font-bold text-slate-950">
                                        {currentJourneyStep?.label ?? 'Consultation step'}
                                    </h2>
                                </div>
                                <Icon name="clock" className="h-5 w-5 text-blue-700" />
                            </div>

                            <ol className="mt-4 grid gap-2 lg:[@media(max-height:760px)]:mt-3">
                                {journeyItems.map((step, index) => (
                                    <li
                                        key={step.label}
                                        className="flex gap-3 text-sm text-slate-700"
                                    >
                                        <span
                                            className={[
                                                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                                                step.state === 'complete'
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    : step.state === 'current'
                                                      ? 'border-blue-700 bg-blue-700 text-white'
                                                      : 'border-slate-300 bg-white text-slate-400',
                                            ].join(' ')}
                                            aria-hidden="true"
                                        >
                                            {step.state === 'complete' ? <Icon name="check" className="h-3.5 w-3.5" /> : index + 1}
                                        </span>
                                        <span>
                                            <span className="block font-semibold text-slate-800">{step.label}</span>
                                            <span className="mt-0.5 block text-xs leading-5 text-slate-500">{step.detail}</span>
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80 lg:p-5 lg:[@media(max-height:760px)]:p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Callback expectations
                            </p>
                            <div className="mt-3 grid gap-3 lg:[@media(max-height:760px)]:gap-2">
                                {timelineItems.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0 lg:[@media(max-height:760px)]:pb-2"
                                    >
                                        <span className="text-sm text-slate-600">{item.label}</span>
                                        <span className="text-right text-sm font-bold text-slate-950">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/80 lg:p-5 lg:[@media(max-height:760px)]:p-4">
                            <div className="grid gap-2">
                                {trustItems.map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex items-center gap-3 text-sm font-semibold text-slate-700"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-blue-700 ring-1 ring-slate-200">
                                            <Icon name={item.icon} className="h-4 w-4" />
                                        </span>
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <button
                            type="button"
                            onClick={handleRequestCallback}
                            disabled={loading}
                            className="w-full rounded-2xl bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 lg:[@media(max-height:760px)]:py-3"
                        >
                            {loading ? 'Requesting callback...' : 'Confirm Callback Request'}
                        </button>
                    </aside>
                </section>
            </div>
        </main>
    );
}

export default function CallbackRequestPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-[calc(100dvh-73px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
                        Preparing consultation details...
                    </div>
                </main>
            }
        >
            <CallbackRequestContent />
        </Suspense>
    );
}
