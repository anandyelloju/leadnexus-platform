import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-32 text-center">
        <h1 className="max-w-4xl text-5xl font-bold leading-tight text-white">
          Instant Personal Loans
          Powered by Intelligent Banking
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300">
          Get personalized loan offers with
          faster approvals and AI-assisted
          support.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/apply"
            className="rounded-2xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-violet-500"
          >
            Apply Now
          </Link>

          <Link
            href="/emi-calculator"
            className="rounded-2xl border border-white/20 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Calculate EMI
          </Link>
        </div>
      </section>
    </main>
  );
}