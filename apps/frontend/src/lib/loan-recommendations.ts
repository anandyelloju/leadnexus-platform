import { calculateEmi } from './financial';
import type { EmiEstimate } from './financial';

export type LeadEvent = {
  id: string;
  eventType: string;
  createdAt: string;
  metadata?: unknown;
};

export type LeadScore = {
  eligibilityScore?: number;
  engagementScore?: number;
  finalScore?: number;
  intentScore?: number;
  riskScore?: number;
};

export type RecommendationLead = {
  id: string;
  name?: string | null;
  salary?: number | null;
  employmentType?: string | null;
  loanAmount?: number | null;
  currentStage?: string | null;
  events?: LeadEvent[];
  scores?: LeadScore | null;
};

export type ConfidenceTier = 'excellent' | 'high' | 'moderate' | 'manual';

export type EligibilitySummary = {
  tier: ConfidenceTier;
  label: string;
  score: number;
  status: string;
  preQualifiedAmount: number;
  requestedAmount: number;
  affordabilityRatio: number;
  documentsUploaded: number;
  documentStatus: string;
  engagementLevel: string;
};

export type LoanOffer = {
  id: string;
  productName: string;
  category: string;
  headline: string;
  interestRateMin: number;
  interestRateMax: number;
  annualRate: number;
  eligibleAmount: number;
  estimatedEmi: number;
  tenure: number;
  approvalProbability: number;
  confidenceLabel: string;
  processingSpeed: string;
  processingFee: string;
  repaymentFlexibility: string;
  benefits: string[];
  badges: string[];
  rationale: string[];
  priorityScore: number;
};

export type RecommendationResult = {
  eligibility: EligibilitySummary;
  offers: LoanOffer[];
  insights: string[];
  nextBestActions: string[];
};

type OfferTemplate = {
  id: string;
  productName: string;
  category: string;
  baseRate: number;
  amountMultiplier: number;
  maxAmount: number;
  minAmount: number;
  tenure: number;
  processingFee: string;
  repaymentFlexibility: string;
  benefits: string[];
  salariedFit: number;
  selfEmployedFit: number;
  riskBuffer: number;
};

const offerTemplates: OfferTemplate[] = [
  {
    id: 'premium-personal-loan',
    productName: 'Premium Personal Loan',
    category: 'Personal Loan',
    baseRate: 10.7,
    amountMultiplier: 9,
    maxAmount: 2000000,
    minAmount: 300000,
    tenure: 36,
    processingFee: '1.2% to 1.8%',
    repaymentFlexibility: 'Fixed EMI with part-payment option',
    benefits: ['Lower rate band for verified income', 'Priority underwriting queue', 'Higher ticket size eligibility'],
    salariedFit: 24,
    selfEmployedFit: 6,
    riskBuffer: 8,
  },
  {
    id: 'instant-salary-advance',
    productName: 'Instant Salary Advance',
    category: 'Salary Advance',
    baseRate: 12.4,
    amountMultiplier: 2.5,
    maxAmount: 350000,
    minAmount: 50000,
    tenure: 12,
    processingFee: 'Flat 0.9%',
    repaymentFlexibility: 'Short tenure, low documentation',
    benefits: ['Fast approval for payroll users', 'Smaller EMI exposure', 'No collateral required'],
    salariedFit: 22,
    selfEmployedFit: -8,
    riskBuffer: 2,
  },
  {
    id: 'business-flexi-loan',
    productName: 'Business Flexi Loan',
    category: 'Business Loan',
    baseRate: 14.1,
    amountMultiplier: 6,
    maxAmount: 1500000,
    minAmount: 250000,
    tenure: 42,
    processingFee: '1.5% to 2.2%',
    repaymentFlexibility: 'Flexi drawdown and part-prepayment',
    benefits: ['Built for variable business income', 'Manual review support', 'Works with bank statement validation'],
    salariedFit: -4,
    selfEmployedFit: 24,
    riskBuffer: 14,
  },
  {
    id: 'flexi-credit-line',
    productName: 'Flexi Credit Line',
    category: 'Flexi Credit',
    baseRate: 13.2,
    amountMultiplier: 5,
    maxAmount: 1000000,
    minAmount: 150000,
    tenure: 24,
    processingFee: 'Usage-based fee',
    repaymentFlexibility: 'Pay interest only on used amount',
    benefits: ['Reusable credit limit', 'Good fit for changing cash needs', 'Advisor-assisted activation'],
    salariedFit: 10,
    selfEmployedFit: 16,
    riskBuffer: 10,
  },
  {
    id: 'debt-consolidation-loan',
    productName: 'Debt Consolidation Loan',
    category: 'Debt Consolidation',
    baseRate: 11.6,
    amountMultiplier: 7,
    maxAmount: 1600000,
    minAmount: 300000,
    tenure: 48,
    processingFee: '1.0% to 1.6%',
    repaymentFlexibility: 'Longer tenure with structured payoff',
    benefits: ['Consolidates multiple repayments', 'Stable EMI planning', 'Lower monthly stress potential'],
    salariedFit: 16,
    selfEmployedFit: 10,
    riskBuffer: 9,
  },
  {
    id: 'smart-instant-loan',
    productName: 'Smart Instant Loan',
    category: 'Instant Loan',
    baseRate: 15.5,
    amountMultiplier: 3,
    maxAmount: 500000,
    minAmount: 75000,
    tenure: 18,
    processingFee: 'Flat 1.4%',
    repaymentFlexibility: 'Quick disbursal with fixed EMI',
    benefits: ['Good for urgent requirements', 'Fast digital review', 'Lower documentation dependency'],
    salariedFit: 12,
    selfEmployedFit: 8,
    riskBuffer: 4,
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, unit: number) {
  return Math.round(value / unit) * unit;
}

function normalizeScore(score: number) {
  if (score > 100) {
    return clamp(Math.round(score / 3), 0, 100);
  }

  return clamp(score, 0, 100);
}

function isSelfEmployed(employmentType?: string | null) {
  return employmentType === 'SELF_EMPLOYED' || employmentType === 'BUSINESS_OWNER' || employmentType === 'FREELANCER';
}

function countEvents(lead: RecommendationLead | null, eventType: string) {
  return lead?.events?.filter((event) => event.eventType === eventType).length ?? 0;
}

function getUploadedDocumentsFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== 'object') {
    return 0;
  }

  const maybeDocuments = (metadata as { uploadedDocuments?: unknown }).uploadedDocuments;

  return Array.isArray(maybeDocuments) ? maybeDocuments.length : 0;
}

