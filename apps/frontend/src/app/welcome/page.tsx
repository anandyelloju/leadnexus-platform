'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventsService } from '@/services/events.service';
import { leadsService } from '@/services/leads.service';

type IconName =
    | 'arrow'
    | 'calculator'
    | 'check'
    | 'clock'
    | 'document'
    | 'lock'
    | 'phone'
    | 'shield'
    | 'spark'
    | 'user';

type ProgressStage = {
    label: string;
    status: 'complete' | 'current' | 'upcoming';
};

type LeadEvent = {
    id: string;
    eventType: string;
    createdAt: string;
    metadata?: unknown;
};

type LeadScore = {
    eligibilityScore: number;
    engagementScore: number;
    finalScore: number;
    intentScore: number;
    riskScore: number;
};

type Lead = {
    id: string;
    name: string;
    phone: string;
    salary?: number | null;
    employmentType?: string | null;
    loanAmount?: number | null;
    currentStage?: string;
    createdAt?: string;
    events?: LeadEvent[];
    scores?: LeadScore | null;
};

type ActivityItem = {
    id: string;
    label: string;
    time: string;
};

const trustBadges = [
    { icon: 'lock' as IconName, label: '256-bit encryption' },
    { icon: 'document' as IconName, label: 'Secure document verification' },
    { icon: 'shield' as IconName, label: 'RBI-aligned data controls' },
];

function subscribeToStorage(onStoreChange: () => void) {
    window.addEventListener('storage', onStoreChange);

    return () => window.removeEventListener('storage', onStoreChange);
}

function getStoredLeadName() {
    if (typeof window === 'undefined') {
        return 'Valued Customer';
    }

    return localStorage.getItem('leadName') || 'Valued Customer';
}

function getStoredLeadId() {
    if (typeof window === 'undefined') {
        return '';
    }

    return localStorage.getItem('leadId') || '';
}

function getServerLeadId() {
    return '';
}

function getServerLeadName() {
    return 'Valued Customer';
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
        style: 'currency',
        currency: 'INR',
    }).format(value);
}

function formatRelativeTime(value?: string) {
    if (!value) {
        return 'Recently';
    }

    const date = new Date(value);
    const diffInMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));

    if (diffInMinutes < 1) {
        return 'Just now';
    }

    if (diffInMinutes < 60) {
        return `${diffInMinutes} mins ago`;
    }

    const diffInHours = Math.round(diffInMinutes / 60);

    if (diffInHours < 24) {
        return `${diffInHours} hrs ago`;
    }

    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
    });
}

function hasEvent(lead: Lead | null, eventType: string) {
    return Boolean(lead?.events?.some((event) => event.eventType === eventType));
}

function getProgressStages(lead: Lead | null): ProgressStage[] {
    const hasPersonalDetails = Boolean(lead?.name && lead?.phone);
    const hasEligibilitySignal = Boolean(
        hasEvent(lead, 'OTP_VERIFIED') ||
        (lead?.scores?.eligibilityScore ?? 0) > 0 ||
        (lead?.currentStage && lead.currentStage !== 'NEW'),
    );
    const hasIncomeDetails = Boolean(lead?.salary && lead?.loanAmount);
    const hasDocuments = hasEvent(lead, 'DOCUMENT_UPLOADED');
    const hasFinalReview = lead?.currentStage === 'CONVERTED';

    const steps = [
        { label: 'Personal Information', complete: hasPersonalDetails },
        { label: 'Eligibility Check', complete: hasEligibilitySignal },
        { label: 'Income Verification', complete: hasIncomeDetails },
        { label: 'Document Upload', complete: hasDocuments },
        { label: 'Final Review', complete: hasFinalReview },
    ];
    const currentIndex = steps.findIndex((step) => !step.complete);

    return steps.map((step, index) => ({
        label: step.label,
        status: step.complete ? 'complete' : index === currentIndex ? 'current' : 'upcoming',
    }));
}

