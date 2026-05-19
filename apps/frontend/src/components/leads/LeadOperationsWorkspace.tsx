'use client';

import { useMemo, useState } from 'react';

type ChipTone = 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'violet';
type EventCategory = 'all' | 'verification' | 'engagement' | 'callback' | 'risk' | 'application';

interface LeadScore {
  intentScore?: number;
  eligibilityScore?: number;
  engagementScore?: number;
  riskScore?: number;
  finalScore?: number;
}

interface LeadEvent {
  id: string;
  eventType: string;
  metadata?: unknown;
  createdAt: string;
}

interface LeadAction {
  id: string;
  actionType: string;
  status: string;
  reason?: string;
  generatedBy?: string;
  createdAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  currentStage?: string;
  assignedTo?: string;
  salary?: number;
  loanAmount?: number;
  employmentType?: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
  scores?: LeadScore | null;
  events?: LeadEvent[];
  actions?: LeadAction[];
}

interface Props {
  lead: Lead;
}

interface EventDefinition {
  label: string;
  category: Exclude<EventCategory, 'all'>;
  icon: string;
  tone: ChipTone;
  severity: 'low' | 'medium' | 'high';
}

interface SessionGroup {
  id: string;
  title: string;
  category: Exclude<EventCategory, 'all'>;
  icon: string;
  tone: ChipTone;
  severity: 'low' | 'medium' | 'high';
  events: LeadEvent[];
  latestAt: string;
}

const chipToneClasses: Record<ChipTone, string> = {
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-rose-200 bg-rose-50 text-rose-700',
  slate: 'border-slate-200 bg-slate-50 text-slate-600',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
};

const eventDefinitions: Record<string, EventDefinition> = {
  LANDING_PAGE_VIEWED: {
    label: 'Landing Page Viewed',
    category: 'engagement',
    icon: 'LP',
    tone: 'blue',
    severity: 'low',
  },
  LOAN_PAGE_VIEWED: {
    label: 'Loan Page Viewed',
    category: 'engagement',
    icon: 'LN',
    tone: 'blue',
    severity: 'low',
  },
  EMI_CALCULATOR_USED: {
    label: 'EMI Calculator Used',
    category: 'engagement',
    icon: 'EMI',
    tone: 'violet',
    severity: 'medium',
  },
  SALARY_ENTERED: {
    label: 'Salary Entered',
    category: 'application',
    icon: 'INR',
    tone: 'green',
    severity: 'medium',
  },
  OTP_VERIFIED: {
    label: 'OTP Verified',
    category: 'verification',
    icon: 'OTP',
    tone: 'green',
    severity: 'medium',
  },
  FORM_STARTED: {
    label: 'Application Started',
    category: 'application',
    icon: 'APP',
    tone: 'green',
    severity: 'medium',
  },
  FORM_ABANDONED: {
    label: 'Application Abandoned',
    category: 'risk',
    icon: 'RISK',
    tone: 'red',
    severity: 'high',
  },
  DOCUMENT_UPLOADED: {
    label: 'Document Uploaded',
    category: 'verification',
    icon: 'DOC',
    tone: 'green',
    severity: 'medium',
  },
  CALLBACK_REQUESTED: {
    label: 'Callback Requested',
    category: 'callback',
    icon: 'CALL',
    tone: 'amber',
    severity: 'high',
  },
};

const filters: Array<{ id: EventCategory; label: string }> = [
  { id: 'all', label: 'All Activity' },
  { id: 'verification', label: 'Verification' },
  { id: 'engagement', label: 'EMI & Engagement' },
  { id: 'callback', label: 'Callback' },
  { id: 'risk', label: 'Risk Signals' },
  { id: 'application', label: 'Application' },
];

function getEventDefinition(eventType: string): EventDefinition {
  return eventDefinitions[eventType] ?? {
    label: titleize(eventType),
    category: 'engagement',
    icon: 'ACT',
    tone: 'slate',
    severity: 'low',
  };
}

