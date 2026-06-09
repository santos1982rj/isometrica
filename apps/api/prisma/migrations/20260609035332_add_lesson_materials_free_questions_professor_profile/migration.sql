-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "free" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "materials" JSONB;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "lessonId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "lattes" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "twitter" TEXT;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