function getStageCopy(currentStage?: ProgressStage) {
    if (!currentStage) {
        return {
            title: 'Application Ready for Review',
            description: 'Your application details are complete. Our team will continue reviewing your profile and next actions.',
            cta: 'View Application',
            href: '/apply',
            estimate: 'Under review',
        };
    }

    const copyByStage: Record<string, {
        title: string;
        description: string;
        cta: string;
        href: string;
        estimate: string;
    }> = {
        'Personal Information': {
            title: 'Complete Personal Information',
            description: 'Confirm your basic details so we can keep your application profile accurate.',
            cta: 'Continue Application',
            href: '/apply',
            estimate: '2 mins',
        },
        'Eligibility Check': {
            title: 'Complete Eligibility Check',
            description: 'Verify your profile so we can calculate stronger qualification signals for your loan journey.',
            cta: 'Continue Application',
            href: '/apply',
            estimate: '2 mins',
        },
        'Income Verification': {
            title: 'Complete Income Verification',
            description: 'Confirm income and requested amount to unlock a tailored offer range and move your application to document review.',
            cta: 'Continue Application',
            href: '/apply',
            estimate: '3 mins',
        },
        'Document Upload': {
            title: 'Prepare Document Upload',
            description: 'Your income details are saved. Keep identity and income documents ready for secure verification.',
            cta: 'Review Application',
            href: '/apply',
            estimate: '5 mins',
        },
        'Final Review': {
            title: 'Final Review in Progress',
            description: 'Your application is ready for advisor review. Request support if you want help with the next decision.',
            cta: 'Request Callback',
            href: '/callback-request',
            estimate: '10-15 mins',
        },
    };

    return copyByStage[currentStage.label];
}

function getPreQualifiedAmount(lead: Lead | null) {
    if (!lead?.salary) {
        return null;
    }

    return Math.min(2000000, Math.max(100000, Math.round((lead.salary * 10) / 50000) * 50000));
}

function getLoanRange(lead: Lead | null) {
    const preQualifiedAmount = getPreQualifiedAmount(lead);

    if (!preQualifiedAmount) {
        return null;
    }

    const requestedAmount = lead?.loanAmount || preQualifiedAmount;
    const low = Math.max(100000, Math.round(Math.min(requestedAmount, preQualifiedAmount) * 0.45 / 50000) * 50000);

    return {
        low,
        high: preQualifiedAmount,
    };
}

function getApprovalSpeed(lead: Lead | null) {
    const score = lead?.scores?.finalScore ?? 0;

    if (score >= 70) {
        return 'Within 24 hrs';
    }

    if (score >= 40 || lead?.salary) {
        return '1-2 business days';
    }

    return 'After verification';
}

function getRecommendation(lead: Lead | null, currentStage?: ProgressStage) {
    if (currentStage?.label === 'Income Verification') {
        return 'Verify income';
    }

    if (currentStage?.label === 'Document Upload') {
        return 'Prepare documents';
    }

    if (hasEvent(lead, 'CALLBACK_REQUESTED')) {
        return 'Advisor assigned';
    }

    return currentStage?.label || 'Monitor progress';
}

