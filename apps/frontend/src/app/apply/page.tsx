'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';

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

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const allowNavRef = useRef(false);
  const pendingNavRef = useRef<null | { href?: string }>(null);
  const submittedRef = useRef(false);

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

    // Track FORM_STARTED once per lead in this browser
    try {
      const formStartedKey = `formStarted:${existingLeadId}`;
      if (!localStorage.getItem(formStartedKey)) {
        eventsService
          .createEvent({
            leadId: existingLeadId,
            eventType: 'FORM_STARTED',
          })
          .then(() => {
            try {
              localStorage.setItem(formStartedKey, '1');
            } catch {}
          })
          .catch(() => {});
      }
    } catch {}

    // beforeunload handler to mark abandoned forms and show native confirm
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      try {
        if (!submittedRef.current && existingLeadId) {
          const payload = JSON.stringify({ leadId: existingLeadId, eventType: 'FORM_ABANDONED' });

          const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
          const url = `${base}/events`;

          if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
            try {
              navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
            } catch {}
          } else if (typeof fetch !== 'undefined') {
            try {
              fetch(url, {
                method: 'POST',
                body: payload,
                headers: { 'Content-Type': 'application/json' },
                keepalive: true,
              }).catch(() => {});
            } catch {}
          } else {
            // best-effort async fallback
            eventsService.createEvent({ leadId: existingLeadId, eventType: 'FORM_ABANDONED' }).catch(() => {});
          }

          // show native leave confirmation
          e.preventDefault();
          // some browsers require assignment to returnValue
          e.returnValue = '';
        }
      } catch {}
    };

    // Intercept back/forward (popstate) to show confirmation for SPA navigation
    const handlePopState = () => {
      try {
        if (allowNavRef.current) return;
        if (submittedRef.current) {
          allowNavRef.current = true;
          history.back();
          return;
        }

        // block navigation and show modal
        history.pushState(null, '', location.href);
        pendingNavRef.current = { href: undefined };
        setShowLeaveModal(true);
      } catch {}
    };

    // Intercept anchor clicks within the app
    const handleDocumentClick = (ev: MouseEvent) => {
      try {
        if (submittedRef.current || allowNavRef.current) return;

        const target = ev.target as HTMLElement | null;
        const anchor = target?.closest && (target.closest('a') as HTMLAnchorElement | null);
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || anchor.target === '_blank') return;

        // same-origin internal navigation
        if (anchor.origin === location.origin) {
          ev.preventDefault();
          pendingNavRef.current = { href };
          setShowLeaveModal(true);
        }
      } catch {}
    };

    const handleAppAttemptNav = (ev: Event) => {
      try {
        if (submittedRef.current || allowNavRef.current) return;
        const custom = ev as CustomEvent<{ href?: string }>;
        const href = custom?.detail?.href;
        pendingNavRef.current = { href };
        try {
          history.pushState(null, '', location.href);
        } catch {}
        setShowLeaveModal(true);
      } catch {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('app:attemptNavigate', handleAppAttemptNav as EventListener);
    // Use capture phase so we intercept clicks before React/other handlers trigger navigation
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('app:attemptNavigate', handleAppAttemptNav as EventListener);
      document.removeEventListener('click', handleDocumentClick, true);
    };
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

  async function confirmLeave() {
    // send abandonment event and then allow navigation
    try {
      const leadIdLocal = leadId || localStorage.getItem('leadId');
      if (leadIdLocal) {
        try {
          await eventsService.createEvent({ leadId: leadIdLocal, eventType: 'FORM_ABANDONED' });
        } catch {
          try {
            const payload = JSON.stringify({ leadId: leadIdLocal, eventType: 'FORM_ABANDONED' });
            const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const url = `${base}/events`;
            if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
              try {
                navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
              } catch {}
            } else if (typeof fetch !== 'undefined') {
              try {
                fetch(url, {
                  method: 'POST',
                  body: payload,
                  headers: { 'Content-Type': 'application/json' },
                  keepalive: true,
                }).catch(() => {});
              } catch {}
            }
          } catch {}
        }
      }
    } catch {}

    setShowLeaveModal(false);
    allowNavRef.current = true;

    const pending = pendingNavRef.current;
    if (pending?.href) {
      location.href = pending.href;
    } else {
      history.back();
    }
  }

  function cancelLeave() {
    setShowLeaveModal(false);
    pendingNavRef.current = null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');

    if (!leadId) {
      router.push('/start');
      return;
    }

    const salaryValue = Number(formData.salary);
    const loanAmountValue = Number(formData.loanAmount);

    if (Number.isNaN(loanAmountValue) || loanAmountValue < 1000) {
      setSubmitError('Required loan amount must be at least 1000.');
      return;
    }

    if (Number.isNaN(salaryValue) || salaryValue < 0) {
      setSubmitError('Monthly salary must be a valid positive number.');
      return;
    }

    try {
      setLoading(true);

      const lead = await leadsService.updateLead(leadId, {
        salary: salaryValue,
        loanAmount: loanAmountValue,
        employmentType: formData.employmentType,
      });

      // mark submitted to avoid false abandonment
      submittedRef.current = true;

      await eventsService.createEvent({ leadId: lead.id, eventType: 'FORM_STARTED' });

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
        <h1 className="mb-8 text-4xl font-bold text-slate-950">Personal Loan Application</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Full Name"
            required
            value={formData.name}
            disabled={Boolean(leadId)}
            readOnly={Boolean(leadId)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <input
            type="text"
            placeholder="Phone Number"
            required
            value={formData.phone}
            disabled={Boolean(leadId)}
            readOnly={Boolean(leadId)}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <input
            type="number"
            placeholder="Monthly Salary"
            required
            value={formData.salary}
            min={0}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
          />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="mb-4 text-sm font-semibold text-slate-800">Employment Type</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 transition-shadow hover:shadow-sm">
                <input
                  type="radio"
                  name="employmentType"
                  value="SALARIED"
                  checked={formData.employmentType === 'SALARIED'}
                  onChange={() => setFormData({ ...formData, employmentType: 'SALARIED' })}
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
                  onChange={() => setFormData({ ...formData, employmentType: 'SELF_EMPLOYED' })}
                  className="h-4 w-4 accent-slate-900"
                />
                Business / Self-employed
              </label>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label className="text-sm font-semibold text-slate-800">Upload Income Proof</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
              onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading}
              className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
            {uploadMessage ? <p className="text-sm text-slate-600">{uploadMessage}</p> : null}
          </div>

          <input
            type="number"
            placeholder="Required Loan Amount"
            required
            value={formData.loanAmount}
            min={1000}
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
            onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
          />

          {submitError ? (
            <p className="text-sm font-medium text-red-600">{submitError}</p>
          ) : null}
          <button
            disabled={loading}
            className="w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Submitting...' : 'Continue'}
          </button>
        </form>

        {showLeaveModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-semibold">Leave form?</h3>
              <p className="mb-6 text-sm text-slate-600">You have not submitted the form. Leaving now will mark the form as abandoned. Are you sure you want to leave?</p>
              <div className="flex justify-end gap-3">
                <button onClick={cancelLeave} className="rounded-md border px-4 py-2">Stay</button>
                <button onClick={confirmLeave} className="rounded-md bg-red-600 px-4 py-2 text-white">Leave</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
