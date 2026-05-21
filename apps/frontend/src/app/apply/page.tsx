'use client';

import { useRouter } from 'next/navigation';
import {
    ChangeEvent,
    DragEvent,
    FormEvent,
    ReactNode,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
} from 'react';

import { eventsService } from '@/services/events.service';
import { leadsService } from '@/services/leads.service';
import { saveNewSubmissionReference } from '@/lib/submission-reference';

type IncomeType = 'SALARIED' | 'SELF_EMPLOYED' | 'BUSINESS_OWNER' | 'FREELANCER' | 'RETIRED';
type DocumentStatus = 'Pending' | 'Uploaded' | 'Verified';

type FormData = {
    name: string;
    phone: string;
    email: string;
    incomeType: IncomeType;
    monthlySalary: string;
    employerName: string;
    salaryAccountBank: string;
    businessName: string;
    annualRevenue: string;
    gstNumber: string;
    averageMonthlyIncome: string;
    primaryWorkCategory: string;
    pensionIncome: string;
    loanAmount: string;
    tenure: string;
    loanPurpose: string;
};

type DocumentState = {
    fileName: string;
    size: string;
    progress: number;
    status: DocumentStatus;
};

type DocumentKey = 'salarySlips' | 'bankStatements' | 'panCard' | 'idProof';

const incomeOptions: Array<{ value: IncomeType; label: string; helper: string }> = [
    { value: 'SALARIED', label: 'Salaried', helper: 'Monthly payroll income' },
    { value: 'SELF_EMPLOYED', label: 'Self-employed', helper: 'Professional or practice income' },
    { value: 'BUSINESS_OWNER', label: 'Business Owner', helper: 'Company revenue profile' },
    { value: 'FREELANCER', label: 'Freelancer', helper: 'Project-based income' },
    { value: 'RETIRED', label: 'Retired', helper: 'Pension or investment income' },
];

const documentRequirements: Array<{
    key: DocumentKey;
    title: string;
    description: string;
}> = [
    {
        key: 'salarySlips',
        title: 'Salary slips',
        description: 'Last 3 months income proof for faster eligibility checks.',
    },
    {
        key: 'bankStatements',
        title: 'Bank statements',
        description: 'Recent account activity helps validate repayment capacity.',
    },
    {
        key: 'panCard',
        title: 'PAN card',
        description: 'Required for identity, tax, and bureau verification.',
    },
    {
        key: 'idProof',
        title: 'Aadhaar / ID proof',
        description: 'Government ID for secure customer verification.',
    },
];

const initialFormData: FormData = {
    name: '',
    phone: '',
    email: '',
    incomeType: 'SALARIED',
    monthlySalary: '',
    employerName: '',
    salaryAccountBank: '',
    businessName: '',
    annualRevenue: '',
    gstNumber: '',
    averageMonthlyIncome: '',
    primaryWorkCategory: '',
    pensionIncome: '',
    loanAmount: '',
    tenure: '36',
    loanPurpose: 'Debt consolidation',
};

const initialDocuments = documentRequirements.reduce(
    (accumulator, requirement) => ({
        ...accumulator,
        [requirement.key]: null,
    }),
    {} as Record<DocumentKey, DocumentState | null>,
);

function getLeadSnapshot() {
    if (typeof window === 'undefined') {
        return '|||';
    }

    return [
        localStorage.getItem('leadId') ?? '',
        localStorage.getItem('leadName') ?? '',
        localStorage.getItem('leadPhone') ?? '',
    ].join('|');
}

function subscribeToLeadChanges(onStoreChange: () => void) {
    window.addEventListener('storage', onStoreChange);

    return () => {
        window.removeEventListener('storage', onStoreChange);
    };
}

function digitsOnly(value: string) {
    return value.replace(/\D/g, '');
}

function formatCurrency(value: string) {
    const digits = digitsOnly(value);

    if (!digits) {
        return '';
    }

    return new Intl.NumberFormat('en-IN').format(Number(digits));
}

function toNumber(value: string) {
    return Number(digitsOnly(value));
}

