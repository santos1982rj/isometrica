-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLA_ESCOLHA', 'VERDADEIRO_FALSO', 'DISSERTATIVA', 'ASSOCIACAO');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('RASCUNHO', 'PUBLICADA', 'DESATIVADA');

-- AlterTable
ALTER TABLE "Alternative" ADD COLUMN     "feedback" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "estimatedTime" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "examId" TEXT,
ADD COLUMN     "resolutionUrl" TEXT,
ADD COLUMN     "sourceQuestionId" TEXT,
ADD COLUMN     "status" "QuestionStatus" NOT NULL DEFAULT 'PUBLICADA',
ADD COLUMN     "type" "QuestionType" NOT NULL DEFAULT 'MULTIPLA_ESCOLHA';

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "board" TEXT,
    "year" INTEGER,
    "role" TEXT,
    "organization" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTag" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "QuestionTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionStats" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,
    "avgTimeSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "QuestionStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionComment" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionStats_questionId_key" ON "QuestionStats"("questionId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_sourceQuestionId_fkey" FOREIGN KEY ("sourceQuestionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTag" ADD CONSTRAINT "QuestionTag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionStats" ADD CONSTRAINT "QuestionStats_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionComment" ADD CONSTRAINT "QuestionComment_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionComment" ADD CONSTRAINT "QuestionComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
