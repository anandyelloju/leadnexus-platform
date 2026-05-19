'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { ONBOARDING_EVENTS, trackOnboardingEvent } from '@/lib/analytics';

type IconName = 'check' | 'copy' | 'clock' | 'file' | 'shield' | 'lock' | 'arrow' | 'dashboard';

type ReferenceDetails = {
    applicationId: string;
    submittedAt: string;
};

const iconPaths: Record<IconName, ReactNode> = {
    check: <path d="m5 12 4 4L19 6" />,
    copy: (
        <>
            <path d="M8 8h10v12H8z" />
            <path d="M6 16H4V4h10v2" />
        </>
    ),
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
    shield: <path d="M12 3.5 19 6v5.1c0 4.1-2.7 7.8-7 9.4-4.3-1.6-7-5.3-7-9.4V6l7-2.5Z" />,
    lock: (
        <>
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    dashboard: (
        <>
            <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h5v7h-6.5V5.5Z" />
            <path d="M13.5 4h5A1.5 1.5 0 0 1 20 5.5V9h-6.5V4Z" />
            <path d="M4 13.5h6.5V20h-5A1.5 1.5 0 0 1 4 18.5v-5Z" />
            <path d="M13.5 11.5H20v7a1.5 1.5 0 0 1-1.5 1.5h-5v-8.5Z" />
        </>
    ),
};

const statusItems = [
    { label: 'Application submitted', state: 'complete' as const },
    { label: 'Documents uploaded', state: 'complete' as const },
    { label: 'Callback request received', state: 'complete' as const },
    { label: 'Verification pending', state: 'pending' as const },
];

const timelineItems = [
    {
        title: 'Application Review',
        timing: 'Within 2-4 business hours',
        description: 'A loan operations specialist checks your submitted profile and routes it for eligibility review.',
    },
    {
        title: 'Verification Process',
        timing: 'Most applications within 24 business hours',
        description: 'Our team reviews your eligibility, identity details, and supporting documents.',
    },
    {
        title: 'Loan Consultation',
        timing: 'Advisor follow-up after verification',
        description: 'A loan advisor will contact you with available options, next steps, and any additional requirements.',
    },
];

const journeyItems = [
    { label: 'EMI Estimate', state: 'complete' as const },
    { label: 'Callback Consultation', state: 'complete' as const },
    { label: 'Application Submitted', state: 'complete' as const },
    { label: 'Verification Pending', state: 'pending' as const },
];

const trustItems = [
    { icon: 'lock' as const, label: 'Encrypted document storage' },
    { icon: 'shield' as const, label: 'Bank-grade security controls' },
    { icon: 'check' as const, label: 'Protected personal information' },
];

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

function getReferenceDetails(): ReferenceDetails {
    const now = new Date();
    const stored = localStorage.getItem('leadnexusSubmissionReference');

    if (stored) {
        try {
            return JSON.parse(stored) as ReferenceDetails;
        } catch {
            localStorage.removeItem('leadnexusSubmissionReference');
        }
    }

    const datePart = now.getFullYear().toString();
    const sequence = Math.floor(10000 + Math.random() * 90000).toString();
    const details = {
        applicationId: `LN-${datePart}-${sequence}`,
        submittedAt: now.toISOString(),
    };

    localStorage.setItem('leadnexusSubmissionReference', JSON.stringify(details));

    return details;
}

function formatSubmissionTime(value: string) {
    return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

function SectionCard({
    eyebrow,
    title,
    children,
    className = '',
}: {
    eyebrow?: string;
    title: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={['rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80', className].join(' ')}>
            <div className="mb-5">
                {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">{eyebrow}</p>}
                <h2 className="mt-1 text-lg font-bold tracking-normal text-slate-950">{title}</h2>
            </div>
            {children}
        </section>
    );
}

function SuccessHeader() {
    return (
        <header className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-slate-200/80 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                        <Icon name="check" className="h-6 w-6" />
                    </span>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                            Submission complete
                        </p>
                        <h1 className="mt-2 text-2xl font-bold tracking-normal text-slate-950 sm:text-3xl">
                            Application Submitted Successfully
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                            Your loan application and supporting documents have been securely received.
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
                    Received for processing
                </div>
            </div>
        </header>
    );
}

function SubmissionStatus() {
    return (
        <SectionCard eyebrow="Operational status" title="Submission Status">
            <div className="grid gap-3 sm:grid-cols-2">
                {statusItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span
                            className={[
                                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs',
                                item.state === 'complete'
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-slate-300 bg-white text-slate-400',
                            ].join(' ')}
                        >
                            {item.state === 'complete' ? <Icon name="check" className="h-3.5 w-3.5" /> : null}
                        </span>
                        <span className="text-sm font-semibold text-slate-800">{item.label}</span>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
}

function NextStepsTimeline() {
    return (
        <SectionCard eyebrow="Processing expectations" title="What Happens Next" className="lg:col-span-2">
            <ol className="grid gap-4 md:grid-cols-3">
                {timelineItems.map((item, index) => (
                    <li key={item.title} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-bold text-white">
                                {index + 1}
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
                                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-blue-700">{item.timing}</p>
                            </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-600">{item.description}</p>
                    </li>
                ))}
            </ol>
        </SectionCard>
    );
}

function ApplicationReference({ reference }: { reference: ReferenceDetails | null }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        if (!reference) {
            return;
        }

        try {
            await navigator.clipboard.writeText(reference.applicationId);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    }

    return (
        <SectionCard eyebrow="Reference" title="Application Reference">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Application ID</p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-mono text-xl font-bold tracking-normal text-blue-950">
                        {reference?.applicationId ?? 'Generating...'}
                    </p>
                    <button
                        type="button"
                        onClick={handleCopy}
                        disabled={!reference}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Icon name="copy" className="h-4 w-4" />
                        {copied ? 'Copied' : 'Copy ID'}
                    </button>
                </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <span className="text-slate-500">Submission timestamp</span>
                    <span className="text-right font-bold text-slate-950">
                        {reference ? formatSubmissionTime(reference.submittedAt) : 'Confirming...'}
                    </span>
                </div>
                <p className="rounded-xl bg-slate-50 p-3 font-semibold leading-6 text-slate-700">
                    A confirmation message has been sent to your registered mobile number.
                </p>
            </div>
        </SectionCard>
    );
}

function TrustIndicatorStrip() {
    return (
        <SectionCard eyebrow="Security" title="Secure Submission">
            <div className="grid gap-3">
                {trustItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-700 ring-1 ring-slate-200">
                            <Icon name={item.icon} className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                    </div>
                ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
                Your documents are encrypted and securely stored while our verification team completes the review.
            </p>
        </SectionCard>
    );
}

function CompletionTracker() {
    return (
        <SectionCard eyebrow="Application journey" title="Onboarding Progress" className="lg:col-span-2">
            <div className="grid gap-3 md:grid-cols-4">
                {journeyItems.map((item) => (
                    <div
                        key={item.label}
                        className={[
                            'rounded-xl border px-4 py-3',
                            item.state === 'complete'
                                ? 'border-emerald-200 bg-emerald-50'
                                : 'border-slate-200 bg-white',
                        ].join(' ')}
                    >
                        <span
                            className={[
                                'flex h-7 w-7 items-center justify-center rounded-full border',
                                item.state === 'complete'
                                    ? 'border-emerald-200 bg-white text-emerald-700'
                                    : 'border-slate-300 bg-slate-50 text-slate-400',
                            ].join(' ')}
                        >
                            {item.state === 'complete' ? <Icon name="check" className="h-4 w-4" /> : null}
                        </span>
                        <p className="mt-3 text-sm font-bold text-slate-900">{item.label}</p>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
}

function NextActions() {
    const trackClick = (eventName: typeof ONBOARDING_EVENTS.DASHBOARD_CTA_CLICKED | typeof ONBOARDING_EVENTS.APPLICATION_TRACKING_CTA_CLICKED) => {
        void trackOnboardingEvent(eventName);
    };

    return (
        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm shadow-blue-900/5 lg:col-span-2">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <p className="text-sm font-bold text-blue-950">Thank you for choosing LeadNexus.</p>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-900">
                        Most applications are reviewed within 24 business hours. You can track the status or return to
                        your dashboard while verification is in progress.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                    <Link
                        href="/dashboard?view=application"
                        onClick={() => trackClick(ONBOARDING_EVENTS.APPLICATION_TRACKING_CTA_CLICKED)}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                    >
                        Track Application
                        <Icon name="arrow" className="h-4 w-4" />
                    </Link>
                    <Link
                        href="/dashboard"
                        onClick={() => trackClick(ONBOARDING_EVENTS.DASHBOARD_CTA_CLICKED)}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-blue-100 transition hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-200"
                    >
                        <Icon name="dashboard" className="h-4 w-4" />
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default function ThankYouPage() {
    const [reference, setReference] = useState<ReferenceDetails | null>(null);

    useEffect(() => {
        const details = getReferenceDetails();

        queueMicrotask(() => {
            setReference(details);
        });

        void trackOnboardingEvent(ONBOARDING_EVENTS.APPLICATION_SUBMITTED, {
            metadata: { applicationId: details.applicationId },
        });
        void trackOnboardingEvent(ONBOARDING_EVENTS.THANK_YOU_PAGE_VIEWED, {
            metadata: { applicationId: details.applicationId },
        });
    }, []);

    const currentStatus = useMemo(
        () => ({
            applicationId: reference?.applicationId ?? 'Pending',
            submittedAt: reference ? formatSubmissionTime(reference.submittedAt) : 'Confirming receipt',
        }),
        [reference],
    );

    return (
        <main className="min-h-[calc(100dvh-73px)] bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <SuccessHeader />

                <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.82fr]">
                    <SubmissionStatus />
                    <ApplicationReference reference={reference} />
                    <NextStepsTimeline />
                    <CompletionTracker />
                    <TrustIndicatorStrip />

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-blue-700 ring-1 ring-slate-200">
                                <Icon name="clock" />
                            </span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Live record</p>
                                <h2 className="text-lg font-bold text-slate-950">Processing Summary</h2>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 text-sm">
                            {[
                                ['Application ID', currentStatus.applicationId],
                                ['Received at', currentStatus.submittedAt],
                                ['Current stage', 'Verification pending'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                    <span className="text-slate-500">{label}</span>
                                    <span className="text-right font-bold text-slate-950">{value}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <NextActions />
                </div>
            </div>
        </main>
    );
}
