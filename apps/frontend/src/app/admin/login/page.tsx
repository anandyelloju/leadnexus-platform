'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const operationalTools = [
    'Lead management',
    'Verification queue',
    'Callback scheduling',
    'Loan review dashboard',
    'Application tracking',
];

const securityControls = [
    'Role-based access control',
    'Encrypted authentication',
    'Secure session management',
    'Access activity monitored',
];

function StatusDot({ tone = 'blue' }: { tone?: 'blue' | 'green' }) {
    return (
        <span
            aria-hidden="true"
            className={[
                'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                tone === 'green' ? 'bg-emerald-500' : 'bg-blue-700',
            ].join(' ')}
        />
    );
}

function OperationalFeatureList() {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {operationalTools.map((tool) => (
                <div
                    key={tool}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                >
                    <StatusDot />
                    <span className="text-sm font-semibold text-slate-700">{tool}</span>
                </div>
            ))}
        </div>
    );
}

function SecurityBadgeStrip() {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {securityControls.map((control) => (
                <div key={control} className="flex items-start gap-3 text-sm text-slate-600">
                    <StatusDot tone="green" />
                    <span>{control}</span>
                </div>
            ))}
        </div>
    );
}

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberSession, setRememberSession] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Enter your staff email and password to continue.');
            return;
        }

        setIsSubmitting(true);

        // These should match your .env.local values.
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

        if (email === adminEmail && password === adminPassword) {
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('adminRememberSession', String(rememberSession));
            router.push('/dashboard');
        } else {
            setError('We could not verify those staff credentials. Check your details or contact operations support.');
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-[calc(100vh-73px)] bg-slate-50">
            <section className="mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-12">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold uppercase tracking-normal text-blue-800">
                        <span className="h-2 w-2 rounded-full bg-blue-700" aria-hidden="true" />
                        Version 1.0 secure environment
                    </div>

                    <div className="max-w-2xl space-y-4">
                        <p className="text-sm font-bold uppercase tracking-normal text-slate-500">
                            LeadNexus Operations Portal
                        </p>
                        <h1 className="text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
                            Secure workspace access for banking operations teams.
                        </h1>
                        <p className="max-w-xl text-base leading-7 text-slate-600">
                            Protected internal system for authorized loan advisors, verification specialists, and operations teams managing customer applications.
                        </p>
                    </div>

                    <OperationalFeatureList />

                    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-sm font-bold uppercase tracking-normal text-slate-900">
                                    Security Controls
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Staff access is validated, monitored, and securely logged.
                                </p>
                            </div>
                            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                Protected
                            </span>
                        </div>
                        <SecurityBadgeStrip />
                    </div>

                    <div className="grid gap-3 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:grid-cols-3">
                        <span>LeadNexus Operations Environment</span>
                        <span>Sessions expire after inactivity</span>
                        <span>Authorized staff access only</span>
                    </div>
                </div>

                <div className="mx-auto w-full max-w-md lg:ml-auto">
                    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80 sm:p-8">
                        <div className="mb-6">
                            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white shadow-sm shadow-blue-900/30">
                                LN
                            </div>
                            <h2 className="text-2xl font-bold text-slate-950">Staff Sign In</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Access the internal loan operations workspace with your authorized staff credentials.
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5" noValidate>
                            <div>
                                <label htmlFor="staff-email" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Staff email
                                </label>
                                <input
                                    id="staff-email"
                                    type="email"
                                    autoComplete="username"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                                    placeholder="advisor@leadnexus.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    aria-describedby={error ? 'staff-login-error' : undefined}
                                />
                            </div>

                            <div>
                                <label htmlFor="staff-password" className="mb-2 block text-sm font-semibold text-slate-700">
                                    Password
                                </label>
                                <div className="flex rounded-lg border border-slate-300 bg-white transition focus-within:border-blue-700 focus-within:ring-4 focus-within:ring-blue-100">
                                    <input
                                        id="staff-password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        className="min-w-0 flex-1 rounded-lg px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        aria-describedby={error ? 'staff-login-error' : undefined}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((current) => !current)}
                                        className="rounded-r-lg px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={rememberSession}
                                        onChange={(e) => setRememberSession(e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-200"
                                    />
                                    Remember this session
                                </label>
                                <button
                                    type="button"
                                    className="text-sm font-semibold text-blue-700 transition hover:text-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {error && (
                                <div
                                    id="staff-login-error"
                                    role="alert"
                                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-blue-900/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-blue-300"
                            >
                                {isSubmitting ? 'Validating access...' : 'Sign In Securely'}
                            </button>
                        </form>

                        <div className="mt-5 border-t border-slate-200 pt-5">
                            <button
                                type="button"
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                            >
                                Continue with Company SSO
                            </button>
                            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                                All staff access is securely monitored. Unauthorized access is prohibited.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
