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
};