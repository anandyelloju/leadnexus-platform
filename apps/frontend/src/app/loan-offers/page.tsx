'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { eventsService } from '@/services/events.service';

export default function LoanOffersPage() {
    const router = useRouter();
    const [userName, setUserName] = useState('Valued Customer');

    useEffect(() => {
        const leadId = localStorage.getItem('leadId');
        const storedName = localStorage.getItem('leadName');

        if (!leadId) {
            router.push('/start');
            return;
        }

        if (storedName) {
            setUserName(storedName);
        }

        const trackView = async () => {
            try {
                await eventsService.createEvent({
                    leadId,
                    eventType: 'LOAN_PAGE_VIEWED',
                    metadata: {
                        page: 'loan_offers',
                    },
                });
            } catch (error) {
                console.error('Failed to track loan page view', error);
            }
        };

        trackView();
    }, [router]);

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-12">
            <div className="mx-auto max-w-6xl space-y-10">
                <section className="rounded-3xl bg-white p-10 shadow-sm">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Preferred Offers</p>
                            <h1 className="mt-4 text-4xl font-bold text-slate-950">
                                Loan offers tailored for {userName}
                            </h1>
                            <p className="mt-4 max-w-2xl text-slate-600">
                                Discover competitive personal loan packages from our partner banks, with transparent pricing, flexible repayment terms, and fast approval insights.
                            </p>
                        </div>
                        <Link
                            href="/apply"
                            className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            Apply for your preferred offer
                        </Link>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-3">
                    <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase text-slate-500">Offer 1</p>
                                <h2 className="mt-3 text-2xl font-semibold text-slate-900">Axis Swift Plus</h2>
                            </div>
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                                10.9% p.a.
                            </span>
                        </div>
                        <ul className="mt-6 space-y-3 text-slate-600">
                            <li>Loan amount up to ₹20 lakh</li>
                            <li>Tenure up to 60 months</li>
                            <li>No prepayment charges</li>
                        </ul>
                        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
                            <p className="text-sm text-slate-500">Estimated EMI</p>
                            <p className="text-xl font-semibold text-slate-900">₹12,320/mo</p>
                        </div>
                    </article>

                    <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase text-slate-500">Offer 2</p>
                                <h2 className="mt-3 text-2xl font-semibold text-slate-900">SBI Smart Loan</h2>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                                11.5% p.a.
                            </span>
                        </div>
                        <ul className="mt-6 space-y-3 text-slate-600">
                            <li>Flexible EMI options</li>
                            <li>Disbursal within 24 hours</li>
                            <li>Free credit report check</li>
                        </ul>
                        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
                            <p className="text-sm text-slate-500">Estimated EMI</p>
                            <p className="text-xl font-semibold text-slate-900">₹12,760/mo</p>
                        </div>
                    </article>

                    <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold uppercase text-slate-500">Offer 3</p>
                                <h2 className="mt-3 text-2xl font-semibold text-slate-900">HDFC Flexi Secure</h2>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                                12.2% p.a.
                            </span>
                        </div>
                        <ul className="mt-6 space-y-3 text-slate-600">
                            <li>Partial repayment facility</li>
                            <li>High approval confidence</li>
                            <li>Minimal documentation</li>
                        </ul>
                        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
                            <p className="text-sm text-slate-500">Estimated EMI</p>
                            <p className="text-xl font-semibold text-slate-900">₹13,040/mo</p>
                        </div>
                    </article>
                </section>

                <section className="rounded-3xl bg-slate-900 p-10 text-white shadow-sm">
                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Why LeadNexus</p>
                            <h2 className="mt-3 text-3xl font-semibold">Fast decisions backed by bank-grade analytics</h2>
                        </div>
                        <div className="space-y-4 border-l border-slate-700 pl-6">
                            <p className="text-sm text-slate-300">
                                Our platform matches your profile with offers that balance rate, tenure, and approval likelihood.
                            </p>
                            <p className="text-sm text-slate-300">
                                Track real-time eligibility, compare package terms, and move ahead confidently with the right loan structure.
                            </p>
                        </div>
                        <div className="space-y-4 border-l border-slate-700 pl-6">
                            <p className="text-sm text-slate-300">
                                Click through to compare products, then continue to application without leaving the dashboard.
                            </p>
                            <Link
                                href="/apply"
                                className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                            >
                                Continue to Apply
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