function getDocumentCount(lead: RecommendationLead | null) {
  const documentEvents = countEvents(lead, 'DOCUMENT_UPLOADED');
  const salaryEventDocuments = lead?.events?.reduce((highest, event) => {
    if (event.eventType !== 'SALARY_ENTERED') {
      return highest;
    }

    return Math.max(highest, getUploadedDocumentsFromMetadata(event.metadata));
  }, 0) ?? 0;

  return clamp(Math.max(documentEvents, salaryEventDocuments), 0, 4);
}

function getRequestedAmount(lead: RecommendationLead | null, emiEstimate: EmiEstimate | null) {
  return lead?.loanAmount || emiEstimate?.loanAmount || 500000;
}

function getSalary(lead: RecommendationLead | null) {
  return lead?.salary || 75000;
}

function getPreQualifiedAmount(salary: number, score: number, documentsUploaded: number, employmentType?: string | null) {
  const employmentMultiplier = isSelfEmployed(employmentType) ? 7 : 9;
  const scoreMultiplier = score >= 85 ? 1.15 : score >= 65 ? 1 : score >= 45 ? 0.82 : 0.64;
  const documentMultiplier = documentsUploaded >= 3 ? 1.12 : documentsUploaded >= 1 ? 1 : 0.76;

  return clamp(roundTo(salary * employmentMultiplier * scoreMultiplier * documentMultiplier, 50000), 100000, 2500000);
}

function getEligibilityScore(lead: RecommendationLead | null, emiEstimate: EmiEstimate | null) {
  const salary = getSalary(lead);
  const score = normalizeScore(lead?.scores?.finalScore ?? 35);
  const documentsUploaded = getDocumentCount(lead);
  const emiEngagement = countEvents(lead, 'EMI_CALCULATOR_USED') + (emiEstimate ? 1 : 0);
  const callbackIntent = countEvents(lead, 'CALLBACK_REQUESTED') > 0 ? 8 : 0;
  const incomeSignal = lead?.salary ? clamp(Math.round(salary / 3000), 12, 34) : 10;
  const documentSignal = documentsUploaded * 6;
  const engagementSignal = clamp(emiEngagement * 7, 0, 18) + callbackIntent;

  return clamp(Math.round(score * 0.42 + incomeSignal + documentSignal + engagementSignal), 18, 98);
}

