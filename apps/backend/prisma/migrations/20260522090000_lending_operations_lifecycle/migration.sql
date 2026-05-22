ALTER TYPE "LeadStage" ADD VALUE IF NOT EXISTS 'DOCUMENTS_PENDING';
ALTER TYPE "LeadStage" ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';
ALTER TYPE "LeadStage" ADD VALUE IF NOT EXISTS 'VERIFIED';
ALTER TYPE "LeadStage" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "LeadStage" ADD VALUE IF NOT EXISTS 'REJECTED';

ALTER TABLE "leads"
ADD COLUMN IF NOT EXISTS "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "convertedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "underwritingDecision" TEXT;

CREATE TABLE IF NOT EXISTS "lead_verification_items" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP(3),
  "completedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "lead_verification_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "lead_verification_items_leadId_key_key"
ON "lead_verification_items"("leadId", "key");

ALTER TABLE "lead_verification_items"
ADD CONSTRAINT "lead_verification_items_leadId_fkey"
FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "underwriting_notes" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "noteType" TEXT NOT NULL DEFAULT 'UNDERWRITING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "underwriting_notes_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "underwriting_notes"
ADD CONSTRAINT "underwriting_notes_leadId_fkey"
FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
