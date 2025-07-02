-- CreateEnum
CREATE TYPE "JournalPromptCategory" AS ENUM ('GRATITUDE', 'REFLECTION', 'GOAL_SETTING');

-- CreateEnum
CREATE TYPE "GuideCategory" AS ENUM ('FINANCE', 'CAREER');

-- CreateTable
CREATE TABLE "JournalPrompt" (
    "id" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "category" "JournalPromptCategory" NOT NULL,

    CONSTRAINT "JournalPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "coverImageUrl" TEXT NOT NULL,
    "category" "GuideCategory" NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideView" (
    "id" SERIAL NOT NULL,
    "guideId" INTEGER NOT NULL,
    "userId" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideFavorite" (
    "id" SERIAL NOT NULL,
    "guideId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "favoritedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JournalEntry_userId_promptId_createdAt_idx" ON "JournalEntry"("userId", "promptId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Guide_slug_key" ON "Guide"("slug");