function getConfidence(score: number): Pick<EligibilitySummary, 'tier' | 'label' | 'status'> {
  if (score >= 86) {
    return { tier: 'excellent', label: 'Excellent Eligibility', status: 'Priority lender match' };
  }

  if (score >= 70) {
    return { tier: 'high', label: 'High Approval Chance', status: 'Strong match' };
  }

  if (score >= 52) {
    return { tier: 'moderate', label: 'Moderate Eligibility', status: 'Advisor guided' };
  }

  return { tier: 'manual', label: 'Manual Review Required', status: 'Verification needed' };
}

function getRateAdjustment(eligibilityScore: number, documentsUploaded: number, emiEngagement: number) {
  const scoreDiscount = eligibilityScore >= 86 ? -0.9 : eligibilityScore >= 70 ? -0.45 : eligibilityScore < 52 ? 1.1 : 0.25;
  const documentDiscount = documentsUploaded >= 3 ? -0.35 : documentsUploaded === 0 ? 0.55 : 0;
  const engagementDiscount = emiEngagement >= 2 ? -0.15 : 0;

  return scoreDiscount + documentDiscount + engagementDiscount;
}

function getProcessingSpeed(approvalProbability: number, documentsUploaded: number, employmentType?: string | null) {
  if (approvalProbability >= 88 && documentsUploaded >= 3 && !isSelfEmployed(employmentType)) {
    return 'Same-day review';
  }

  if (approvalProbability >= 76 && documentsUploaded >= 1) {
    return 'Within 24 hours';
  }

  if (isSelfEmployed(employmentType)) {
    return 'Advisor review in 1-2 days';
  }

  return 'After verification';
}

function getConfidenceLabel(probability: number, employmentType?: string | null) {
  if (probability >= 88) {
    return 'Excellent Match';
  }

  if (probability >= 76) {
    return 'Strong Match';
  }

  if (isSelfEmployed(employmentType)) {
    return 'Manual Review';
  }

  return 'Moderate Match';
}

function getBadges(offer: OfferTemplate, probability: number, estimatedEmi: number, minEmi: number, topId: string) {
  const badges: string[] = [];

  if (offer.id === topId) {
    badges.push('Best Match');
  }

  if (probability >= 84) {
    badges.push('Fast Approval');
  }

  if (estimatedEmi === minEmi) {
    badges.push('Lowest EMI');
  }

  if (offer.repaymentFlexibility.toLowerCase().includes('flexi') || offer.repaymentFlexibility.toLowerCase().includes('part')) {
    badges.push('Flexible Repayment');
  }

  if (badges.length === 0) {
    badges.push('Recommended');
  }

  return badges.slice(0, 3);
}

function getRationale(
  offer: OfferTemplate,
  lead: RecommendationLead | null,
  documentsUploaded: number,
  emiEngagement: number,
  affordabilityRatio: number,
) {
  const rationale: string[] = [];

  if (lead?.salary) {
    rationale.push('Income profile supports this offer band');
  }

  if (documentsUploaded >= 3) {
    rationale.push('Verified documents improve review confidence');
  } else if (documentsUploaded > 0) {
    rationale.push('Partial document activity is factored into review');
  } else {
    rationale.push('Document upload can unlock stronger pricing');
  }

  if (emiEngagement > 0) {
    rationale.push('EMI planning activity shows repayment intent');
  }

  if (isSelfEmployed(lead?.employmentType) && offer.selfEmployedFit > offer.salariedFit) {
    rationale.push('Structured for variable business income');
  }

  if (affordabilityRatio <= 35) {
    rationale.push('Estimated EMI remains within a comfortable income band');
  }

  return rationale.slice(0, 4);
}

