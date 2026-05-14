'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // These should match your .env.local values
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

        if (email === adminEmail && password === adminPassword) {
            localStorage.setItem('isAdmin', 'true');
            router.push('/dashboard');
        } else {
            setError('Invalid admin credentials');
        }
    };

    return (
        <main className="flex min-h-[80vh] items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
                    <p className="text-slate-500">Sign in to manage loan leads</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                            placeholder="admin@leadnexus.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-sm font-medium text-red-600">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-slate-900 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </main>
    );
}