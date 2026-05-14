'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [leadId, setLeadId] = useState<string | null>(null);

    useEffect(() => {
        setIsAdmin(localStorage.getItem('isAdmin') === 'true');
        setLeadId(localStorage.getItem('leadId'));
    }, [pathname]);

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('leadId');
        localStorage.removeItem('leadName');
        localStorage.removeItem('leadPhone');
        router.push('/');
    };

    return (
        <nav className="border-b border-slate-800 bg-slate-950">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link href="/" className="text-xl font-bold text-white">
                    LeadNexus
                </Link>

                <div className="flex items-center gap-3">
                    {pathname !== '/' && (
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                            Back
                        </button>
                    )}

                    {isAdmin ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Dashboard
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Logout
                            </button>
                        </>
                    ) : leadId ? (
                        <>
                            <Link
                                href="/welcome"
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                My Journey
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/start"
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                User
                            </Link>

                            <Link
                                href="/admin/login"
                                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                            >
                                Admin
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}