import { LeadStage } from '@prisma/client';

export const getLeadStage = (
  finalScore: number,
): LeadStage => {
  if (finalScore >= 90) {
    return LeadStage.HOT;
  }

  if (finalScore >= 70) {
    return LeadStage.QUALIFIED;
  }

  if (finalScore >= 50) {
    return LeadStage.INTERESTED;
  }

  if (finalScore >= 25) {
    return LeadStage.ENGAGED;
  }

  return LeadStage.NEW;
};