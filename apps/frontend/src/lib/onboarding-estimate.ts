import type { EmiEstimate } from './financial';

const STORAGE_KEY = 'leadnexus.emiEstimate';

export function saveEmiEstimate(estimate: EmiEstimate) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(estimate));
}

export function getSavedEmiEstimate() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawEstimate = localStorage.getItem(STORAGE_KEY);
  if (!rawEstimate) {
    return null;
  }

  try {
    return JSON.parse(rawEstimate) as EmiEstimate;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
