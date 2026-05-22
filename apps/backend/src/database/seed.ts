import 'dotenv/config';

import { PrismaClient, LeadStage, ActionStatus, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const LEAD_COUNT = Number(process.env.SEED_LEAD_COUNT || 120);
const SEED_ANCHOR = new Date('2026-05-22T09:30:00+05:30');

type LifecycleSegment =
  | 'CONVERTED'
  | 'APPROVED'
  | 'UNDER_REVIEW'
  | 'VERIFICATION_PENDING'
  | 'HIGH_RISK'
  | 'CALLBACK_PENDING'
  | 'DROPPED';

type RiskBand = 'low' | 'moderate' | 'high' | 'critical';
type Urgency = 'low' | 'medium' | 'high' | 'critical';
type VerificationState = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NEEDS_REVIEW';
type CallbackState =
  | 'PENDING'
  | 'COMPLETED'
  | 'MISSED'
  | 'OVERDUE'
  | 'NOT_REQUESTED';

interface LeadProfile {
  index: number;
  name: string;
  phone: string;
  salary: number;
  employmentType: string;
  loanAmount: number;
  loanPurpose: string;
  source: string;
  city: string;
  region: string;
  bureauScore: number;
  requestedTenureMonths: number;
}

interface TimelineEvent {
  eventType: string;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

interface VerificationChecklist {
  salaryVerified: boolean;
  documentsUploaded: boolean;
  identityVerified: boolean;
  callbackCompleted: boolean;
  eligibilityReviewed: boolean;
}

interface DocumentUpload {
  documentType: string;
  uploadedAt?: string;
  verificationState: VerificationState;
}

interface CallbackWorkflow {
  state: CallbackState;
  requestedAt?: string;
  scheduledAt?: string;
  completedAt?: string;
  missedAt?: string;
  attempts: number;
  owner: string;
}

interface RiskSignals {
  highIntent: boolean;
  fraudRisk: RiskBand;
  conversionProbability: number;
  callbackUrgency: Urgency;
  slaBreachRisk: boolean;
  recommendation: string;
  recommendationConfidence: number;
  applicationCompletion: number;
}

interface LeadScores {
  intentScore: number;
  eligibilityScore: number;
  engagementScore: number;
  riskScore: number;
  finalScore: number;
}

interface GeneratedLead {
  profile: LeadProfile;
  segment: LifecycleSegment;
  currentStage: LeadStage;
  operationalStage: string;
  createdAt: Date;
  events: TimelineEvent[];
  verification: VerificationChecklist;
  documents: DocumentUpload[];
  callback: CallbackWorkflow;
  signals: RiskSignals;
  scores: LeadScores;
}

class SeedRandom {
  private value: number;

  constructor(seed: number) {
    this.value = seed;
  }

  next() {
    this.value = (this.value * 1664525 + 1013904223) % 4294967296;
    return this.value / 4294967296;
  }

  int(min: number, max: number) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  bool(probability = 0.5) {
    return this.next() < probability;
  }
}

const rng = new SeedRandom(20260522);

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const firstNames = [
  'Aarav',
  'Vivaan',
  'Aditya',
  'Arjun',
  'Rohan',
  'Kabir',
  'Ishaan',
  'Ananya',
  'Diya',
  'Priya',
  'Sneha',
  'Kavya',
  'Meera',
  'Nisha',
  'Amit',
  'Rahul',
  'Vikram',
  'Sanjay',
  'Neha',
  'Pooja',
  'Anjali',
  'Kiran',
  'Suresh',
  'Deepak',
  'Fatima',
  'Ayesha',
  'Ritika',
  'Manish',
  'Gaurav',
  'Harsha',
];

const lastNames = [
  'Sharma',
  'Patel',
  'Reddy',
  'Nair',
  'Iyer',
  'Kapoor',
  'Mehta',
  'Joshi',
  'Gupta',
  'Singh',
  'Verma',
  'Rao',
  'Das',
  'Khan',
  'Mishra',
  'Pillai',
  'Chatterjee',
  'Bose',
  'Kulkarni',
  'Malhotra',
];

const cities = [
  ['Bengaluru', 'South'],
  ['Mumbai', 'West'],
  ['Pune', 'West'],
  ['Delhi NCR', 'North'],
  ['Hyderabad', 'South'],
  ['Chennai', 'South'],
  ['Ahmedabad', 'West'],
  ['Kolkata', 'East'],
  ['Jaipur', 'North'],
  ['Kochi', 'South'],
  ['Lucknow', 'North'],
  ['Indore', 'Central'],
];

const advisors = [
  { name: 'Riya Menon', language: 'English/Hindi', region: 'South' },
  { name: 'Kabir Sethi', language: 'Hindi/English', region: 'North' },
  { name: 'Sneha Rao', language: 'Kannada/English', region: 'South' },
  { name: 'Aman Verma', language: 'Hindi/English', region: 'West' },
  { name: 'Nandita Bose', language: 'Bengali/Hindi', region: 'East' },
  { name: 'Prakash Iyer', language: 'Tamil/English', region: 'South' },
];

const loanPurposes = [
  'Debt consolidation',
  'Home renovation',
  'Medical expense',
  'Business working capital',
  'Education fees',
  'Wedding expense',
  'Vehicle upgrade',
  'Travel and relocation',
  'Credit card refinance',
];

const sources = [
  'Google Search',
  'Meta Ads',
  'Partner Marketplace',
  'Referral',
  'Branch Assisted',
  'WhatsApp Campaign',
  'Organic Web',
  'Credit Bureau Offer',
];

const employmentTypes = [
  'Salaried',
  'Self-employed',
  'Business Owner',
  'Freelancer',
];

const noteTemplates = {
  hot: [
    'High engagement observed. Recommend priority callback with tenure options.',
    'Customer compared EMI multiple times and asked about prepayment charges.',
    'Strong eligibility profile. Keep approval path fast and reduce repeat data entry.',
  ],
  review: [
    'Additional salary proof required before final underwriting.',
    'Manual verification required for income mismatch against bank statement.',
    'Employment details need confirmation with latest salary credit.',
  ],
  callback: [
    'Customer requested lower EMI option and evening callback.',
    'Missed first outbound attempt. Retry before SLA window closes.',
    'Customer asked for documentation checklist over WhatsApp.',
  ],
  risk: [
    'Repeated OTP failures detected. Manual identity verification recommended.',
    'Device and phone pattern require fraud operations review.',
    'Application velocity is unusual compared with normal acquisition flow.',
  ],
  dropped: [
    'Session abandoned after eligibility page. Add to low-pressure nurture.',
    'No response after document checklist. Re-engage after cooling period.',
    'Customer paused application after reviewing EMI estimate.',
  ],
};

function pick<T>(items: T[]) {
  return items[rng.int(0, items.length - 1)];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addHours(date: Date, hours: number) {
  return addMinutes(date, hours * 60);
}

function addDays(date: Date, days: number) {
  return addHours(date, days * 24);
}

function currencyStep(min: number, max: number, step: number) {
  const steps = Math.floor((max - min) / step);
  return min + rng.int(0, steps) * step;
}

function buildLifecyclePlan(total: number): LifecycleSegment[] {
  const distribution: Array<[LifecycleSegment, number]> = [
    ['CONVERTED', 0.15],
    ['APPROVED', 0.2],
    ['UNDER_REVIEW', 0.2],
    ['VERIFICATION_PENDING', 0.15],
    ['HIGH_RISK', 0.1],
    ['CALLBACK_PENDING', 0.1],
    ['DROPPED', 0.1],
  ];

  const planned = distribution.flatMap(([segment, ratio]) =>
    Array.from({ length: Math.floor(total * ratio) }, () => segment),
  );

  while (planned.length < total) {
    planned.push(distribution[planned.length % distribution.length][0]);
  }

  for (let i = planned.length - 1; i > 0; i -= 1) {
    const swapIndex = rng.int(0, i);
    [planned[i], planned[swapIndex]] = [planned[swapIndex], planned[i]];
  }

  return planned;
}

function generateRandomPhone(index: number) {
  const prefix = pick([
    '98',
    '97',
    '96',
    '95',
    '94',
    '93',
    '89',
    '88',
    '87',
    '86',
  ]);
  return `${prefix}${String(26000000 + index * 137 + rng.int(10, 99)).slice(0, 8)}`;
}

function generateLeadProfile(
  index: number,
  segment: LifecycleSegment,
): LeadProfile {
  const [city, region] = pick(cities);
  const employmentType = pick(employmentTypes);
  const salaryFloor = employmentType === 'Freelancer' ? 25000 : 35000;
  const salaryCeiling = employmentType === 'Business Owner' ? 300000 : 240000;
  const salary = currencyStep(salaryFloor, salaryCeiling, 5000);
  const loanAmount = currencyStep(50000, 2500000, 25000);
  const name = `${pick(firstNames)} ${pick(lastNames)}`;
  const riskPenalty = segment === 'HIGH_RISK' ? rng.int(80, 180) : 0;
  const bureauScore = clamp(rng.int(610, 835) - riskPenalty, 420, 835);

  return {
    index,
    name,
    phone: generateRandomPhone(index),
    salary,
    employmentType,
    loanAmount,
    loanPurpose: pick(loanPurposes),
    source: pick(sources),
    city,
    region,
    bureauScore,
    requestedTenureMonths: pick([12, 18, 24, 36, 48, 60]),
  };
}

function generateLeadStage(
  segment: LifecycleSegment,
  scoreHint: number,
): LeadStage {
  if (segment === 'CONVERTED') {
    return LeadStage.CONVERTED;
  }

  if (segment === 'DROPPED' || segment === 'HIGH_RISK') {
    return LeadStage.DROPPED;
  }

  if (segment === 'APPROVED') {
    return scoreHint > 330 ? LeadStage.HOT : LeadStage.QUALIFIED;
  }

  if (segment === 'CALLBACK_PENDING') {
    return scoreHint > 260 ? LeadStage.HOT : LeadStage.INTERESTED;
  }

  if (segment === 'UNDER_REVIEW') {
    return rng.bool(0.55) ? LeadStage.APPLICATION_STARTED : LeadStage.QUALIFIED;
  }

  if (segment === 'VERIFICATION_PENDING') {
    return LeadStage.APPLICATION_STARTED;
  }

  return LeadStage.ENGAGED;
}

function operationalStageFor(segment: LifecycleSegment) {
  const stageMap: Record<LifecycleSegment, string> = {
    CONVERTED: 'CONVERTED',
    APPROVED: 'APPROVED',
    UNDER_REVIEW: 'UNDER_REVIEW',
    VERIFICATION_PENDING: 'DOCUMENTS_PENDING',
    HIGH_RISK: 'REJECTED',
    CALLBACK_PENDING: 'HOT',
    DROPPED: 'SESSION_ABANDONED',
  };

  return stageMap[segment];
}

function event(
  events: TimelineEvent[],
  cursor: Date,
  eventType: string,
  metadata: Record<string, unknown> = {},
) {
  const createdAt = addMinutes(cursor, rng.int(3, 180));
  events.push({
    eventType,
    createdAt,
    metadata,
  });

  return createdAt;
}

function generateLeadEvents(
  profile: LeadProfile,
  segment: LifecycleSegment,
  createdAt: Date,
) {
  const events: TimelineEvent[] = [];
  let cursor = createdAt;
  const sessionId = `sess_${profile.index}_${rng.int(1000, 9999)}`;

  cursor = event(events, cursor, 'LANDING_PAGE_VIEWED', {
    source: profile.source,
    city: profile.city,
    sessionId,
    device: pick([
      'Android Chrome',
      'iPhone Safari',
      'Desktop Chrome',
      'Mobile WebView',
    ]),
  });

  if (rng.bool(0.75)) {
    cursor = event(events, cursor, 'START_PAGE_OPENED', {
      sessionId,
      campaignIntent: segment === 'DROPPED' ? 'research' : 'loan_discovery',
    });
  }

  cursor = event(events, cursor, 'EMI_CALCULATOR_USED', {
    loanAmount: profile.loanAmount,
    tenureMonths: profile.requestedTenureMonths,
    interestRate: Number((rng.int(109, 189) / 10).toFixed(1)),
    estimatedEmi: Math.round(
      profile.loanAmount / profile.requestedTenureMonths +
        profile.loanAmount * 0.011,
    ),
  });

  const emiRecalculations =
    segment === 'CONVERTED' ||
    segment === 'APPROVED' ||
    segment === 'CALLBACK_PENDING'
      ? rng.int(1, 4)
      : rng.int(0, 2);

  for (let i = 0; i < emiRecalculations; i += 1) {
    cursor = event(events, cursor, 'EMI_RECALCULATED', {
      tenureMonths: pick([18, 24, 36, 48, 60]),
      revisedLoanAmount: clamp(
        profile.loanAmount + currencyStep(-100000, 200000, 25000),
        50000,
        2500000,
      ),
    });
  }

  if (segment === 'DROPPED') {
    cursor = event(events, cursor, 'SESSION_ABANDONED', {
      reason: pick([
        'emi_too_high',
        'document_list_viewed',
        'no_otp_attempt',
        'rate_comparison',
      ]),
      sessionDurationSeconds: rng.int(120, 900),
    });
    return events;
  }

  if (segment === 'HIGH_RISK') {
    cursor = event(events, cursor, 'OTP_REQUESTED', { channel: 'sms' });
    cursor = event(events, cursor, 'OTP_FAILED', {
      attempt: 1,
      failureReason: 'incorrect_code',
    });
    cursor = event(events, cursor, 'OTP_FAILED', {
      attempt: 2,
      failureReason: 'incorrect_code',
    });
    cursor = event(events, cursor, 'OTP_FAILED', {
      attempt: 3,
      failureReason: 'velocity_limit',
    });
    cursor = event(events, cursor, 'SUSPICIOUS_ACTIVITY_FLAGGED', {
      signal: pick([
        'otp_velocity',
        'device_mismatch',
        'phone_reused',
        'income_inconsistency',
      ]),
      fraudQueue: 'manual_review',
    });
    return events;
  }

  cursor = event(events, cursor, 'SALARY_ENTERED', {
    salary: profile.salary,
    employmentType: profile.employmentType,
  });

  cursor = event(events, cursor, 'OTP_VERIFIED', {
    channel: 'sms',
    latencySeconds: rng.int(18, 140),
  });

  if (
    segment === 'CALLBACK_PENDING' ||
    segment === 'APPROVED' ||
    segment === 'CONVERTED'
  ) {
    cursor = event(events, cursor, 'CALLBACK_REQUESTED', {
      preferredSlot: pick([
        '10:00-12:00',
        '12:00-15:00',
        '15:00-18:00',
        '18:00-20:00',
      ]),
      requestedTopic: pick([
        'interest_rate',
        'loan_amount',
        'documents',
        'emi_reduction',
      ]),
    });
    cursor = event(events, cursor, 'ADVISOR_ASSIGNED', {
      advisor: pick(advisors).name,
      assignmentReason: 'intent_threshold_crossed',
    });
  }

  if (segment === 'CALLBACK_PENDING') {
    return events;
  }

  cursor = event(
    events,
    addHours(cursor, rng.int(2, 30)),
    'APPLICATION_STARTED',
    {
      applicationId: `LN-${String(profile.index).padStart(5, '0')}`,
      loanPurpose: profile.loanPurpose,
    },
  );

  if (segment !== 'VERIFICATION_PENDING' || rng.bool(0.65)) {
    cursor = event(events, cursor, 'APPLICATION_SUBMITTED', {
      completionPercentage:
        segment === 'VERIFICATION_PENDING' ? rng.int(55, 82) : rng.int(86, 100),
    });
  }

  const documentsToUpload =
    segment === 'VERIFICATION_PENDING'
      ? rng.int(1, 3)
      : segment === 'UNDER_REVIEW'
        ? rng.int(2, 4)
        : 4;

  const documentTypes = ['PAN', 'Aadhaar', 'Bank Statement', 'Salary Slip'];
  for (let i = 0; i < documentsToUpload; i += 1) {
    cursor = event(
      events,
      addHours(cursor, rng.int(1, 16)),
      'DOCUMENT_UPLOADED',
      {
        documentType: documentTypes[i],
        fileQuality: pick(['clear', 'clear', 'cropped', 'low_contrast']),
      },
    );
  }

  if (segment === 'VERIFICATION_PENDING') {
    cursor = event(events, addHours(cursor, rng.int(6, 40)), 'NOTE_ADDED', {
      note: 'Documents pending before verification can proceed.',
      staff: pick(advisors).name,
    });
    return events;
  }

  cursor = event(events, addHours(cursor, rng.int(8, 36)), 'UNDER_REVIEW', {
    queue: pick(['income_verification', 'credit_policy', 'ops_quality_check']),
    riskTier: profile.bureauScore > 730 ? 'prime' : 'near_prime',
  });

  if (segment === 'UNDER_REVIEW') {
    if (rng.bool(0.45)) {
      cursor = event(events, addHours(cursor, rng.int(4, 28)), 'NOTE_ADDED', {
        note: pick(noteTemplates.review),
        staff: pick(advisors).name,
      });
    }
    return events;
  }

  cursor = event(
    events,
    addHours(cursor, rng.int(8, 48)),
    'VERIFICATION_COMPLETED',
    {
      identityVerified: true,
      incomeVerified: true,
      bankStatementReviewed: true,
    },
  );

  if (segment === 'APPROVED' || segment === 'CONVERTED') {
    cursor = event(events, addHours(cursor, rng.int(2, 24)), 'LEAD_APPROVED', {
      approvedAmount: clamp(
        profile.loanAmount - currencyStep(0, 150000, 25000),
        50000,
        profile.loanAmount,
      ),
      approvedTenureMonths: profile.requestedTenureMonths,
      policy: 'standard_personal_loan',
    });
  }

  if (segment === 'CONVERTED') {
    event(events, addHours(cursor, rng.int(4, 36)), 'LEAD_CONVERTED', {
      disbursalMode: pick(['instant_bank_transfer', 'scheduled_bank_transfer']),
      agreementSigned: true,
    });
  }

  return events;
}

function generateVerificationChecklist(
  segment: LifecycleSegment,
): VerificationChecklist {
  if (segment === 'CONVERTED' || segment === 'APPROVED') {
    return {
      salaryVerified: true,
      documentsUploaded: true,
      identityVerified: true,
      callbackCompleted: true,
      eligibilityReviewed: true,
    };
  }

  if (segment === 'UNDER_REVIEW') {
    return {
      salaryVerified: rng.bool(0.55),
      documentsUploaded: true,
      identityVerified: rng.bool(0.85),
      callbackCompleted: rng.bool(0.65),
      eligibilityReviewed: rng.bool(0.75),
    };
  }

  if (segment === 'VERIFICATION_PENDING') {
    return {
      salaryVerified: false,
      documentsUploaded: rng.bool(0.6),
      identityVerified: rng.bool(0.45),
      callbackCompleted: rng.bool(0.4),
      eligibilityReviewed: rng.bool(0.35),
    };
  }

  if (segment === 'HIGH_RISK') {
    return {
      salaryVerified: false,
      documentsUploaded: false,
      identityVerified: false,
      callbackCompleted: false,
      eligibilityReviewed: false,
    };
  }

  return {
    salaryVerified: false,
    documentsUploaded: false,
    identityVerified: rng.bool(0.35),
    callbackCompleted: segment === 'CALLBACK_PENDING' ? false : rng.bool(0.2),
    eligibilityReviewed: false,
  };
}

function generateDocumentStatus(
  segment: LifecycleSegment,
  events: TimelineEvent[],
): DocumentUpload[] {
  const uploadedEvents = events.filter(
    (item) => item.eventType === 'DOCUMENT_UPLOADED',
  );
  const uploadedByType = new Map(
    uploadedEvents.map((item) => [
      String(item.metadata.documentType),
      item.createdAt.toISOString(),
    ]),
  );

  return ['PAN', 'Aadhaar', 'Bank Statement', 'Salary Slip'].map(
    (documentType) => {
      const uploadedAt = uploadedByType.get(documentType);
      let verificationState: VerificationState = uploadedAt
        ? 'PENDING'
        : 'PENDING';

      if (uploadedAt && (segment === 'APPROVED' || segment === 'CONVERTED')) {
        verificationState = 'VERIFIED';
      } else if (uploadedAt && segment === 'HIGH_RISK') {
        verificationState = 'REJECTED';
      } else if (uploadedAt && rng.bool(0.25)) {
        verificationState = 'NEEDS_REVIEW';
      }

      return {
        documentType,
        uploadedAt,
        verificationState,
      };
    },
  );
}

function generateCallbackWorkflow(
  segment: LifecycleSegment,
  events: TimelineEvent[],
): CallbackWorkflow {
  const requested = events.find(
    (item) => item.eventType === 'CALLBACK_REQUESTED',
  );
  const owner = pick(advisors).name;

  if (!requested) {
    return {
      state: 'NOT_REQUESTED',
      attempts: 0,
      owner,
    };
  }

  if (segment === 'CALLBACK_PENDING') {
    const overdue = rng.bool(0.45);
    return {
      state: overdue ? 'OVERDUE' : 'PENDING',
      requestedAt: requested.createdAt.toISOString(),
      scheduledAt: addHours(
        requested.createdAt,
        overdue ? -rng.int(2, 8) : rng.int(2, 10),
      ).toISOString(),
      attempts: overdue ? rng.int(1, 3) : rng.int(0, 1),
      owner,
    };
  }

  if (segment === 'UNDER_REVIEW' && rng.bool(0.2)) {
    return {
      state: 'MISSED',
      requestedAt: requested.createdAt.toISOString(),
      scheduledAt: addHours(requested.createdAt, 5).toISOString(),
      missedAt: addHours(requested.createdAt, 5).toISOString(),
      attempts: rng.int(1, 2),
      owner,
    };
  }

  return {
    state: 'COMPLETED',
    requestedAt: requested.createdAt.toISOString(),
    scheduledAt: addHours(requested.createdAt, rng.int(2, 8)).toISOString(),
    completedAt: addHours(requested.createdAt, rng.int(2, 10)).toISOString(),
    attempts: rng.int(1, 2),
    owner,
  };
}

function generateLeadScore(
  profile: LeadProfile,
  events: TimelineEvent[],
  segment: LifecycleSegment,
): LeadScores {
  const impactMap: Record<string, number> = {
    LANDING_PAGE_VIEWED: 5,
    START_PAGE_OPENED: 5,
    EMI_CALCULATOR_USED: 24,
    EMI_RECALCULATED: 10,
    SALARY_ENTERED: 20,
    CALLBACK_REQUESTED: 34,
    ADVISOR_ASSIGNED: 8,
    OTP_VERIFIED: 18,
    OTP_FAILED: -22,
    APPLICATION_STARTED: 38,
    APPLICATION_SUBMITTED: 42,
    DOCUMENT_UPLOADED: 26,
    UNDER_REVIEW: 22,
    VERIFICATION_COMPLETED: 45,
    LEAD_APPROVED: 55,
    LEAD_CONVERTED: 70,
    SUSPICIOUS_ACTIVITY_FLAGGED: -95,
    SESSION_ABANDONED: -35,
    FORM_ABANDONED: -25,
  };

  const intentScore = clamp(
    events.reduce(
      (total, item) => total + Math.max(impactMap[item.eventType] || 0, 0),
      0,
    ),
    0,
    160,
  );

  const engagementScore = clamp(
    events.length * 8 +
      events.filter((item) => item.eventType === 'EMI_RECALCULATED').length * 9,
    0,
    110,
  );

  const emiToIncomeRatio =
    profile.loanAmount / Math.max(profile.salary * 24, 1);
  const eligibilityScore = clamp(
    Math.round(
      (profile.bureauScore - 560) / 2.8 +
        profile.salary / 5000 -
        emiToIncomeRatio * 40,
    ),
    0,
    110,
  );

  const negativeSignals = events.reduce(
    (total, item) => total + Math.min(impactMap[item.eventType] || 0, 0),
    0,
  );
  const segmentRiskPenalty =
    segment === 'HIGH_RISK'
      ? -90
      : segment === 'DROPPED'
        ? -35
        : segment === 'VERIFICATION_PENDING'
          ? -12
          : 0;
  const riskScore = clamp(negativeSignals + segmentRiskPenalty, -120, 20);
  const finalScore = clamp(
    intentScore + eligibilityScore + engagementScore + riskScore,
    0,
    400,
  );

  return {
    intentScore,
    eligibilityScore,
    engagementScore,
    riskScore,
    finalScore,
  };
}

function generateRiskSignals(
  segment: LifecycleSegment,
  scores: LeadScores,
  events: TimelineEvent[],
  callback: CallbackWorkflow,
  verification: VerificationChecklist,
): RiskSignals {
  const hasFraudEvent = events.some(
    (item) => item.eventType === 'SUSPICIOUS_ACTIVITY_FLAGGED',
  );
  const hasAbandonment = events.some(
    (item) => item.eventType === 'SESSION_ABANDONED',
  );
  const applicationCompletion =
    segment === 'CONVERTED' || segment === 'APPROVED'
      ? 100
      : segment === 'UNDER_REVIEW'
        ? rng.int(72, 94)
        : segment === 'VERIFICATION_PENDING'
          ? rng.int(42, 78)
          : segment === 'CALLBACK_PENDING'
            ? rng.int(24, 58)
            : rng.int(8, 35);

  const fraudRisk: RiskBand = hasFraudEvent
    ? 'critical'
    : scores.riskScore < -45
      ? 'high'
      : verification.identityVerified
        ? 'low'
        : 'moderate';

  const conversionProbability = clamp(
    Math.round(
      scores.finalScore / 4 +
        (segment === 'CONVERTED' ? 15 : 0) -
        (hasAbandonment ? 25 : 0),
    ),
    2,
    97,
  );

  const slaBreachRisk =
    callback.state === 'OVERDUE' ||
    (segment === 'VERIFICATION_PENDING' &&
      !verification.documentsUploaded &&
      rng.bool(0.55)) ||
    (segment === 'UNDER_REVIEW' && rng.bool(0.25));

  const callbackUrgency: Urgency = slaBreachRisk
    ? 'critical'
    : callback.state === 'PENDING'
      ? 'high'
      : scores.finalScore > 300
        ? 'medium'
        : 'low';

  const recommendation = hasFraudEvent
    ? 'Route to fraud operations before any sales follow-up.'
    : slaBreachRisk
      ? 'Prioritize owner action to prevent SLA breach.'
      : segment === 'CONVERTED'
        ? 'Monitor post-disbursal onboarding and cross-sell eligibility.'
        : segment === 'APPROVED'
          ? 'Call customer to complete agreement and disbursal consent.'
          : scores.finalScore > 280
            ? 'Offer guided callback with EMI and document checklist.'
            : 'Continue nurture with eligibility education.';

  return {
    highIntent: scores.finalScore >= 280 && !hasFraudEvent,
    fraudRisk,
    conversionProbability,
    callbackUrgency,
    slaBreachRisk,
    recommendation,
    recommendationConfidence: clamp(
      rng.int(68, 94) + (events.length > 10 ? 4 : 0),
      55,
      98,
    ),
    applicationCompletion,
  };
}

function generateOperationalNotes(lead: GeneratedLead): Array<{
  actionType: string;
  status: ActionStatus;
  generatedBy: string;
  reason: string;
  createdAt: Date;
}> {
  const staff = pick(advisors).name;
  const baseTime =
    lead.events[Math.max(0, lead.events.length - 1)]?.createdAt ||
    lead.createdAt;
  const notes: Array<{
    actionType: string;
    status: ActionStatus;
    generatedBy: string;
    reason: string;
    createdAt: Date;
  }> = [];

  if (lead.callback.state === 'PENDING' || lead.callback.state === 'OVERDUE') {
    notes.push({
      actionType:
        lead.callback.state === 'OVERDUE' ? 'OVERDUE_CALLBACK' : 'CALLBACK',
      status: ActionStatus.PENDING,
      generatedBy: 'SYSTEM',
      reason: `${lead.callback.owner} should call customer. Urgency=${lead.signals.callbackUrgency}.`,
      createdAt: addMinutes(baseTime, rng.int(15, 90)),
    });
  }

  if (
    lead.segment === 'VERIFICATION_PENDING' ||
    lead.segment === 'UNDER_REVIEW'
  ) {
    notes.push({
      actionType: lead.signals.slaBreachRisk
        ? 'SLA_VERIFICATION_REVIEW'
        : 'DOCUMENT_VERIFICATION',
      status: lead.signals.slaBreachRisk
        ? ActionStatus.PENDING
        : ActionStatus.COMPLETED,
      generatedBy: 'SYSTEM',
      reason: pick(noteTemplates.review),
      createdAt: addMinutes(baseTime, rng.int(25, 160)),
    });
  }

  if (lead.segment === 'HIGH_RISK') {
    notes.push({
      actionType: 'FRAUD_REVIEW',
      status: ActionStatus.PENDING,
      generatedBy: 'RISK_ENGINE',
      reason: pick(noteTemplates.risk),
      createdAt: addMinutes(baseTime, rng.int(5, 60)),
    });
  }

  if (lead.segment === 'APPROVED') {
    notes.push({
      actionType: 'DISBURSAL_FOLLOW_UP',
      status: rng.bool(0.7) ? ActionStatus.PENDING : ActionStatus.COMPLETED,
      generatedBy: staff,
      reason:
        'Approved lead awaiting agreement consent and final disbursal confirmation.',
      createdAt: addMinutes(baseTime, rng.int(45, 240)),
    });
  }

  if (lead.segment === 'DROPPED') {
    notes.push({
      actionType: 'WINBACK_NURTURE',
      status: ActionStatus.PENDING,
      generatedBy: 'SYSTEM',
      reason: pick(noteTemplates.dropped),
      createdAt: addMinutes(baseTime, rng.int(120, 360)),
    });
  }

  if (lead.signals.highIntent && lead.segment !== 'CONVERTED') {
    notes.push({
      actionType: 'NEXT_BEST_ACTION',
      status: ActionStatus.PENDING,
      generatedBy: 'AI_RECOMMENDER',
      reason: lead.signals.recommendation,
      createdAt: addMinutes(baseTime, rng.int(10, 80)),
    });
  }

  return notes;
}

function generateTimeline(
  index: number,
  segment: LifecycleSegment,
): GeneratedLead {
  const createdAt = addDays(SEED_ANCHOR, -rng.int(0, 45));
  const profile = generateLeadProfile(index, segment);
  const events = generateLeadEvents(profile, segment, createdAt);
  const verification = generateVerificationChecklist(segment);
  const documents = generateDocumentStatus(segment, events);
  const callback = generateCallbackWorkflow(segment, events);
  const scores = generateLeadScore(profile, events, segment);
  const signals = generateRiskSignals(
    segment,
    scores,
    events,
    callback,
    verification,
  );
  const operationalStage = operationalStageFor(segment);
  const currentStage = generateLeadStage(segment, scores.finalScore);

  return {
    profile,
    segment,
    currentStage,
    operationalStage,
    createdAt,
    events: decorateEvents(
      events,
      operationalStage,
      verification,
      documents,
      callback,
      signals,
    ),
    verification,
    documents,
    callback,
    signals,
    scores,
  };
}

function decorateEvents(
  events: TimelineEvent[],
  operationalStage: string,
  verification: VerificationChecklist,
  documents: DocumentUpload[],
  callback: CallbackWorkflow,
  signals: RiskSignals,
) {
  return events.map((item, sequence) => ({
    ...item,
    metadata: {
      ...item.metadata,
      sequence: sequence + 1,
      operationalStage,
      verificationChecklist: verification,
      documentStatus: documents,
      callbackWorkflow: callback,
      aiSignals: signals,
    },
  }));
}

async function seedSalesAgents() {
  await prisma.salesAgent.createMany({
    data: advisors.map((advisor, index) => ({
      name: advisor.name,
      language: advisor.language,
      region: advisor.region,
      workload: rng.int(2, 14) + index,
    })),
  });

  return prisma.salesAgent.findMany();
}

async function clearOldSeedData() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "lead_actions", "lead_events", "lead_scores", "leads", "sales_agents" RESTART IDENTITY CASCADE',
  );
}

async function insertLead(lead: GeneratedLead, assignedAgentId?: string) {
  const leadRecord = await prisma.lead.create({
    data: {
      name: lead.profile.name,
      phone: lead.profile.phone,
      salary: lead.profile.salary,
      employmentType: lead.profile.employmentType,
      loanAmount: lead.profile.loanAmount,
      source: lead.profile.source,
      currentStage: lead.currentStage,
      assignedTo: assignedAgentId,
      createdAt: lead.createdAt,
      scores: {
        create: lead.scores,
      },
      events: {
        create: lead.events.map((item) => ({
          eventType: item.eventType,
          createdAt: item.createdAt,
          metadata: item.metadata as Prisma.InputJsonValue,
        })),
      },
    },
  });

  const actions = generateOperationalNotes(lead);

  if (actions.length > 0) {
    await prisma.leadAction.createMany({
      data: actions.map((action) => ({
        leadId: leadRecord.id,
        actionType: action.actionType,
        status: action.status,
        generatedBy: action.generatedBy,
        reason: action.reason,
        createdAt: action.createdAt,
      })),
    });
  }

  return leadRecord;
}

async function main() {
  console.log('Cleaning existing LeadNexus operational seed data...');
  await clearOldSeedData();

  console.log(`Generating ${LEAD_COUNT} fintech lifecycle leads...`);
  const agents = await seedSalesAgents();
  const plan = buildLifecyclePlan(LEAD_COUNT);
  const generatedLeads = plan.map((segment, index) =>
    generateTimeline(index + 1, segment),
  );

  for (const lead of generatedLeads) {
    const agent = pick(agents);
    await insertLead(lead, agent?.id);
  }

  const counts = generatedLeads.reduce<Record<string, number>>(
    (summary, lead) => {
      summary[lead.segment] = (summary[lead.segment] || 0) + 1;
      return summary;
    },
    {},
  );

  console.log('Seed complete.');
  console.table(counts);
  console.log(
    `Inserted ${generatedLeads.length} leads, ${generatedLeads.reduce(
      (total, lead) => total + lead.events.length,
      0,
    )} lifecycle events, and analytics-ready AI signal metadata.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(process.exitCode || 0);
  });
