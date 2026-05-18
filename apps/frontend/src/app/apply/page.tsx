'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { eventsService } from '@/services/events.service';
import { leadsService } from '@/services/leads.service';

export default function ApplyPage() {
    const router = useRouter();
    const [leadId, setLeadId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        salary: '',
        loanAmount: '',
        employmentType: 'SALARIED',
    });
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [uploadMessage, setUploadMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const existingLeadId = localStorage.getItem('leadId');
        const existingLeadName = localStorage.getItem('leadName') || '';
        const existingLeadPhone = localStorage.getItem('leadPhone') || '';

        if (!existingLeadId) {
            router.push('/start');
            return;
        }

        setLeadId(existingLeadId);
        setFormData((current) => ({
            ...current,
            name: existingLeadName,
            phone: existingLeadPhone,
        }));
    }, [router]);

    async function handleUpload() {
        if (!leadId) {
            router.push('/start');
            return;
        }

        if (!documentFile) {
            setUploadMessage('Please select a document to upload.');
            return;
        }

        try {
            setLoading(true);
            await eventsService.createEvent({
                leadId,
                eventType: 'DOCUMENT_UPLOADED',
                metadata: {
                    fileName: documentFile.name,
                    documentType: 'income_proof',
                },
            });
            setUploadMessage('Document uploaded successfully.');
            setDocumentFile(null);
        } catch (error) {
            console.error('Document upload failed', error);
            setUploadMessage('Unable to upload document at this time.');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(
        e: React.FormEvent,
    ) {
        e.preventDefault();

        if (!leadId) {
            router.push('/start');
            return;
        }

        try {
            setLoading(true);

            const lead = await leadsService.updateLead(leadId, {
                salary: Number(formData.salary),
                loanAmount: Number(formData.loanAmount),
                employmentType: formData.employmentType,
            });

            await eventsService.createEvent({
                leadId: lead.id,
                eventType: 'FORM_STARTED',
            });

            await eventsService.createEvent({
                leadId: lead.id,
                eventType: 'SALARY_ENTERED',
                metadata: {
                    salary: formData.salary,
                },
            });

            router.push('/thank-you');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 p-8">
            <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
                <h1 className="mb-8 text-4xl font-bold text-slate-950">
                    Personal Loan Application
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={formData.name}
                        disabled={Boolean(leadId)}
                        readOnly={Boolean(leadId)}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                name: e.target.value,
                            })
                        }
                    />

                    <input
                        type="text"
                        placeholder="Phone Number"
                        required
                        value={formData.phone}
                        disabled={Boolean(leadId)}
                        readOnly={Boolean(leadId)}
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                phone: e.target.value,
                            })
                        }
                    />

                    <input
                        type="number"
                        placeholder="Monthly Salary"
                        required
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                salary: e.target.value,
                            })
                        }
                    />

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <p className="mb-4 text-sm font-semibold text-slate-800">
                            Employment Type
                        </p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 transition-shadow hover:shadow-sm">
                                <input
                                    type="radio"
                                    name="employmentType"
                                    value="SALARIED"
                                    checked={formData.employmentType === 'SALARIED'}
                                    onChange={() =>
                                        setFormData({
                                            ...formData,
                                            employmentType: 'SALARIED',
                                        })
                                    }
                                    className="h-4 w-4 accent-slate-900"
                                />
                                Salaried
                            </label>
                            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 transition-shadow hover:shadow-sm">
                                <input
                                    type="radio"
                                    name="employmentType"
                                    value="SELF_EMPLOYED"
                                    checked={formData.employmentType === 'SELF_EMPLOYED'}
                                    onChange={() =>
                                        setFormData({
                                            ...formData,
                                            employmentType: 'SELF_EMPLOYED',
                                        })
                                    }
                                    className="h-4 w-4 accent-slate-900"
                                />
                                Business / Self-employed
                            </label>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <label className="text-sm font-semibold text-slate-800">
                            Upload Income Proof
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                            onChange={(e) =>
                                setDocumentFile(
                                    e.target.files?.[0] ?? null,
                                )
                            }
                        />
                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={loading}
                            className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? 'Uploading...'
                                : 'Upload Document'}
                        </button>
                        {uploadMessage ? (
                            <p className="text-sm text-slate-600">
                                {uploadMessage}
                            </p>
                        ) : null}
                    </div>

                    <input
                        type="number"
                        placeholder="Required Loan Amount"
                        required
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                loanAmount: e.target.value,
                            })
                        }
                    />

                    <button
                        disabled={loading}
                        className="w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? 'Submitting...'
                            : 'Continue'}
                    </button>
                </form>
            </div>
        </main>
    );
}