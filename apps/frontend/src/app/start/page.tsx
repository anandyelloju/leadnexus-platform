'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { eventsService } from '@/services/events.service';
import { leadsService } from '@/services/leads.service';

type Lead = {
    id: string;
    name: string;
    phone: string;
};

const DEMO_OTP = '123456';

type IconName = 'user' | 'shield' | 'check' | 'phone' | 'lock' | 'review' | 'spark';

const onboardingSteps: Array<{
    title: string;
    description: string;
    icon: IconName;
}> = [
    {
        title: 'Personal Information',
        description: 'Share your basic details to begin a secure application.',
        icon: 'user',
    },
    {
        title: 'Identity Verification',
        description: 'Confirm your phone number before your journey continues.',
        icon: 'shield',
    },
    {
        title: 'Eligibility Review',
        description: 'We assess your profile with transparent qualification signals.',
        icon: 'review',
    },
    {
        title: 'Approval & Follow-up',
        description: 'A loan advisor helps you complete the next best action.',
        icon: 'check',
    },
];

const trustBadges = [
    '256-bit encrypted',
    'RBI compliant',
    'No credit score impact',
    'Secure identity verification',
];

function getErrorMessage(error: unknown, fallback: string) {
    if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error
    ) {
        const response = (error as {
            response?: {
                data?: {
                    error?: string;
                    message?: string | {
                        message?: string;
                    };
                };
            };
        }).response;

        const message = response?.data?.message;

        if (
            typeof message === 'object' &&
            message?.message
        ) {
            return message.message;
        }

        if (typeof message === 'string') {
            return message;
        }

        if (response?.data?.error) {
            return response.data.error;
        }
    }

    return fallback;
}

function Icon({ name }: { name: IconName }) {
    const commonProps = {
        className: 'h-4 w-4',
        fill: 'none',
        stroke: 'currentColor',
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        strokeWidth: 2,
        viewBox: '0 0 24 24',
        'aria-hidden': true,
    };

    const paths: Record<IconName, React.ReactNode> = {
        user: (
            <>
                <path d="M20 21a8 8 0 0 0-16 0" />
                <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
            </>
        ),
        shield: (
            <>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-5" />
            </>
        ),
        check: (
            <>
                <path d="M20 6 9 17l-5-5" />
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            </>
        ),
        phone: (
            <>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.11 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.62 2.6a2 2 0 0 1-.45 2.11L9 10.7a16 16 0 0 0 4.3 4.3l1.27-1.27a2 2 0 0 1 2.11-.45c.83.29 1.7.5 2.6.62A2 2 0 0 1 22 16.92Z" />
            </>
        ),
        lock: (
            <>
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </>
        ),
        review: (
            <>
                <path d="M9 11h6" />
                <path d="M9 15h4" />
                <path d="M5 3h14a2 2 0 0 1 2 2v14l-4-3H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
            </>
        ),
        spark: (
            <>
                <path d="m12 3 1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3Z" />
                <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
            </>
        ),
    };

    return <svg {...commonProps}>{paths[name]}</svg>;
}

function OnboardingStep({
    title,
    description,
    icon,
    index,
}: {
    title: string;
    description: string;
    icon: IconName;
    index: number;
}) {
    return (
        <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
                <Icon name={icon} />
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-950">
                    {index + 1}. {title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                    {description}
                </p>
            </div>
        </div>
    );
}

function TrustBadge({ label }: { label: string }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                <Icon name="lock" />
            </span>
            {label}
        </div>
    );
}

function FormCard({ children }: { children: React.ReactNode }) {
    return (
        <section className="rounded-lg bg-white p-6 shadow-xl shadow-slate-900/10 ring-1 ring-slate-100 sm:p-8">
            {children}
        </section>
    );
}

function ProgressIndicator({ currentStep }: { currentStep: number }) {
    return (
        <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                <span>Step {currentStep} of 4</span>
                <span>{currentStep === 1 ? 'Application details' : 'Phone verification'}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-blue-700 transition-all duration-300"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                />
            </div>
        </div>
    );
}

function Field({
    id,
    label,
    helperText,
    ...props
}: {
    id: string;
    label: string;
    helperText?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    const helperId = helperText ? `${id}-helper` : undefined;

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-semibold text-slate-900">
                {label}
            </label>
            <input
                id={id}
                aria-describedby={helperId}
                className="mt-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 sm:h-[52px]"
                {...props}
            />
            {helperText && (
                <p id={helperId} className="mt-2 text-xs leading-5 text-slate-500">
                    {helperText}
                </p>
            )}
        </div>
    );
}

