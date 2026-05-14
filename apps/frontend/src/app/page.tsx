import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="max-w-xl space-y-4">
              <p className="inline-flex rounded-full bg-violet-600/20 px-4 py-1 text-sm font-semibold text-violet-200">
                Intelligent digital lending
              </p>
              <h1 className="text-5xl font-bold leading-tight text-white sm:text-6xl">
                Loan and banking services built for modern customers.
              </h1>
              <p className="text-lg text-slate-300">
                LeadNexus brings fast approvals, transparent eligibility insights, and bank-grade security together in one modern loan platform.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/start"
                className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-500"
              >
                User Access
              </Link>

              <Link
                href="/admin/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Admin Access
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.2em] text-violet-200">
                  Fast approvals
                </p>
                <p className="mt-3 text-slate-200">
                  Unlock faster loan decisions with automated scoring and a user-first application flow.
                </p>
              </div>

              <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
                <p className="text-sm uppercase tracking-[0.2em] text-violet-200">
                  Secure banking
                </p>
                <p className="mt-3 text-slate-200">
                  Powered by secure bank integration, trusted workflows, and complete data transparency.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/5 p-10 ring-1 ring-white/10 shadow-2xl backdrop-blur-xl">
            <div className="space-y-6">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                  How LeadNexus works
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">
                  A clean workflow for applicants and bank teams.
                </h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-950/80 p-5">
                  <p className="text-sm font-semibold text-violet-200">1. Start your application</p>
                  <p className="mt-2 text-slate-300">Enter your details and see your loan eligibility instantly.</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-5">
                  <p className="text-sm font-semibold text-violet-200">2. Track progress</p>
                  <p className="mt-2 text-slate-300">Monitor every stage of your application from the dashboard.</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-5">
                  <p className="text-sm font-semibold text-violet-200">3. Get support</p>
                  <p className="mt-2 text-slate-300">Sales agents can follow up with recommended next steps and pending actions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