export function generateLoanRecommendations(
  lead: RecommendationLead | null,
  emiEstimate: EmiEstimate | null,
): RecommendationResult {
  const salary = getSalary(lead);
  const requestedAmount = getRequestedAmount(lead, emiEstimate);
  const documentsUploaded = getDocumentCount(lead);
  const emiEngagement = countEvents(lead, 'EMI_CALCULATOR_USED') + (emiEstimate ? 1 : 0);
  const callbackRequested = countEvents(lead, 'CALLBACK_REQUESTED') > 0;
  const eligibilityScore = getEligibilityScore(lead, emiEstimate);
  const preQualifiedAmount = getPreQualifiedAmount(salary, eligibilityScore, documentsUploaded, lead?.employmentType);
  const confidence = getConfidence(eligibilityScore);
  const affordabilityRatio = Math.round(((emiEstimate?.estimatedEmi ?? calculateEmi(requestedAmount, emiEstimate?.tenure ?? 36, 11.5)) / salary) * 100);
  const rateAdjustment = getRateAdjustment(eligibilityScore, documentsUploaded, emiEngagement);
  const selfEmployedProfile = isSelfEmployed(lead?.employmentType);

  const baseOffers = offerTemplates.map((template) => {
    const fitScore = selfEmployedProfile ? template.selfEmployedFit : template.salariedFit;
    const amount = clamp(
      roundTo(Math.min(requestedAmount * 1.08, salary * template.amountMultiplier, template.maxAmount, preQualifiedAmount), 50000),
      template.minAmount,
      template.maxAmount,
    );
    const annualRate = Number(clamp(template.baseRate + rateAdjustment + template.riskBuffer / 20, 9.9, 18.5).toFixed(1));
    const estimatedEmi = Math.round(calculateEmi(amount, template.tenure, annualRate));
    const productAffordability = (estimatedEmi / salary) * 100;
    const approvalProbability = clamp(
      Math.round(eligibilityScore + fitScore - template.riskBuffer - Math.max(0, productAffordability - 35) * 0.65),
      42,
      96,
    );
    const priorityScore = approvalProbability + fitScore + (emiEngagement >= 2 ? 8 : 0) + (callbackRequested ? 4 : 0);

    return {
      id: template.id,
      productName: template.productName,
      category: template.category,
      headline: template.benefits[0],
      interestRateMin: Number(Math.max(9.5, annualRate - 0.6).toFixed(1)),
      interestRateMax: Number((annualRate + 1.1).toFixed(1)),
      annualRate,
      eligibleAmount: amount,
      estimatedEmi,
      tenure: template.tenure,
      approvalProbability,
      confidenceLabel: getConfidenceLabel(approvalProbability, lead?.employmentType),
      processingSpeed: getProcessingSpeed(approvalProbability, documentsUploaded, lead?.employmentType),
      processingFee: template.processingFee,
      repaymentFlexibility: template.repaymentFlexibility,
      benefits: template.benefits,
      badges: [] as string[],
      rationale: getRationale(template, lead, documentsUploaded, emiEngagement, productAffordability),
      priorityScore,
    };
  });

  const sortedWithoutBadges = baseOffers
    .sort((first, second) => second.priorityScore - first.priorityScore)
    .slice(0, 4);
  const minEmi = Math.min(...sortedWithoutBadges.map((offer) => offer.estimatedEmi));
  const topId = sortedWithoutBadges[0]?.id ?? '';
  const offers = sortedWithoutBadges.map((offer) => {
    const template = offerTemplates.find((item) => item.id === offer.id) ?? offerTemplates[0];

    return {
      ...offer,
      badges: getBadges(template, offer.approvalProbability, offer.estimatedEmi, minEmi, topId),
    };
  });

  const insights = [
    lead?.salary
      ? `Verified income signal is shaping an offer range up to ${preQualifiedAmount.toLocaleString('en-IN')}.`
      : 'Income details are estimated until the application profile is completed.',
    documentsUploaded >= 3
      ? 'Document readiness is improving lender confidence and review speed.'
      : 'Uploading income and identity documents can improve pricing confidence.',
    emiEngagement > 0
      ? 'EMI calculator activity is being used to prioritize repayment-fit products.'
      : 'Running an EMI estimate will sharpen repayment-fit recommendations.',
    callbackRequested
      ? 'Advisor intent is present, so offers include guided review paths.'
      : 'You can request an advisor callback without impacting your credit score.',
  ];

  const nextBestActions = [
    documentsUploaded < 3 ? 'Upload documents to unlock stronger confidence.' : 'Keep documents ready for lender verification.',
    emiEngagement === 0 ? 'Calculate EMI once to improve repayment matching.' : 'Compare EMI and approval speed before applying.',
    'Save or compare the strongest offer before advisor review.',
  ];

  return {
    eligibility: {
      ...confidence,
      score: eligibilityScore,
      preQualifiedAmount,
      requestedAmount,
      affordabilityRatio: clamp(affordabilityRatio, 1, 100),
      documentsUploaded,
      documentStatus: documentsUploaded >= 3 ? 'Verification ready' : `${documentsUploaded}/4 document signals`,
      engagementLevel: emiEngagement >= 2 ? 'High EMI engagement' : emiEngagement === 1 ? 'Active planning' : 'Early discovery',
    },
    offers,
    insights,
    nextBestActions,
  };
}
