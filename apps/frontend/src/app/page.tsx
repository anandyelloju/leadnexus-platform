import Link from 'next/link';

const trustIndicators = [
  '256-bit encrypted',
  'Instant eligibility checks',
  'Trusted by 12,000+ users',
];

const processSteps = [
  {
    number: '01',
    title: 'Apply',
    description: 'Share a few essentials through a guided, secure application flow.',
  },
  {
    number: '02',
    title: 'Verification',
    description: 'LeadNexus validates eligibility signals and keeps every next step clear.',
  },
  {
    number: '03',
    title: 'Approval',
    description: 'Qualified applicants move into a transparent decision and follow-up process.',
  },
];

const featureCards = [
  {
    icon: 'A',
    title: 'Fast Approvals',
    description: 'Automated scoring helps applicants receive clearer lending decisions sooner.',
  },
  {
    icon: 'S',
    title: 'Bank-grade Security',
    description: 'Secure workflows, protected customer data, and controlled staff access.',
  },
  {
    icon: 'E',
    title: 'Real-time Eligibility',
    description: 'Eligibility insights surface early so applicants understand their options.',
  },
  {
    icon: 'V',
    title: 'Smart Verification',
    description: 'Structured checks reduce manual effort while preserving review quality.',
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#F8FAFC]">
        <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,#EFF6FF_0%,rgba(248,250,252,0)_100%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-8">
              <div className="max-w-[650px] space-y-5">
                <p className="inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                  Intelligent digital lending
                </p>
                <h1 className="text-4xl font-bold leading-[1.08] text-slate-950 sm:text-5xl lg:text-6xl">
                  Loan and banking services built for modern customers.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600">
                  LeadNexus brings fast approvals, transparent eligibility insights, and bank-grade security together in one trusted lending platform.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/start"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-700 px-6 text-sm font-semibold text-white shadow-sm shadow-blue-900/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                >
                  Apply for Loan
                </Link>

                <Link
                  href="/admin/login"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  Staff Portal
                </Link>
              </div>

              <div className="flex flex-col gap-3 text-sm font-medium text-slate-600 sm:flex-row sm:flex-wrap sm:items-center">
                {trustIndicators.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-50 ring-1 ring-green-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <section className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
              <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
                <div>
                  <p className="text-sm font-semibold uppercase text-blue-700">
                    How LeadNexus works
                  </p>
                  <h2 className="mt-3 max-w-md text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">
                    A clear workflow for applicants and bank teams.
                  </h2>
                </div>
                <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 sm:block">
                  Secure flow
                </div>
              </div>

              <div className="mt-8 space-y-2">
                {processSteps.map((step, index) => (
                  <div key={step.title} className="relative flex gap-4 rounded-2xl p-4 transition hover:bg-slate-50">
                    {index < processSteps.length - 1 && (
                      <span className="absolute left-8 top-14 h-10 w-px bg-slate-200" />
                    )}
                    <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Eligibility confidence</p>
                    <p className="mt-1 text-sm text-slate-600">Live applicant readiness score</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">94%</p>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-200">
                  <div className="h-2 w-[94%] rounded-full bg-green-600" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
          <div id="solutions" className="max-w-2xl scroll-mt-24">
            <p className="text-sm font-semibold uppercase text-blue-700">Platform capabilities</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950">
              Built for faster lending operations with financial-grade controls.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="flex min-h-56 flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/80"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700 ring-1 ring-blue-100">
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="scroll-mt-24 border-t border-slate-200 bg-slate-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-slate-700">LeadNexus supports secure lending journeys from application to decision.</p>
          <Link
            href="/start"
            className="inline-flex items-center font-semibold text-blue-700 transition hover:text-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            Request a callback
          </Link>
        </div>
      </section>
    </main>
  );
}
