'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { eventsService } from '@/services/events.service';

export default function WelcomePage() {
    const router = useRouter();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const leadId = localStorage.getItem('leadId');
        const name = localStorage.getItem('leadName');

        // 1. Safety Check: If no leadId, send them back to the start
        if (!leadId) {
            router.push('/start');
            return;
        }

        setUserName(name || 'Valued Customer');

        // 2. Fire Behavioral Events: Track that they reached the welcome area
        const trackArrival = async () => {
            try {
                await eventsService.createEvent({
                    leadId,
                    eventType: 'LANDING_PAGE_VIEWED',
                    metadata: { page: 'welcome_portal' }
                });
            } catch (err) {
                console.error('Failed to track arrival event', err);
            }
        };

        trackArrival();
    }, [router]);

    return (
        <main className="min-h-[80vh] bg-slate-50 px-6 py-12">
            <div className="mx-auto max-w-4xl">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900">
                        Welcome back, {userName}!
                    </h1>
                    <p className="mt-2 text-lg text-slate-600">
                        You're one step closer to your personalized loan offer.
                    </p>
                </header>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Option 1: Engagement (Lower Score Impact) */}
                    <div className="flex flex-col justify-between rounded-xl border bg-white p-8 shadow-sm">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Explore Loan Options</h2>
                            <p className="mt-3 text-slate-500">
                                Use our interactive calculator to see how much you could borrow and what your monthly payments might look like.
                            </p>
                        </div>
                        <Link
                            href="/emi-calculator"
                            className="mt-8 block w-full rounded-lg bg-slate-100 py-3 text-center font-semibold text-slate-900 transition-colors hover:bg-slate-200"
                        >
                            Calculate EMI
                        </Link>
                    </div>

                    {/* Option 2: Intent (Higher Score Impact) */}
                    <div className="flex flex-col justify-between rounded-xl border border-slate-900 bg-slate-900 p-8 shadow-md">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Need a Callback?</h2>
                            <p className="mt-3 text-slate-300">
                                Request a quick callback from our team and get personal guidance for your loan journey.
                            </p>
                        </div>
                        <Link
                            href="/callback-request"
                            className="mt-8 block w-full rounded-lg bg-white py-3 text-center font-semibold text-slate-900 transition-transform hover:scale-[1.02]"
                        >
                            Request Callback
                        </Link>
                    </div>

                    {/* Option 3: Conversion */}
                    <div className="flex flex-col justify-between rounded-xl border bg-white p-8 shadow-sm">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">Start Your Application</h2>
                            <p className="mt-3 text-slate-500">
                                Continue your loan application and give us the details needed to move your request forward.
                            </p>
                        </div>
                        <Link
                            href="/apply"
                            className="mt-8 block w-full rounded-lg bg-slate-900 py-3 text-center font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                            Start Application
                        </Link>
                    </div>
                </div>

                <section className="mt-12 rounded-xl bg-blue-50 p-6">
                    <p className="text-sm text-blue-800">
                        <strong>Pro Tip:</strong> Using the EMI calculator before applying helps our AI recommend the best interest rates for your specific needs.
                    </p>
                </section>
            </div>
        </main>
    );
}