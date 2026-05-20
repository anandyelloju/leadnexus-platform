'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';

function getAuthSnapshot() {
    if (typeof window === 'undefined') {
        return 'false|';
    }

    return `${localStorage.getItem('isAdmin') === 'true'}|${localStorage.getItem('leadId') ?? ''}`;
}

function subscribeToAuthChanges(onStoreChange: () => void) {
    window.addEventListener('storage', onStoreChange);

    return () => {
        window.removeEventListener('storage', onStoreChange);
    };
}

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const authSnapshot = useSyncExternalStore(subscribeToAuthChanges, getAuthSnapshot, () => 'false|');
    const [isAdminValue, leadIdValue] = authSnapshot.split('|');
    const isAdmin = isAdminValue === 'true';
    const leadId = leadIdValue || null;

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('leadId');
        localStorage.removeItem('leadName');
        localStorage.removeItem('leadPhone');
        router.push('/');
    };

    const isLandingPage = pathname === '/';
    const isAdminRoute = pathname.startsWith('/admin');
    const isDashboardRoute = pathname.startsWith('/dashboard');
    const isCustomerJourney = Boolean(leadId && !isAdmin);
    const customerActions = [
        { href: '/welcome', label: 'Overview' },
        { href: '/loan-offers', label: 'Loan Offers' },
        { href: '/emi-calculator', label: 'EMI Calculator' },
        { href: '/callback-request', label: 'Call Request' },
    ];

    const getCustomerActionClassName = (href: string) => {
        const isActive = pathname === href;

        return [
            'rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 focus:ring-blue-100',
            isActive
                ? 'bg-blue-50 text-blue-800'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
        ].join(' ');
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 ${isAdmin || isDashboardRoute ? 'py-2' : 'py-4'}`}>
                <Link href="/" className="flex items-center gap-3 text-slate-950">
                    <span className={`flex items-center justify-center bg-blue-700 font-bold text-white shadow-sm shadow-blue-900/20 ${isAdmin || isDashboardRoute ? 'h-8 w-8 rounded-lg text-xs' : 'h-9 w-9 rounded-xl text-sm'}`}>
                        LN
                    </span>
                    <span className={`${isAdmin || isDashboardRoute ? 'text-lg' : 'text-xl'} font-bold tracking-normal`}>LeadNexus</span>
                </Link>

                {isLandingPage && (
                    <div className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
                        <a href="#features" className="transition hover:text-slate-950">
                            Features
                        </a>
                        <a href="#security" className="transition hover:text-slate-950">
                            Security
                        </a>
                        <a href="#solutions" className="transition hover:text-slate-950">
                            Solutions
                        </a>
                        <Link href="/callback-request" className="transition hover:text-slate-950">
                            Support
                        </Link>
                    </div>
                )}

                {isCustomerJourney && (
                    <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
                        {customerActions.map((action) => (
                            <Link
                                key={action.href}
                                href={action.href}
                                className={getCustomerActionClassName(action.href)}
                                aria-current={pathname === action.href ? 'page' : undefined}
                            >
                                {action.label}
                            </Link>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 sm:gap-3">
                    {pathname !== '/' && !isCustomerJourney && !isAdminRoute && (
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                        >
                            Back
                        </button>
                    )}

                    {isAdmin ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-100"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/dashboard"
                                className="hidden rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 sm:inline-flex"
                            >
                                Leads
                            </Link>
                            <Link
                                href="/dashboard"
                                className="hidden rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 md:inline-flex"
                            >
                                Analytics
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                            >
                                Logout
                            </button>
                        </>
                    ) : isAdminRoute ? (
                        <>
                            <Link
                                href="/callback-request"
                                className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 sm:inline-flex"
                            >
                                Support
                            </Link>
                            <Link
                                href="/"
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                            >
                                Customer Site
                            </Link>
                        </>
                    ) : leadId ? (
                        <>
                            <Link
                                href="/welcome"
                                className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 sm:inline-flex lg:hidden"
                            >
                                Overview
                            </Link>
                            <Link
                                href="/apply"
                                className="inline-flex rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-900/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                            >
                                Application
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 sm:inline-flex"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/admin/login"
                                className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 sm:inline-flex"
                            >
                                Staff Portal
                            </Link>

                            <Link
                                href="/start"
                                className="inline-flex rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-900/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                            >
                                Apply Now
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
