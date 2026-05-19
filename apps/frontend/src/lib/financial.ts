export type EmiEstimate = {
  loanAmount: number;
  tenure: number;
  annualRate: number;
  estimatedEmi: number;
  totalRepayment: number;
  interestPayable: number;
  calculatedAt: string;
  sessionId: string;
};

export const DEFAULT_ANNUAL_RATE = 10;

export function calculateEmi(loanAmount: number, tenure: number, annualRate = DEFAULT_ANNUAL_RATE) {
  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return loanAmount / tenure;
  }

  return (
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1)
  );
}

export function createEmiEstimate(
  loanAmount: number,
  tenure: number,
  annualRate = DEFAULT_ANNUAL_RATE,
): EmiEstimate {
  const estimatedEmi = Math.round(calculateEmi(loanAmount, tenure, annualRate));
  const totalRepayment = estimatedEmi * tenure;

  return {
    loanAmount,
    tenure,
    annualRate,
    estimatedEmi,
    totalRepayment,
    interestPayable: Math.max(totalRepayment - loanAmount, 0),
    calculatedAt: new Date().toISOString(),
    sessionId:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(value);
}

export function serializeEstimateToSearchParams(estimate: EmiEstimate) {
  return new URLSearchParams({
    loanAmount: String(estimate.loanAmount),
    tenure: String(estimate.tenure),
    estimatedEmi: String(estimate.estimatedEmi),
    totalRepayment: String(estimate.totalRepayment),
    interestPayable: String(estimate.interestPayable),
    calculatedAt: estimate.calculatedAt,
    sessionId: estimate.sessionId,
  }).toString();
}

export function parseEstimateFromSearchParams(searchParams: URLSearchParams): EmiEstimate | null {
  const loanAmount = Number(searchParams.get('loanAmount'));
  const tenure = Number(searchParams.get('tenure'));
  const estimatedEmi = Number(searchParams.get('estimatedEmi'));
  const totalRepayment = Number(searchParams.get('totalRepayment'));
  const interestPayable = Number(searchParams.get('interestPayable'));
  const calculatedAt = searchParams.get('calculatedAt');
  const sessionId = searchParams.get('sessionId');

  if (
    !Number.isFinite(loanAmount) ||
    !Number.isFinite(tenure) ||
    !Number.isFinite(estimatedEmi) ||
    !Number.isFinite(totalRepayment) ||
    !Number.isFinite(interestPayable) ||
    !calculatedAt ||
    !sessionId
  ) {
    return null;
  }

  return {
    loanAmount,
    tenure,
    estimatedEmi,
    totalRepayment,
    interestPayable,
    calculatedAt,
    sessionId,
    annualRate: DEFAULT_ANNUAL_RATE,
  };
}