function PrimaryButton({
    children,
    className = '',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            className={`inline-flex h-12 w-full items-center justify-center rounded-lg bg-blue-700 px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none sm:h-[52px] ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

function SecondaryButton({
    children,
    className = '',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            className={`inline-flex h-12 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:text-slate-400 sm:h-[52px] ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default function StartPage() {
    const router = useRouter();

    const [name, setName] = useState('');

    const [phone, setPhone] =
        useState('');

    const [loading, setLoading] =
        useState(false);

    const [pendingLead, setPendingLead] =
        useState<Lead | null>(null);

    const [otp, setOtp] =
        useState('');

    const [error, setError] =
        useState('');

    async function handleContinue(event?: React.FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        try {
            setLoading(true);
            setError('');

            const lead =
                await leadsService.createLead({
                    name,
                    phone,
                    source: 'WEBSITE',
                });

            setPendingLead(lead);
            setOtp('');
        } catch (err: unknown) {
            setError(
                getErrorMessage(err, 'Unable to continue'),
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp(event?: React.FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        if (!pendingLead) {
            return;
        }

        if (otp.trim() !== DEMO_OTP) {
            setError('Invalid OTP');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await eventsService.createEvent({
                leadId: pendingLead.id,
                eventType: 'OTP_VERIFIED',
                metadata: {
                    source: 'start_page',
                },
            });

            localStorage.setItem('leadId', pendingLead.id);
            localStorage.setItem('leadName', pendingLead.name);
            localStorage.setItem('leadPhone', pendingLead.phone);

            router.push('/welcome');
        } catch (err: unknown) {
            setError(
                getErrorMessage(err, 'Unable to verify OTP'),
            );
        } finally {
            setLoading(false);
        }
    }

    const currentStep = pendingLead ? 2 : 1;

    return (
        <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_48%,#f8fafc_100%)]">
            <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-16">
                <div className="pt-2 lg:pt-8">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white/80 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-800 shadow-sm">
                        <Icon name="shield" />
                        Secure Loan Application
                    </div>

                    <div className="mt-8 max-w-2xl">
                        <h1 className="text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-[44px]">
                            Start your loan journey with confidence.
                        </h1>
                        <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
                            Complete a fast, secure onboarding flow with clear eligibility review and guided follow-up from LeadNexus.
                        </p>
                    </div>

                    <div className="mt-10 space-y-6">
                        {onboardingSteps.map((step, index) => (
                            <OnboardingStep
                                key={step.title}
                                index={index}
                                title={step.title}
                                description={step.description}
                                icon={step.icon}
                            />
                        ))}
                    </div>

                    <div className="mt-10 grid gap-3 sm:grid-cols-2">
                        {trustBadges.map((badge) => (
                            <TrustBadge key={badge} label={badge} />
                        ))}
                    </div>
                </div>

                <div className="lg:sticky lg:top-28">
                    <FormCard>
                        <ProgressIndicator currentStep={currentStep} />

                        <div className="mt-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-blue-700">
                                        {pendingLead ? 'Verify your access' : 'Tell us about yourself'}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold tracking-normal text-slate-950">
                                        {pendingLead ? 'Confirm your phone number' : 'Begin application'}
                                    </h2>
                                </div>
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                    <Icon name={pendingLead ? 'phone' : 'spark'} />
                                </div>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                {pendingLead
                                    ? `Enter the verification code sent to ${pendingLead.phone}.`
                                    : 'Your details are used to create a secure application profile.'}
                            </p>
                        </div>

                        {error && (
                            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {error}
                            </p>
                        )}

                        {!pendingLead ? (
                            <form className="mt-8 space-y-6" onSubmit={handleContinue}>
                                <Field
                                    id="full-name"
                                    type="text"
                                    label="Full name"
                                    helperText="Use the name as it appears on your official documents."
                                    placeholder="Ananya Sharma"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />

                                <Field
                                    id="phone-number"
                                    type="tel"
                                    label="Phone number"
                                    helperText="We will send a one-time password for secure verification."
                                    placeholder="+91 98765 43210"
                                    autoComplete="tel"
                                    inputMode="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />

                                <PrimaryButton
                                    type="submit"
                                    disabled={loading || !name.trim() || !phone.trim()}
                                >
                                    {loading ? 'Creating application...' : 'Continue Application'}
                                </PrimaryButton>
                            </form>
                        ) : (
                            <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
                                <Field
                                    id="otp"
                                    type="text"
                                    inputMode="numeric"
                                    label="One-time password"
                                    helperText={`For this demo, use OTP ${DEMO_OTP}.`}
                                    placeholder="6-digit code"
                                    autoComplete="one-time-code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />

                                <div className="space-y-3">
                                    <PrimaryButton type="submit" disabled={loading || !otp.trim()}>
                                        {loading ? 'Verifying...' : 'Verify & Continue'}
                                    </PrimaryButton>

                                    <SecondaryButton
                                        onClick={() => {
                                            setPendingLead(null);
                                            setOtp('');
                                            setError('');
                                        }}
                                        disabled={loading}
                                    >
                                        Change Details
                                    </SecondaryButton>
                                </div>
                            </form>
                        )}

                        <div className="mt-8 border-t border-slate-100 pt-6">
                            <p className="flex items-center gap-2 text-xs font-semibold leading-5 text-slate-500">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                                    <Icon name="lock" />
                                </span>
                                Your information is encrypted in transit and handled through a secure LeadNexus workflow.
                            </p>
                        </div>
                    </FormCard>
                </div>
            </section>
        </main>
    );
}