function getEstimatedEmi(lead: Lead | null) {
    const amount = lead?.loanAmount || getLoanRange(lead)?.low || 500000;
    const tenure = 24;
    const monthlyRate = 10 / 12 / 100;

    return Math.round(
        (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
        (Math.pow(1 + monthlyRate, tenure) - 1),
    );
}

const eventLabels: Record<string, string> = {
    CALLBACK_REQUESTED: 'Callback requested',
    DOCUMENT_UPLOADED: 'Document uploaded',
    EMI_CALCULATOR_USED: 'EMI calculator used',
    FORM_STARTED: 'Application form started',
    LANDING_PAGE_VIEWED: 'Onboarding hub viewed',
    OTP_VERIFIED: 'Phone number verified',
    SALARY_ENTERED: 'Income details submitted',
};

function getRecentActivity(lead: Lead | null): ActivityItem[] {
    const seenEventTypes = new Set<string>();
    const eventActivity = lead?.events?.reduce<ActivityItem[]>((items, event) => {
        if (items.length >= 4 || seenEventTypes.has(event.eventType)) {
            return items;
        }

        seenEventTypes.add(event.eventType);

        return [
            ...items,
            {
                id: event.id,
                label: eventLabels[event.eventType] || event.eventType.replaceAll('_', ' ').toLowerCase(),
                time: formatRelativeTime(event.createdAt),
            },
        ];
    }, []) || [];

    if (eventActivity.length > 0) {
        return eventActivity;
    }

    return [
        {
            id: 'application-profile-created',
            label: 'Application profile created',
            time: formatRelativeTime(lead?.createdAt),
        },
    ];
}

function Icon({ name, className = '' }: { name: IconName; className?: string }) {
    const iconClass = `h-5 w-5 ${className}`;

    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={iconClass}
        >
            {name === 'arrow' && (
                <>
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                </>
            )}
            {name === 'calculator' && (
                <>
                    <rect x="5" y="3" width="14" height="18" rx="3" />
                    <path d="M8.5 7.5h7" />
                    <path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" />
                </>
            )}
            {name === 'check' && <path d="m5 12 4 4L19 6" />}
            {name === 'clock' && (
                <>
                    <circle cx="12" cy="12" r="8.5" />
                    <path d="M12 7.5V12l3 2" />
                </>
            )}
            {name === 'document' && (
                <>
                    <path d="M7 3.5h7l3 3V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
                    <path d="M14 3.5V7h3" />
                    <path d="M9 12h6M9 16h4" />
                </>
            )}
            {name === 'lock' && (
                <>
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
                </>
            )}
            {name === 'phone' && (
                <>
                    <path d="M8 5.5 10.5 4l2 4-1.6 1.1a9 9 0 0 0 4 4l1.1-1.6 4 2L18.5 16a2.5 2.5 0 0 1-2.7 1.2A13 13 0 0 1 6.8 8.2 2.5 2.5 0 0 1 8 5.5Z" />
                </>
            )}
            {name === 'shield' && (
                <>
                    <path d="M12 3.5 18.5 6v5.5c0 4-2.6 7-6.5 9-3.9-2-6.5-5-6.5-9V6L12 3.5Z" />
                    <path d="m9.5 12 1.7 1.7 3.6-4" />
                </>
            )}
            {name === 'spark' && (
                <>
                    <path d="M12 3.5 13.6 9l4.9 3-4.9 3L12 20.5 10.4 15l-4.9-3 4.9-3L12 3.5Z" />
                    <path d="M19 4.5v3M20.5 6h-3M5 17v2.5M6.25 18.25h-2.5" />
                </>
            )}
            {name === 'user' && (
                <>
                    <circle cx="12" cy="8.5" r="3.5" />
                    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                </>
            )}
        </svg>
    );
}

function StatPill({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">{label}</p>
            <p className="mt-1 text-base font-semibold text-slate-950">{value}</p>
        </div>
    );
}

function SectionTitle({
    eyebrow,
    title,
}: {
    eyebrow?: string;
    title: string;
}) {
    return (
        <div>
            {eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
                    {eyebrow}
                </p>
            )}
            <h2 className="mt-1 text-lg font-semibold text-slate-950">{title}</h2>
        </div>
    );
}

