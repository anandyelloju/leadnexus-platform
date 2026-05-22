import { LeadStage } from '@prisma/client';

export const getLeadStage = (
  finalScore: number,
): LeadStage => {
  if (finalScore >= 110) {
    return LeadStage.HOT;
  }

  if (finalScore >= 85) {
    return LeadStage.HOT;
  }

  if (finalScore >= 55) {
    return LeadStage.ENGAGED;
  }

  if (finalScore >= 30) {
    return LeadStage.ENGAGED;
  }

  return LeadStage.NEW;
};
