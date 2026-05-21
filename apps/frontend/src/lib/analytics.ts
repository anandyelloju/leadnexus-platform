import { eventsService } from '@/services/events.service';

export const ONBOARDING_EVENTS = {
  EMI_CALCULATOR_OPENED: 'emi_calculator_opened',
  LOAN_AMOUNT_CHANGED: 'loan_amount_changed',
  TENURE_CHANGED: 'tenure_changed',
  CALCULATE_EMI_CLICKED: 'calculate_emi_clicked',
  EMI_RESULT_VIEWED: 'emi_result_viewed',
  CALLBACK_CTA_CLICKED: 'callback_cta_clicked',
  CONTINUE_APPLICATION_CLICKED: 'continue_application_clicked',
  APPLICATION_SUBMITTED: 'application_submitted',
  THANK_YOU_PAGE_VIEWED: 'thank_you_page_viewed',
  DASHBOARD_CTA_CLICKED: 'dashboard_cta_clicked',
  APPLICATION_TRACKING_CTA_CLICKED: 'application_tracking_cta_clicked',
} as const;

type OnboardingEventName = (typeof ONBOARDING_EVENTS)[keyof typeof ONBOARDING_EVENTS];

type TrackOptions = {
  metadata?: Record<string, unknown>;
  persistToServer?: boolean;
  serverEventType?: 'EMI_CALCULATOR_USED' | 'CALLBACK_REQUESTED' | 'FORM_STARTED';
};

function getLeadId() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem('leadId');
}

export async function trackOnboardingEvent(eventName: OnboardingEventName, options: TrackOptions = {}) {
  const payload = {
    eventName,
    occurredAt: new Date().toISOString(),
    ...options.metadata,
  };

  if (process.env.NODE_ENV !== 'production') {
    console.info('[LeadNexus analytics]', payload);
  }

  if (!options.persistToServer || !options.serverEventType) {
    return;
  }

  const leadId = getLeadId();
  if (!leadId) {
    return;
  }

  try {
    await eventsService.createEvent({
      leadId,
      eventType: options.serverEventType,
      metadata: payload,
    });
  } catch (error) {
    console.error('Analytics tracking failed', error);
  }
}
