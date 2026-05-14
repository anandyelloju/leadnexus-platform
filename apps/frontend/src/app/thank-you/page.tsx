import Link from 'next/link';

export default function ThankYouPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
            <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xl">
                <h1 className="text-5xl font-bold text-slate-950">
                    Thank You!
                </h1>

                <p className="mt-4 text-lg text-slate-700">
                    Our loan team will contact you
                    shortly.
                </p>

                <Link
                    href="/welcome"
                    className="mt-8 inline-block rounded-2xl bg-black px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                    Go back to Home
                </Link>
            </div>
        </main>
    );
}