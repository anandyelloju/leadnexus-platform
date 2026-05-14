'use client';

import { useState } from 'react';

export default function EmiCalculatorPage() {
    const [loanAmount, setLoanAmount] =
        useState(500000);

    const [tenure, setTenure] =
        useState(24);

    const monthlyRate = 10 / 12 / 100;

    const emi =
        (loanAmount *
            monthlyRate *
            Math.pow(
                1 + monthlyRate,
                tenure,
            )) /
        (Math.pow(
            1 + monthlyRate,
            tenure,
        ) -
            1);

    return (
        <main className="min-h-screen bg-slate-100 p-8">
            <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
                <h1 className="mb-8 text-4xl font-bold text-slate-950">
                    EMI Calculator
                </h1>

                <div className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Loan Amount
                        </label>

                        <input
                            type="range"
                            min={100000}
                            max={2000000}
                            step={50000}
                            value={loanAmount}
                            onChange={(e) =>
                                setLoanAmount(
                                    Number(e.target.value),
                                )
                            }
                            className="w-full accent-violet-600"
                        />

                        <p className="mt-2 font-semibold text-slate-900">
                            ₹{loanAmount}
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Tenure (Months)
                        </label>

                        <input
                            type="range"
                            min={6}
                            max={60}
                            step={6}
                            value={tenure}
                            onChange={(e) =>
                                setTenure(
                                    Number(e.target.value),
                                )
                            }
                            className="w-full accent-violet-600"
                        />

                        <p className="mt-2 font-semibold text-slate-900">
                            {tenure} months
                        </p>
                    </div>

                    <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-lg">
                        <p className="text-sm text-slate-400">
                            Estimated EMI
                        </p>

                        <p className="mt-2 text-4xl font-bold">
                            ₹{Math.round(emi)}
                        </p>
                    </div>

                </div>
            </div>
        </main>
    );
}