function formatFileSize(size: number) {
    if (size < 1024 * 1024) {
        return `${Math.max(1, Math.round(size / 1024))} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getPrimaryIncomeValue(formData: FormData) {
    if (formData.incomeType === 'SALARIED') {
        return formData.monthlySalary;
    }

    if (formData.incomeType === 'FREELANCER') {
        return formData.averageMonthlyIncome;
    }

    if (formData.incomeType === 'RETIRED') {
        return formData.pensionIncome;
    }

    return formData.annualRevenue ? String(Math.round(toNumber(formData.annualRevenue) / 12)) : '';
}

function mapEmploymentType(incomeType: IncomeType) {
    return incomeType === 'SALARIED' ? 'SALARIED' : 'SELF_EMPLOYED';
}

function validateApplication(
    formData: FormData,
    primaryIncome: string,
    uploadedCount: number,
) {
    const nextErrors: Partial<Record<keyof FormData | 'documents', string>> = {};

    if (!formData.name.trim()) {
        nextErrors.name = 'Enter the applicant full name.';
    }

    if (digitsOnly(formData.phone).length < 10) {
        nextErrors.phone = 'Enter a valid phone number.';
    }

    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
        nextErrors.email = 'Enter a valid email address.';
    }

    if (!primaryIncome || toNumber(primaryIncome) <= 0) {
        nextErrors.monthlySalary = 'Add income details so we can assess eligibility.';
    }

    if (toNumber(formData.loanAmount) < 1000) {
        nextErrors.loanAmount = 'Enter a loan amount above Rs 1,000.';
    }

    if (uploadedCount < documentRequirements.length) {
        nextErrors.documents = 'Upload all required documents before final review.';
    }

    return nextErrors;
}

function Section({
    eyebrow,
    title,
    description,
    children,
}: {
    eyebrow: string;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 sm:p-6">
            <div className="mb-6 border-b border-slate-100 pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">{eyebrow}</p>
                <h2 className="mt-2 text-xl font-bold tracking-normal text-slate-950">{title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
            </div>
            {children}
        </section>
    );
}

function Field({
    label,
    helper,
    error,
    success,
    children,
}: {
    label: string;
    helper?: string;
    error?: string;
    success?: boolean;
    children: ReactNode;
}) {
    return (
        <label className="block">
            <span className="text-sm font-semibold text-slate-800">{label}</span>
            <div className="mt-2">{children}</div>
            {error ? (
                <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
            ) : helper ? (
                <p className={['mt-2 text-sm', success ? 'text-emerald-700' : 'text-slate-500'].join(' ')}>
                    {helper}
                </p>
            ) : null}
        </label>
    );
}

function inputClass(hasError?: boolean, isSuccessful?: boolean) {
    if (hasError) {
        return 'w-full rounded-xl border border-red-300 bg-red-50/40 px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-4 focus:ring-red-100';
    }

    if (isSuccessful) {
        return 'w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100';
    }

    return 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';
}

function UploadCard({
    requirement,
    document,
    onFile,
    onRemove,
}: {
    requirement: (typeof documentRequirements)[number];
    document: DocumentState | null;
    onFile: (file: File) => void;
    onRemove: () => void;
}) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const isUploaded = Boolean(document);
    const status = document?.status ?? 'Pending';

    const handleFile = (file?: File) => {
        if (file) {
            onFile(file);
        }
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        handleFile(event.dataTransfer.files[0]);
    };

    return (
        <div
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
        >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-950">{requirement.title}</h3>
                        <span
                            className={[
                                'rounded-full px-2.5 py-1 text-xs font-bold',
                                status === 'Verified'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : status === 'Uploaded'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-amber-100 text-amber-800',
                            ].join(' ')}
                        >
                            {status}
                        </span>
                    </div>
                    <p className="mt-2 text-sm leading-5 text-slate-600">{requirement.description}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        PDF, JPG, PNG up to 10MB
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                    {isUploaded ? 'Replace' : 'Upload'}
                </button>
            </div>

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-4 flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center transition hover:border-blue-400 hover:bg-blue-50/40 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-blue-700">
                    UP
                </span>
                <span className="mt-3 text-sm font-bold text-slate-900">
                    {isUploaded ? document?.fileName : 'Drag file here or click to browse'}
                </span>
                <span className="mt-1 text-xs font-medium text-slate-500">
                    {isUploaded ? document?.size : 'Secure document capture'}
                </span>
            </button>

            {document && (
                <div className="mt-4 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-slate-900">{document.fileName}</p>
                            <p className="text-xs text-slate-500">Encrypted and ready for verification</p>
                        </div>
                        <button
                            type="button"
                            onClick={onRemove}
                            className="rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-red-600 focus:outline-none focus:ring-4 focus:ring-slate-200"
                        >
                            Remove
                        </button>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-blue-700 transition-all"
                            style={{ width: `${document.progress}%` }}
                        />
                    </div>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0])}
            />
        </div>
    );
}

export default function ApplyPage() {
    const router = useRouter();
    const formStartedTrackedRef = useRef(false);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [documents, setDocuments] = useState<Record<DocumentKey, DocumentState | null>>(initialDocuments);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const leadSnapshot = useSyncExternalStore(subscribeToLeadChanges, getLeadSnapshot, () => '|||');
    const [leadIdValue, leadName, leadPhone] = leadSnapshot.split('|');
    const leadId = leadIdValue || null;
    const effectiveFormData = useMemo(
        () => ({
            ...formData,
            name: formData.name || leadName,
            phone: formData.phone || leadPhone,
        }),
        [formData, leadName, leadPhone],
    );

    const uploadedCount = Object.values(documents).filter(Boolean).length;
    const progressPercent = Math.round(((2 + uploadedCount / documentRequirements.length) / 5) * 100);
    const primaryIncome = getPrimaryIncomeValue(effectiveFormData);

    const errors = useMemo(() => {
        if (!submitted) {
            return {} as Partial<Record<keyof FormData | 'documents', string>>;
        }

        return validateApplication(effectiveFormData, primaryIncome, uploadedCount);
    }, [effectiveFormData, primaryIncome, submitted, uploadedCount]);

    useEffect(() => {
        if (!leadId) {
            router.push('/start');
            return;
        }

        if (formStartedTrackedRef.current) {
            return;
        }

        formStartedTrackedRef.current = true;
        void eventsService.createEvent({
            leadId,
            eventType: 'FORM_STARTED',
            metadata: { source: 'apply_page_opened' },
        });
    }, [leadId, router]);

    const updateField = (field: keyof FormData, value: string) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const updateCurrencyField = (field: keyof FormData, event: ChangeEvent<HTMLInputElement>) => {
        updateField(field, formatCurrency(event.target.value));
    };

    const handleDocument = (key: DocumentKey, file: File) => {
        const uploadedDocument: DocumentState = {
            fileName: file.name,
            size: formatFileSize(file.size),
            progress: 72,
            status: 'Uploaded',
        };

        if (leadId) {
            void eventsService.createEvent({
                leadId,
                eventType: 'DOCUMENT_UPLOADED',
                metadata: {
                    documentType: key,
                    fileName: file.name,
                    fileSize: file.size,
                },
            });
        }

        setDocuments((current) => ({
            ...current,
            [key]: uploadedDocument,
        }));

        window.setTimeout(() => {
            setDocuments((current) => {
                const currentDocument = current[key];

                if (!currentDocument || currentDocument.fileName !== file.name) {
                    return current;
                }

                return {
                    ...current,
                    [key]: {
                        ...currentDocument,
                        progress: 100,
                        status: 'Verified',
                    },
                };
            });
        }, 650);
    };

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setSubmitted(true);

        if (!leadId) {
            router.push('/start');
            return;
        }

        if (Object.keys(validateApplication(effectiveFormData, primaryIncome, uploadedCount)).length > 0) {
            return;
        }

        try {
            setLoading(true);

            const lead = await leadsService.updateLead(leadId, {
                salary: toNumber(primaryIncome),
                loanAmount: toNumber(formData.loanAmount),
                employmentType: mapEmploymentType(formData.incomeType),
            });

            await eventsService.createEvent({
                leadId: lead.id,
                eventType: 'SALARY_ENTERED',
                metadata: {
                    incomeType: effectiveFormData.incomeType,
                    declaredIncome: primaryIncome,
                    loanPurpose: effectiveFormData.loanPurpose,
                    tenure: effectiveFormData.tenure,
                },
            });

            saveNewSubmissionReference();
            router.push('/thank-you');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80 sm:p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">
                                Personal loan onboarding
                            </p>
                            <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                                Complete your application details
                            </h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                                Accurate income details and verified documents help us recommend stronger loan options
                                and may improve approval speed.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 lg:min-w-72">
                            <div className="flex items-center justify-between text-sm font-bold text-blue-950">
                                <span>Application readiness</span>
                                <span>{progressPercent}%</span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                                <div className="h-full rounded-full bg-blue-700" style={{ width: `${progressPercent}%` }} />
                            </div>
                            <p className="mt-3 text-xs font-semibold text-blue-900">
                                Your documents are encrypted and securely verified.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-5">
                        {[
                            ['Done', 'EMI Estimate'],
                            ['Done', 'Callback Consultation'],
                            ['Current', 'Application Details'],
                            [uploadedCount === documentRequirements.length ? 'Done' : 'Next', 'Verification'],
                            ['Next', 'Final Review'],
                        ].map(([status, label]) => (
                            <div
                                key={label}
                                className={[
                                    'rounded-xl border px-4 py-3',
                                    status === 'Done'
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                                        : status === 'Current'
                                          ? 'border-blue-200 bg-blue-50 text-blue-950'
                                          : 'border-slate-200 bg-slate-50 text-slate-500',
                                ].join(' ')}
                            >
                                <p className="text-xs font-black uppercase tracking-[0.14em]">{status}</p>
                                <p className="mt-1 text-sm font-bold">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate className="grid gap-6 xl:grid-cols-[1fr_360px]">
                    <div className="space-y-6">
                        <Section
                            eyebrow="Step 1"
                            title="Personal Information"
                            description="We use these details to connect your application to your LeadNexus profile."
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <Field
                                    label="Full Name"
                                    error={errors.name}
                                    helper={formData.name ? 'Profile matched from your onboarding journey.' : undefined}
                                    success={Boolean(formData.name)}
                                >
                                    <input
                                        type="text"
                                    value={effectiveFormData.name}
                                        disabled={Boolean(leadId)}
                                        readOnly={Boolean(leadId)}
                                        className={inputClass(Boolean(errors.name), Boolean(formData.name))}
                                        onChange={(event) => updateField('name', event.target.value)}
                                    />
                                </Field>

                                <Field label="Phone Number" error={errors.phone} helper="Used for secure application updates.">
                                    <input
                                        type="tel"
                                    value={effectiveFormData.phone}
                                        disabled={Boolean(leadId)}
                                        readOnly={Boolean(leadId)}
                                        className={inputClass(Boolean(errors.phone), digitsOnly(formData.phone).length >= 10)}
                                        onChange={(event) => updateField('phone', event.target.value)}
                                    />
                                </Field>

                                <Field label="Email Address" error={errors.email} helper="Optional, but useful for document status updates.">
                                    <input
                                        type="email"
                                        value={formData.email}
                                        placeholder="you@example.com"
                                        className={inputClass(Boolean(errors.email), Boolean(formData.email && !errors.email))}
                                        onChange={(event) => updateField('email', event.target.value)}
                                    />
                                </Field>
                            </div>
                        </Section>

                        <Section
                            eyebrow="Step 2"
                            title="Employment & Income Information"
                            description="Choose the income profile that best describes you. The application adapts verification fields automatically."
                        >
                            <fieldset>
                                <legend className="text-sm font-semibold text-slate-800">Income Type</legend>
                                <div className="mt-3 grid gap-3 md:grid-cols-5">
                                    {incomeOptions.map((option) => {
                                        const isSelected = formData.incomeType === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => updateField('incomeType', option.value)}
                                                className={[
                                                    'min-h-24 rounded-xl border p-3 text-left transition focus:outline-none focus:ring-4 focus:ring-blue-100',
                                                    isSelected
                                                        ? 'border-blue-700 bg-blue-50 text-blue-950 shadow-sm shadow-blue-900/10'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50',
                                                ].join(' ')}
                                            >
                                                <span className="block text-sm font-bold">{option.label}</span>
                                                <span className="mt-2 block text-xs leading-5 text-slate-500">{option.helper}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </fieldset>

                            <div className="mt-6 grid gap-5 md:grid-cols-2">
                                {formData.incomeType === 'SALARIED' && (
                                    <>
                                        <Field label="Monthly Salary" error={errors.monthlySalary} helper="Higher verified income may increase eligibility.">
                                            <input
                                                inputMode="numeric"
                                                value={formData.monthlySalary}
                                                placeholder="Rs 75,000"
                                                className={inputClass(Boolean(errors.monthlySalary), Boolean(formData.monthlySalary))}
                                                onChange={(event) => updateCurrencyField('monthlySalary', event)}
                                            />
                                        </Field>
                                        <Field label="Employer Name" helper="Shown only to verification specialists.">
                                            <input
                                                type="text"
                                                value={formData.employerName}
                                                placeholder="Company name"
                                                className={inputClass(false, Boolean(formData.employerName))}
                                                onChange={(event) => updateField('employerName', event.target.value)}
                                            />
                                        </Field>
                                        <Field label="Salary Account Bank" helper="Helps match bank statements quickly.">
                                            <input
                                                type="text"
                                                value={formData.salaryAccountBank}
                                                placeholder="HDFC Bank"
                                                className={inputClass(false, Boolean(formData.salaryAccountBank))}
                                                onChange={(event) => updateField('salaryAccountBank', event.target.value)}
                                            />
                                        </Field>
                                    </>
                                )}

                                {(formData.incomeType === 'SELF_EMPLOYED' || formData.incomeType === 'BUSINESS_OWNER') && (
                                    <>
                                        <Field label="Business Name" helper="Use the registered or operating business name.">
                                            <input
                                                type="text"
                                                value={formData.businessName}
                                                placeholder="Business name"
                                                className={inputClass(false, Boolean(formData.businessName))}
                                                onChange={(event) => updateField('businessName', event.target.value)}
                                            />
                                        </Field>
                                        <Field label="Annual Revenue" error={errors.monthlySalary} helper="We convert this into an average monthly income estimate.">
                                            <input
                                                inputMode="numeric"
                                                value={formData.annualRevenue}
                                                placeholder="Rs 18,00,000"
                                                className={inputClass(Boolean(errors.monthlySalary), Boolean(formData.annualRevenue))}
                                                onChange={(event) => updateCurrencyField('annualRevenue', event)}
                                            />
                                        </Field>
                                        <Field label="GST Number" helper="Optional, but useful for faster business verification.">
                                            <input
                                                type="text"
                                                value={formData.gstNumber}
                                                placeholder="22AAAAA0000A1Z5"
                                                className={inputClass(false, Boolean(formData.gstNumber))}
                                                onChange={(event) => updateField('gstNumber', event.target.value.toUpperCase())}
                                            />
                                        </Field>
                                    </>
                                )}

                                {formData.incomeType === 'FREELANCER' && (
                                    <>
                                        <Field label="Average Monthly Income" error={errors.monthlySalary} helper="Use your average from the last 6 months.">
                                            <input
                                                inputMode="numeric"
                                                value={formData.averageMonthlyIncome}
                                                placeholder="Rs 1,20,000"
                                                className={inputClass(Boolean(errors.monthlySalary), Boolean(formData.averageMonthlyIncome))}
                                                onChange={(event) => updateCurrencyField('averageMonthlyIncome', event)}
                                            />
                                        </Field>
                                        <Field label="Primary Work Category" helper="For example design, software, consulting, or content.">
                                            <input
                                                type="text"
                                                value={formData.primaryWorkCategory}
                                                placeholder="Software consulting"
                                                className={inputClass(false, Boolean(formData.primaryWorkCategory))}
                                                onChange={(event) => updateField('primaryWorkCategory', event.target.value)}
                                            />
                                        </Field>
                                    </>
                                )}

                                {formData.incomeType === 'RETIRED' && (
                                    <Field label="Monthly Pension / Investment Income" error={errors.monthlySalary} helper="Include recurring pension and stable investment payouts.">
                                        <input
                                            inputMode="numeric"
                                            value={formData.pensionIncome}
                                            placeholder="Rs 65,000"
                                            className={inputClass(Boolean(errors.monthlySalary), Boolean(formData.pensionIncome))}
                                            onChange={(event) => updateCurrencyField('pensionIncome', event)}
                                        />
                                    </Field>
                                )}
                            </div>
                        </Section>

                        <Section
                            eyebrow="Step 3"
                            title="Loan Requirement Details"
                            description="Tell us what you need so the lending team can align amount, tenure, and purpose with your profile."
                        >
                            <div className="grid gap-5 md:grid-cols-3">
                                <Field label="Required Loan Amount" error={errors.loanAmount} helper="Formatted automatically for review.">
                                    <input
                                        inputMode="numeric"
                                        value={formData.loanAmount}
                                        placeholder="Rs 5,00,000"
                                        className={inputClass(Boolean(errors.loanAmount), Boolean(formData.loanAmount))}
                                        onChange={(event) => updateCurrencyField('loanAmount', event)}
                                    />
                                </Field>
                                <Field label="Preferred Tenure" helper="Choose a repayment window in months.">
                                    <input
                                        inputMode="numeric"
                                        value={formData.tenure}
                                        className={inputClass(false, Boolean(formData.tenure))}
                                        onChange={(event) => updateField('tenure', digitsOnly(event.target.value))}
                                    />
                                </Field>
                                <Field label="Loan Purpose" helper="Helps route your application to the right policy checks.">
                                    <select
                                        value={formData.loanPurpose}
                                        onChange={(event) => updateField('loanPurpose', event.target.value)}
                                        className={inputClass(false, Boolean(formData.loanPurpose))}
                                    >
                                        <option>Debt consolidation</option>
                                        <option>Home renovation</option>
                                        <option>Medical expenses</option>
                                        <option>Education</option>
                                        <option>Business cash flow</option>
                                        <option>Other personal need</option>
                                    </select>
                                </Field>
                            </div>
                        </Section>

                        <Section
                            eyebrow="Step 4"
                            title="Document Upload & Verification"
                            description="Upload clear documents to move from application details into secure verification."
                        >
                            <div className="mb-5 grid gap-3 sm:grid-cols-3">
                                {['Bank-grade encryption', 'Secure verification process', 'Protected customer data'].map((item) => (
                                    <div key={item} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                {documentRequirements.map((requirement) => (
                                    <UploadCard
                                        key={requirement.key}
                                        requirement={requirement}
                                        document={documents[requirement.key]}
                                        onFile={(file) => handleDocument(requirement.key, file)}
                                        onRemove={() =>
                                            setDocuments((current) => ({
                                                ...current,
                                                [requirement.key]: null,
                                            }))
                                        }
                                    />
                                ))}
                            </div>

                            {errors.documents && <p className="mt-4 text-sm font-semibold text-red-600">{errors.documents}</p>}
                        </Section>
                    </div>

                    <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/80">
                            <h2 className="text-lg font-bold text-slate-950">Submission & Next Steps</h2>
                            <div className="mt-5 space-y-4">
                                {[
                                    ['Income profile', incomeOptions.find((option) => option.value === formData.incomeType)?.label ?? 'Salaried'],
                                    ['Documents', `${uploadedCount}/${documentRequirements.length} uploaded`],
                                    ['Verification', uploadedCount === documentRequirements.length ? 'Ready for review' : 'Pending uploads'],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                        <span className="text-sm text-slate-500">{label}</span>
                                        <span className="text-right text-sm font-bold text-slate-950">{value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 rounded-xl bg-slate-50 p-4">
                                <p className="text-sm font-semibold leading-6 text-slate-700">
                                    Verified documents may improve approval speed. Accurate income details help us
                                    recommend better loan options.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? 'Submitting details...' : 'Submit Application Details'}
                            </button>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                            <p className="text-sm font-bold text-blue-950">Accepted Formats</p>
                            <p className="mt-2 text-sm leading-6 text-blue-900">
                                PDF, JPG, and PNG files. Maximum size is 10MB per file.
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {['Pending', 'Uploaded', 'Verified'].map((status) => (
                                    <span key={status} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-800 ring-1 ring-blue-100">
                                        {status}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>
                </form>
            </div>
        </main>
    );
}
