-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "color" TEXT,
ADD COLUMN     "estimatedHours" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "level" TEXT NOT NULL DEFAULT 'iniciante';