export default function WelcomePage() {
    const router = useRouter();
    const userName = useSyncExternalStore(
        subscribeToStorage,
        getStoredLeadName,
        getServerLeadName,
    );
    const leadId = useSyncExternalStore(
        subscribeToStorage,
        getStoredLeadId,
        getServerLeadId,
    );
    const [lead, setLead] = useState<Lead | null>(null);
    const [isLoadingLead, setIsLoadingLead] = useState(true);

    useEffect(() => {
        if (!leadId) {
            router.push('/start');
            return;
        }

        let isMounted = true;

        const syncWelcomeData = async () => {
            try {
                await eventsService.createEvent({
                    leadId,
                    eventType: 'LANDING_PAGE_VIEWED',
                    metadata: { page: 'welcome_portal' },
                });

                const leadDetails = await leadsService.getLeadById(leadId) as Lead;

                if (isMounted) {
                    setLead(leadDetails);
                }
            } catch (err) {
                console.error('Failed to sync welcome data', err);
            } finally {
                if (isMounted) {
                    setIsLoadingLead(false);
                }
            }
        };

        syncWelcomeData();

        return () => {
            isMounted = false;
        };
    }, [leadId, router]);

    const displayName = lead?.name || userName;
    const firstName = displayName.split(' ')[0] || 'there';
    const progressStages = getProgressStages(lead);
    const completedSteps = progressStages.filter((stage) => stage.status === 'complete').length;
    const completionPercent = Math.round((completedSteps / progressStages.length) * 100);
    const currentStage = progressStages.find((stage) => stage.status === 'current');
    const remainingSteps = progressStages.length - completedSteps;
    const stageCopy = getStageCopy(currentStage);
    const loanRange = getLoanRange(lead);
    const preQualifiedAmount = getPreQualifiedAmount(lead);
    const approvalSpeed = getApprovalSpeed(lead);
    const recommendation = getRecommendation(lead, currentStage);
    const recentActivity = getRecentActivity(lead);
    const currentStageLabel = currentStage?.label || 'Final review';
    const applicationReference = lead?.id ? `LN-${lead.id.slice(0, 8).toUpperCase()}` : 'Pending';

    return (
        <main className="min-h-screen bg-[#f5f7fb] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                                <Icon name="spark" className="h-4 w-4" />
                                Loan onboarding hub
                            </div>
                            <h1 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
                                Welcome back, {firstName}.
                            </h1>
                            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
                                {remainingSteps > 0
                                    ? `You're ${remainingSteps} ${remainingSteps === 1 ? 'step' : 'steps'} away from completing your application. ${currentStageLabel} is next so we can prepare your personalized loan offer.`
                                    : 'Your application details are complete. We are keeping your offer progress and advisor activity ready here.'}
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[520px]">
                            <StatPill label="Application ID" value={applicationReference} />
                            <StatPill label="Completed" value={isLoadingLead ? 'Syncing' : `${completionPercent}%`} />
                            <StatPill label="Next step" value={currentStageLabel} />
                        </div>
                    </div>
                </header>

                <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <SectionTitle eyebrow="Application Progress" title={`Step ${completedSteps} of ${progressStages.length} completed`} />
                            <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                                {completionPercent}% complete
                            </div>
                        </div>

                        <div
                            className="mt-6 h-2.5 overflow-hidden rounded-full bg-slate-100"
                            role="progressbar"
                            aria-valuenow={completionPercent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Application completion progress"
                        >
                            <div
                                className="h-full rounded-full bg-blue-700"
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>

                        <div className="mt-6 grid gap-3">
                            {progressStages.map((stage, index) => (
                                <div
                                    key={stage.label}
                                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                                        stage.status === 'current'
                                            ? 'border-blue-200 bg-blue-50'
                                            : 'border-slate-200 bg-slate-50/60'
                                    }`}
                                >
                                    <div
                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                                            stage.status === 'complete'
                                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                                : stage.status === 'current'
                                                  ? 'border-blue-700 bg-white text-blue-700'
                                                  : 'border-slate-300 bg-white text-slate-400'
                                        }`}
                                    >
                                        {stage.status === 'complete' ? (
                                            <Icon name="check" className="h-4 w-4" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-slate-900">{stage.label}</p>
                                        <p className="text-xs text-slate-500">
                                            {stage.status === 'complete'
                                                ? 'Completed'
                                                : stage.status === 'current'
                                                  ? 'Required next'
                                                  : 'Upcoming'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <aside className="rounded-2xl border border-blue-100 bg-white p-6 shadow-[0_18px_45px_rgba(29,78,216,0.08)] sm:p-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white">
                                <Icon name="document" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-700">Primary action</p>
                                <h2 className="text-xl font-semibold text-slate-950">{stageCopy.title}</h2>
                            </div>
                        </div>

                        <p className="mt-5 text-sm leading-6 text-slate-600">
                            {stageCopy.description}
                        </p>

                        <div className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-slate-500">Estimated time</span>
                                <span className="text-sm font-semibold text-slate-900">{stageCopy.estimate}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-slate-500">Application progress</span>
                                <span className="text-sm font-semibold text-slate-900">{completionPercent}%</span>
                            </div>
                        </div>

                        <Link
                            href={stageCopy.href}
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                        >
                            {stageCopy.cta}
                            <Icon name="arrow" className="h-4 w-4" />
                        </Link>
                    </aside>
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                        <SectionTitle
                            eyebrow="Financial Insight"
                            title={
                                preQualifiedAmount
                                    ? `Pre-qualified up to ${formatCurrency(preQualifiedAmount)}`
                                    : 'Pre-qualification pending'
                            }
                        />
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                            {loanRange
                                ? `Based on your onboarding profile, your recommended loan range is ${formatCurrency(loanRange.low)} to ${formatCurrency(loanRange.high)} with faster approval after verification.`
                                : 'Add income and requested loan amount to unlock a personalized loan range and approval estimate.'}
                        </p>
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl bg-emerald-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.08em] text-emerald-700">
                                    Approval speed
                                </p>
                                <p className="mt-1 text-lg font-semibold text-emerald-950">{approvalSpeed}</p>
                            </div>
                            <div className="rounded-xl bg-blue-50 p-4">
                                <p className="text-xs font-medium uppercase tracking-[0.08em] text-blue-700">
                                    Recommendation
                                </p>
                                <p className="mt-1 text-lg font-semibold text-blue-950">{recommendation}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Link
                            href="/loan-offers"
                            className="group rounded-2xl border border-blue-200 bg-white p-6 shadow-[0_18px_45px_rgba(29,78,216,0.08)] transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
                                <Icon name="spark" />
                            </div>
                            <h2 className="mt-5 text-lg font-semibold text-slate-950">Recommended Loan Offers</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Explore personalized loan products based on your eligibility profile.
                            </p>
                            <p className="mt-5 text-sm font-semibold text-blue-800">
                                View intelligent matches
                            </p>
                        </Link>

                        <Link
                            href="/emi-calculator"
                            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                <Icon name="calculator" />
                            </div>
                            <h2 className="mt-5 text-lg font-semibold text-slate-950">EMI Calculator</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Preview payments before submitting final loan details.
                            </p>
                            <p className="mt-5 text-sm font-semibold text-slate-900">
                                Estimated EMI from {formatCurrency(getEstimatedEmi(lead))}/month
                            </p>
                        </Link>

                        <Link
                            href="/callback-request"
                            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                <Icon name="phone" />
                            </div>
                            <h2 className="mt-5 text-lg font-semibold text-slate-950">Need Help From an Advisor?</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Our lending team can help you choose the right amount.
                            </p>
                            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <Icon name="clock" className="h-4 w-4 text-blue-700" />
                                Callback in 10-15 mins
                            </div>
                        </Link>

                        <Link
                            href="/apply"
                            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                <Icon name="document" />
                            </div>
                            <h2 className="mt-5 text-lg font-semibold text-slate-950">Application</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                Complete income details and documents to improve eligibility confidence.
                            </p>
                            <p className="mt-5 text-sm font-semibold text-slate-900">
                                Continue secure onboarding
                            </p>
                        </Link>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                        <SectionTitle eyebrow="Recent Activity" title="Your onboarding timeline" />
                        <div className="mt-5 space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex gap-3">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                                        <Icon name="check" className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{activity.label}</p>
                                        <p className="text-xs text-slate-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
                        <SectionTitle eyebrow="Security" title="Your data stays protected" />
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            {trustBadges.map((badge) => (
                                <div
                                    key={badge.label}
                                    className="flex min-h-24 flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
                                >
                                    <Icon name={badge.icon} className="text-blue-700" />
                                    <p className="mt-3 text-sm font-medium leading-5 text-slate-800">{badge.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
