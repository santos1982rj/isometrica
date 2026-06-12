-- Phase 2: banco, migrations e integridade.
-- Backfill order fields to avoid unique violations on existing duplicate order values.
WITH ranked_modules AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "courseId" ORDER BY "order", "createdAt", id) AS new_order
  FROM "Module"
)
UPDATE "Module"
SET "order" = ranked_modules.new_order
FROM ranked_modules
WHERE "Module".id = ranked_modules.id;

WITH ranked_lessons AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "moduleId" ORDER BY "order", "createdAt", id) AS new_order
  FROM "Lesson"
)
UPDATE "Lesson"
SET "order" = ranked_lessons.new_order
FROM ranked_lessons
WHERE "Lesson".id = ranked_lessons.id;

-- Course ownership base. Nullable to preserve existing courses and allow admin-created catalog entries.
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "professorId" TEXT;
CREATE INDEX IF NOT EXISTS "Course_professorId_idx" ON "Course"("professorId");
ALTER TABLE "Course" ADD CONSTRAINT "Course_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Basic financial integrity for payments.
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE NOT VALID;

-- Course purchase bridge. Keeps legacy itemType/itemId for compatibility while adding FK-backed course purchases.
ALTER TABLE "Purchase" ADD COLUMN IF NOT EXISTS "courseId" TEXT;
UPDATE "Purchase" p
SET "courseId" = p."itemId"
WHERE p."itemType" = 'course'
  AND p."courseId" IS NULL
  AND EXISTS (SELECT 1 FROM "Course" c WHERE c.id = p."itemId");
CREATE INDEX IF NOT EXISTS "Purchase_courseId_idx" ON "Purchase"("courseId");
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Ordering constraints.
CREATE UNIQUE INDEX IF NOT EXISTS "Module_courseId_order_key" ON "Module"("courseId", "order");
CREATE UNIQUE INDEX IF NOT EXISTS "Lesson_moduleId_order_key" ON "Lesson"("moduleId", "order");

-- Structured materials table. The legacy Lesson.materials JSON field is preserved for compatibility.
CREATE TABLE IF NOT EXISTS "LessonMaterial" (
  "id" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "type" TEXT,
  "sizeBytes" INTEGER,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LessonMaterial_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "LessonMaterial_lessonId_idx" ON "LessonMaterial"("lessonId");
ALTER TABLE "LessonMaterial" ADD CONSTRAINT "LessonMaterial_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