function titleize(value?: string) {
  if (!value) return 'Not Available';
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value?: string) {
  if (!value) return 'No activity';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatRelative(value?: string) {
  if (!value) return 'No activity recorded';
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function formatCurrency(value?: number) {
  if (!value) return 'Not captured';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function getScore(lead: Lead) {
  return lead.scores?.finalScore ?? 0;
}

function getHeat(score: number) {
  if (score >= 90) return { label: 'HOT', tone: 'red' as ChipTone, probability: 92, risk: 'Moderate' };
  if (score >= 70) return { label: 'QUALIFIED', tone: 'green' as ChipTone, probability: 78, risk: 'Low' };
  if (score >= 50) return { label: 'HIGH_INTENT', tone: 'amber' as ChipTone, probability: 61, risk: 'Moderate' };
  if (score >= 25) return { label: 'ENGAGED', tone: 'blue' as ChipTone, probability: 42, risk: 'Watch' };
  return { label: 'NEW', tone: 'slate' as ChipTone, probability: 24, risk: 'Unknown' };
}

function groupEvents(events: LeadEvent[] = []) {
  const groups = new Map<string, SessionGroup>();

  events.forEach((event) => {
    const definition = getEventDefinition(event.eventType);
    const day = new Date(event.createdAt).toDateString();
    const key = `${day}-${event.eventType}`;
    const existing = groups.get(key);

    if (existing) {
      existing.events.push(event);
      if (new Date(event.createdAt) > new Date(existing.latestAt)) {
        existing.latestAt = event.createdAt;
      }
      return;
    }

    groups.set(key, {
      id: key,
      title: definition.label,
      category: definition.category,
      icon: definition.icon,
      tone: definition.tone,
      severity: definition.severity,
      events: [event],
      latestAt: event.createdAt,
    });
  });

  return Array.from(groups.values()).sort(
    (a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime(),
  );
}

function StatusChip({
  label,
  tone = 'slate',
}: {
  label: string;
  tone?: ChipTone;
}) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase leading-4 ${chipToneClasses[tone]}`}>
      {label}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone = 'slate',
}: {
  label: string;
  value: string;
  detail: string;
  tone?: ChipTone;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-normal text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${tone === 'red' ? 'bg-rose-500' : tone === 'amber' ? 'bg-amber-500' : tone === 'green' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
        <p className="text-xs font-medium text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function LeadHeader({
  lead,
  heat,
  lastActivity,
}: {
  lead: Lead;
  heat: ReturnType<typeof getHeat>;
  lastActivity?: string;
}) {
  const score = getScore(lead);

  return (
    <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip label={heat.label} tone={heat.tone} />
            <StatusChip label={lead.currentStage ?? 'NEW'} tone="blue" />
            {lead.assignedTo ? <StatusChip label="ASSIGNED" tone="green" /> : <StatusChip label="UNASSIGNED" tone="amber" />}
          </div>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">{lead.name}</h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">{lead.phone}</p>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-4">
          <MetricCard label="Lead Score" value={`${score} / 100`} detail="Behavior weighted" tone={heat.tone} />
          <MetricCard label="Conversion" value={`${heat.probability}%`} detail="AI confidence" tone="green" />
          <MetricCard label="Risk Level" value={heat.risk} detail="Operational watch" tone={heat.risk === 'Low' ? 'green' : 'amber'} />
          <MetricCard label="Last Activity" value={formatRelative(lastActivity)} detail={formatDateTime(lastActivity)} tone="blue" />
        </div>
      </div>
    </section>
  );
}

function LeadProfileRail({
  lead,
  heat,
}: {
  lead: Lead;
  heat: ReturnType<typeof getHeat>;
}) {
  return (
    <aside className="space-y-3">
      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-950">Lead Profile</h2>
          <StatusChip label="VERIFIED" tone="green" />
        </div>

        <dl className="mt-3 grid gap-2 text-sm">
          {[
            ['Stage', titleize(lead.currentStage)],
            ['Source', titleize(lead.source)],
            ['Employment', titleize(lead.employmentType)],
            ['Salary', formatCurrency(lead.salary)],
            ['Loan Amount', formatCurrency(lead.loanAmount)],
            ['Advisor', lead.assignedTo ?? 'Unassigned'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
              <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
              <dd className="text-right text-xs font-bold text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="text-sm font-bold text-slate-950">Lead Quality Score</h2>
        <div className="mt-3">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black text-slate-950">{getScore(lead)}</span>
            <span className="text-xs font-bold text-slate-500">/ 100</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-700"
              style={{ width: `${Math.min(getScore(lead), 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-600">{heat.probability}% conversion probability</p>
        </div>

        <div className="mt-3 grid gap-2">
          {[
            ['Intent', lead.scores?.intentScore ?? 0, 'blue'],
            ['Eligibility', lead.scores?.eligibilityScore ?? 0, 'green'],
            ['Engagement', lead.scores?.engagementScore ?? 0, 'violet'],
            ['Risk', lead.scores?.riskScore ?? 0, 'amber'],
          ].map(([label, value, tone]) => (
            <div key={label} className="grid grid-cols-[78px_1fr_34px] items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">{label}</span>
              <div className="h-1.5 rounded-full bg-slate-100">
                <div
                  className={`h-1.5 rounded-full ${tone === 'green' ? 'bg-emerald-500' : tone === 'violet' ? 'bg-violet-500' : tone === 'amber' ? 'bg-amber-500' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(Number(value), 100)}%` }}
                />
              </div>
              <span className="text-right text-xs font-bold text-slate-700">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="text-sm font-bold text-slate-950">Quick Actions</h2>
        <div className="mt-3 grid gap-2">
          {['Assign Advisor', 'Schedule Callback', 'Verify Documents', 'Change Lead Stage', 'Mark as Converted'].map((action, index) => (
            <button
              key={action}
              type="button"
              className={index === 0
                ? 'rounded-md bg-slate-950 px-3 py-2 text-left text-xs font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300'
                : 'rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-xs font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-100'}
            >
              {action}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-950">Workflow Queue</h2>
          <StatusChip label={`${lead.actions?.length ?? 0} tasks`} tone="amber" />
        </div>
        <div className="mt-3 grid gap-2">
          {(lead.actions ?? []).length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-500">
              No pending operational actions.
            </div>
          ) : (lead.actions ?? []).slice(0, 4).map((action) => (
            <article key={action.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-black text-slate-800">{titleize(action.actionType)}</h3>
                <StatusChip
                  label={action.status}
                  tone={action.status === 'COMPLETED' ? 'green' : action.status === 'CANCELLED' ? 'red' : 'amber'}
                />
              </div>
              {action.reason ? (
                <p className="mt-1 text-xs font-medium leading-5 text-slate-600">{action.reason}</p>
              ) : null}
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                {action.generatedBy ? `Generated by ${titleize(action.generatedBy)}` : 'System generated'}
              </p>
            </article>
          ))}
        </div>
      </section>
    </aside>
  );
}

function Timeline({
  groups,
  activeFilter,
  onFilterChange,
}: {
  groups: SessionGroup[];
  activeFilter: EventCategory;
  onFilterChange: (filter: EventCategory) => void;
}) {
  const visibleGroups = activeFilter === 'all'
    ? groups
    : groups.filter((group) => group.category === activeFilter);

  return (
    <section className="min-h-0 rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-950">Behavior Journey</h2>
            <p className="text-xs font-medium text-slate-500">Grouped sessions, categorized signals, operationally readable activity.</p>
          </div>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Timeline filters">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => onFilterChange(filter.id)}
                className={activeFilter === filter.id
                  ? 'rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100'
                  : 'rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100'}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ol className="max-h-[calc(100vh-260px)] space-y-2 overflow-y-auto px-4 py-3">
        {visibleGroups.length === 0 ? (
          <li className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-500">
            No activity in this category yet.
          </li>
        ) : visibleGroups.map((group) => (
          <li key={group.id} className="relative rounded-lg border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-start gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-[10px] font-black ${chipToneClasses[group.tone]}`}>
                {group.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-950">{group.title}</h3>
                  <StatusChip label={group.category} tone={group.tone} />
                  {group.severity === 'high' ? <StatusChip label="priority" tone="red" /> : null}
                </div>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {group.events.length > 1 ? `${group.events.length} sessions today` : 'Single interaction'} | Latest {formatRelative(group.latestAt)}
                </p>
                {group.events.length > 1 ? (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-bold text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100">
                      View repeated interactions
                    </summary>
                    <div className="mt-2 grid gap-1.5">
                      {group.events.map((event) => (
                        <p key={event.id} className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500">
                          {formatDateTime(event.createdAt)}
                        </p>
                      ))}
                    </div>
                  </details>
                ) : null}
              </div>
              <time className="shrink-0 text-right text-xs font-bold text-slate-500" dateTime={group.latestAt}>
                {formatDateTime(group.latestAt)}
              </time>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function IntelligenceRail({
  lead,
  heat,
  groups,
}: {
  lead: Lead;
  heat: ReturnType<typeof getHeat>;
  groups: SessionGroup[];
}) {
  const hasCallback = groups.some((group) => group.category === 'callback');
  const hasEmi = groups.some((group) => group.title.includes('EMI'));
  const hasVerification = groups.some((group) => group.category === 'verification');
  const hasRisk = groups.some((group) => group.category === 'risk');
  const score = getScore(lead);

  const insights = [
    hasCallback ? 'High callback intent detected' : 'Callback intent not yet explicit',
    hasEmi ? 'Repeated EMI interactions observed' : 'EMI intent signal is still developing',
    score >= 70 ? 'Strong loan eligibility likelihood' : 'Eligibility needs advisor validation',
    hasRisk ? 'Moderate fraud or abandonment risk detected' : 'No elevated behavioral risk signal',
  ];

  return (
    <aside className="space-y-3">
      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-950">AI Lead Insights</h2>
          <StatusChip label={`${heat.probability}% confident`} tone="green" />
        </div>
        <div className="mt-3 grid gap-2">
          {insights.map((insight, index) => (
            <div key={insight} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex items-start gap-2">
                <span className={`mt-1 h-2 w-2 rounded-full ${index === 0 ? 'bg-amber-500' : index === 3 && hasRisk ? 'bg-rose-500' : 'bg-blue-600'}`} />
                <p className="text-xs font-semibold leading-5 text-slate-700">{insight}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-[11px] font-bold uppercase text-blue-700">Recommended Action</p>
          <p className="mt-1 text-sm font-black text-slate-950">
            {hasCallback || score >= 70 ? 'Assign advisor immediately' : 'Nurture with verification follow-up'}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="text-sm font-bold text-slate-950">SLA & Follow-Up</h2>
        <div className="mt-3 grid gap-2">
          <SlaCard label="Callback SLA" value={hasCallback ? 'Overdue by 2h' : 'No request'} tone={hasCallback ? 'red' : 'slate'} />
          <SlaCard label="Last Contact" value={formatRelative(lead.updatedAt ?? lead.createdAt)} tone="amber" />
          <SlaCard label="Verification" value={hasVerification ? 'Complete' : 'Pending'} tone={hasVerification ? 'green' : 'amber'} />
        </div>
      </section>

      <InternalNotes />
    </aside>
  );
}

function SlaCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: ChipTone;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <StatusChip label={value} tone={tone} />
    </div>
  );
}

function InternalNotes() {
  const [notes, setNotes] = useState([
    {
      id: 'initial-underwriting-note',
      author: 'Ops Analyst',
      text: 'Review affordability and confirm preferred callback window before stage movement.',
      createdAt: 'Today, 10:20',
    },
  ]);
  const [draft, setDraft] = useState('');

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="text-sm font-bold text-slate-950">Internal Notes</h2>
      <div className="mt-3 grid gap-2">
        {notes.map((note) => (
          <article key={note.id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-800">{note.author}</p>
              <p className="text-[11px] font-semibold text-slate-500">{note.createdAt}</p>
            </div>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-600">{note.text}</p>
          </article>
        ))}
      </div>
      <label className="mt-3 block text-xs font-bold uppercase text-slate-500" htmlFor="internal-note">
        Add underwriting note
      </label>
      <textarea
        id="internal-note"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="mt-1 min-h-20 w-full resize-none rounded-md border border-slate-200 bg-white p-2 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        placeholder="Advisor notes, verification remarks, underwriting observations"
      />
      <button
        type="button"
        onClick={() => {
          const trimmed = draft.trim();
          if (!trimmed) return;
          setNotes((current) => [
            {
              id: `${Date.now()}`,
              author: 'Current User',
              text: trimmed,
              createdAt: 'Just now',
            },
            ...current,
          ]);
          setDraft('');
        }}
        className="mt-2 w-full rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
      >
        Add Internal Note
      </button>
    </section>
  );
}

export default function LeadOperationsWorkspace({
  lead,
}: Props) {
  const [activeFilter, setActiveFilter] = useState<EventCategory>('all');
  const groups = useMemo(() => groupEvents(lead.events ?? []), [lead.events]);
  const lastActivity = groups[0]?.latestAt ?? lead.updatedAt ?? lead.createdAt;
  const heat = getHeat(getScore(lead));

  return (
    <main className="min-h-[calc(100vh-57px)] bg-slate-100 px-3 py-3 text-slate-900 sm:px-4">
      <div className="mx-auto grid max-w-[1600px] gap-3 xl:max-h-[calc(100vh-81px)] xl:grid-rows-[auto_minmax(0,1fr)]">
        <LeadHeader lead={lead} heat={heat} lastActivity={lastActivity} />

        <section className="grid min-h-0 gap-3 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[292px_minmax(0,1fr)_340px]">
          <LeadProfileRail lead={lead} heat={heat} />
          <Timeline groups={groups} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <IntelligenceRail lead={lead} heat={heat} groups={groups} />
        </section>
      </div>
    </main>
  );
}
