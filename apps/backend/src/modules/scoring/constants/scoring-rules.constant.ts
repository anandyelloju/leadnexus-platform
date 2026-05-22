import { EventType } from '../../events/enums/event-type.enum';

export type ScoreBucket =
  | 'intent'
  | 'eligibility'
  | 'engagement'
  | 'risk'
  | 'none';

export const EVENT_SCORE_RULES: Record<
  EventType,
  {
    bucket: ScoreBucket;
    value: number;
  }
> = {
  [EventType.LANDING_PAGE_VIEWED]: {
    bucket: 'none',
    value: 0,
  },
  [EventType.LOAN_PAGE_VIEWED]: {
    bucket: 'none',
    value: 0,
  },
  [EventType.EMI_CALCULATOR_USED]: {
    bucket: 'intent',
    value: 15,
  },
  [EventType.SALARY_ENTERED]: {
    bucket: 'eligibility',
    value: 10,
  },
  [EventType.OTP_VERIFIED]: {
    bucket: 'engagement',
    value: 10,
  },
  [EventType.FORM_STARTED]: {
    bucket: 'intent',
    value: 5,
  },
  [EventType.FORM_ABANDONED]: {
    bucket: 'risk',
    value: -20,
  },
  [EventType.DOCUMENT_UPLOADED]: {
    bucket: 'engagement',
    value: 15,
  },
  [EventType.CALLBACK_REQUESTED]: {
    bucket: 'intent',
    value: 25,
  },
  [EventType.LEAD_INACTIVE]: {
    bucket: 'risk',
    value: -10,
  },
  [EventType.LEAD_STAGE_CHANGED]: {
    bucket: 'none',
    value: 0,
  },
  [EventType.MORE_INFORMATION_REQUESTED]: {
    bucket: 'none',
    value: 0,
  },
  [EventType.LEAD_UNDER_REVIEW]: {
    bucket: 'engagement',
    value: 5,
  },
  [EventType.VERIFICATION_ITEM_COMPLETED]: {
    bucket: 'eligibility',
    value: 5,
  },
  [EventType.VERIFICATION_ITEM_REOPENED]: {
    bucket: 'risk',
    value: -5,
  },
  [EventType.LEAD_VERIFIED]: {
    bucket: 'eligibility',
    value: 15,
  },
  [EventType.LEAD_APPROVED]: {
    bucket: 'eligibility',
    value: 20,
  },
  [EventType.LEAD_CONVERTED]: {
    bucket: 'none',
    value: 0,
  },
  [EventType.LEAD_REJECTED]: {
    bucket: 'risk',
    value: -25,
  },
  [EventType.UNDERWRITING_NOTE_ADDED]: {
    bucket: 'none',
    value: 0,
  },
};
