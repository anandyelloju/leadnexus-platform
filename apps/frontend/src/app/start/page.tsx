'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { eventsService } from '@/services/events.service';
import { leadsService } from '@/services/leads.service';

export default function StartPage() {
  const router = useRouter();

  const [name, setName] = useState('');

  const [phone, setPhone] =
    useState('');

  const [otp, setOtp] = useState('');

  const [generatedOtp, setGeneratedOtp] =
    useState('');

  const [step, setStep] = useState<
    'FORM' | 'OTP'
  >('FORM');

  const [loading, setLoading] =
    useState(false);

  async function sendOtp() {
    if (!name || !phone) {
      alert('Please enter name and phone number');
      return;
    }

    const digits = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(digits)) {
      alert('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    // Generate a random 6-digit OTP and store it temporarily
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);
    sessionStorage.setItem('generatedOtp', otpCode);

    // For demo/development we show the OTP; in production this would be sent via SMS
    alert(`Your OTP is: ${otpCode}`);

    // Normalize phone in state to digits-only
    setPhone(digits);
    setStep('OTP');
  }

  async function verifyOtp() {
    try {
      setLoading(true);

      const saved = generatedOtp || sessionStorage.getItem('generatedOtp') || '';
      if (otp.trim() !== saved) {
        alert('Invalid OTP');
        return;
      }

      // Ensure phone is digits-only and valid before backend calls
      const digits = phone.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(digits)) {
        alert('Phone number is invalid. Please restart and enter a valid number.');
        return;
      }

      let lead = await leadsService.findLeadByPhone(digits);

      if (!lead) {
        lead = await leadsService.createLead({
          name,
          phone: digits,
          source: 'WEBSITE',
        });
      }

      localStorage.setItem(
        'leadId',
        lead.id,
      );

      localStorage.setItem('leadName', lead.name);
      localStorage.setItem('leadPhone', digits);

      await eventsService.createEvent({
        leadId: lead.id,
        eventType: 'OTP_VERIFIED',
      });

      router.push('/welcome');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md rounded-2xl border border-slate-300 bg-white p-10 shadow-2xl">
        <h1 className="mb-2 text-4xl font-bold text-slate-900">
          Start Your Loan Journey
        </h1>
        <p className="mb-8 text-slate-600">
          Quick and secure access to your loan application.
        </p>

        {step === 'FORM' ? (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="10-digit mobile number"
                className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
              />
            </div>

            <button
              onClick={sendOtp}
              className="mt-8 w-full rounded-lg bg-slate-900 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-slate-800"
            >
              Send OTP
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Enter OTP
              </label>
              <p className="mb-3 text-xs text-slate-500">
                Check the alert for your 6-digit OTP code
              </p>
              <input
                type="text"
                placeholder="6-digit OTP"
                maxLength={6}
                className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 text-base font-bold text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value)
                }
              />
            </div>

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="mt-8 w-full rounded-lg bg-slate-900 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Verifying...'
                : 'Verify OTP'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}