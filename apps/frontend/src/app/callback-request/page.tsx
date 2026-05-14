'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { eventsService } from '@/services/events.service';

export default function CallbackRequestPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loanAmount, setLoanAmount] = useState(500000);
    const [tenure, setTenure] = useState(24);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const amount = Number(searchParams.get('loanAmount'));
        const months = Number(searchParams.get('tenure'));

        if (!Number.isNaN(amount) && amount > 0) {
            setLoanAmount(amount);
        }

        if (!Number.isNaN(months) && months > 0) {
            setTenure(months);
        }

        const leadId = localStorage.getItem('leadId');
        if (!leadId) {
            router.push('/start');
        }
    }, [router, searchParams]);

    const monthlyRate = 10 / 12 / 100;
    const emi =
        (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
        (Math.pow(1 + monthlyRate, tenure) - 1);

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
                eventType: 'EMI_CALCULATOR_USED',
                metadata: { loanAmount, tenure },
            });

            await eventsService.createEvent({
                leadId,
                eventType: 'CALLBACK_REQUESTED',
            });

            router.push('/thank-you');
        } catch (error) {
            console.error('Callback request failed', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 p-8">
            <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
                <h1 className="mb-8 text-4xl font-bold text-slate-950">
                    Request a Callback
                </h1>

                <div className="space-y-6">
                    <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-lg">
                        <p className="text-sm text-slate-400">
                            Loan estimate used for your callback request
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm uppercase text-slate-400">
                                    Loan Amount
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                    ₹{loanAmount}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm uppercase text-slate-400">
                                    Tenure
                                </p>
                                <p className="mt-2 text-2xl font-bold">
                                    {tenure} months
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-3xl bg-slate-900 p-6">
                            <p className="text-sm text-slate-400">Estimated EMI</p>
                            <p className="mt-2 text-4xl font-bold text-white">
                                ₹{Math.round(emi)}
                            </p>
                        </div>
                    </div>

                    <p className="text-slate-600">
                        We will contact you soon with a tailored loan recommendation based on this estimate.
                    </p>

                    <button
                        onClick={handleRequestCallback}
                        disabled={loading}
                        className="w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Requesting...' : 'Confirm Callback'}
                    </button>
                </div>
            </div>
        </main>
    );
}
