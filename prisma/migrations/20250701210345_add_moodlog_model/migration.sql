-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('GREAT', 'GOOD', 'MEH', 'BAD', 'AWFUL');

-- CreateTable
CREATE TABLE "MoodLog" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "mood" "Mood" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoodLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MoodLog_userId_createdAt_idx" ON "MoodLog"("userId", "createdAt" DESC);
