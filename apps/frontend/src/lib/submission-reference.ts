export type SubmissionReference = {
    applicationId: string;
    submittedAt: string;
};

const STORAGE_KEY = 'leadnexusSubmissionReference';

function buildSubmissionReference(now = new Date()): SubmissionReference {
    const datePart = now.getFullYear().toString();
    const sequence = Math.floor(10000 + Math.random() * 90000).toString();

    return {
        applicationId: `LN-${datePart}-${sequence}`,
        submittedAt: now.toISOString(),
    };
}

export function saveNewSubmissionReference() {
    const details = buildSubmissionReference();

    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(details));
    }

    return details;
}

export function getSubmissionReference() {
    if (typeof window === 'undefined') {
        return buildSubmissionReference();
    }

    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
        try {
            return JSON.parse(stored) as SubmissionReference;
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    return saveNewSubmissionReference();
}
