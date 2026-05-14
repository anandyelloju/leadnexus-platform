'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { leadsService } from '@/services/leads.service';

export default function StartPage() {
    const router = useRouter();

    const [name, setName] = useState('');

    const [phone, setPhone] =
        useState('');

    const [loading, setLoading] =
        useState(false);

    async function handleContinue() {
        try {
            setLoading(true);

            const existingLeadId =
                localStorage.getItem('leadId');

            if (existingLeadId) {
                router.push('/welcome');
                return;
            }

            const lead =
                await leadsService.createLead({
                    name,
                    phone,
                    source: 'WEBSITE',
                });

            localStorage.setItem('leadId', lead.id);
            localStorage.setItem('leadName', lead.name);
            localStorage.setItem('leadPhone', lead.phone);

            router.push('/welcome');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md rounded-lg border bg-white p-8">
                <h1 className="mb-6 text-3xl font-bold">
                    Start Your Loan Journey
                </h1>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full rounded border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                    <input
                        type="text"
                        placeholder="Phone Number"
                        className="w-full rounded border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                        value={phone}
                        onChange={(e) =>
                            setPhone(e.target.value)
                        }
                    />

                    <button
                        onClick={handleContinue}
                        disabled={loading}
                        className="w-full rounded bg-black py-3 text-white"
                    >
                        {loading
                            ? 'Please wait...'
                            : 'Continue'}
                    </button>
                </div>
            </div>
        </main>
    );
}