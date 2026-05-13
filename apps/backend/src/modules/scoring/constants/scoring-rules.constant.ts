import { EventType } from '../../events/enums/event-type.enum';

export const EVENT_SCORE_MAP: Record<string, number> = {
  [EventType.LOAN_PAGE_VIEWED]: 5,
  [EventType.EMI_CALCULATOR_USED]: 15,
  [EventType.SALARY_ENTERED]: 15,
  [EventType.OTP_VERIFIED]: 10,
  [EventType.DOCUMENT_UPLOADED]: 25,
  [EventType.CALLBACK_REQUESTED]: 30,
  [EventType.FORM_ABANDONED]: -10,
};