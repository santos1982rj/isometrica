-- This migration duplicates the previous cascade override migration in some branches.
-- Keep it idempotent so fresh environments can apply the full migration history safely.
ALTER TABLE "Certificate" DROP CONSTRAINT IF EXISTS "Certificate_courseId_fkey";
ALTER TABLE "Payment" DROP CONSTRAINT IF EXISTS "Payment_subscriptionId_fkey";

ALTER TABLE "Certificate" ALTER COLUMN "courseId" DROP NOT NULL;

CREATE INDEX IF NOT EXISTS "SimuladoAnswer_questionId_idx" ON "SimuladoAnswer"("questionId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Payment_subscriptionId_fkey'
  ) THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Certificate_courseId_fkey'
  ) THEN
    ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
