-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'COMMENT_LIKE';
ALTER TYPE "NotificationType" ADD VALUE 'REPLY';
ALTER TYPE "NotificationType" ADD VALUE 'NEW_POST';
ALTER TYPE "NotificationType" ADD VALUE 'NEWS';
ALTER TYPE "NotificationType" ADD VALUE 'MENTION';
ALTER TYPE "NotificationType" ADD VALUE 'ACHIEVEMENT';
ALTER TYPE "NotificationType" ADD VALUE 'SYSTEM';

-- CreateTable
CREATE TABLE "NewsArticleLike" (
    "userId" TEXT NOT NULL,
    "newsArticleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsArticleLike_pkey" PRIMARY KEY ("userId","newsArticleId")
);

-- CreateTable
CREATE TABLE "GenZContent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "engagement" INTEGER NOT NULL DEFAULT 0,
    "sourceName" TEXT,
    "imageUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "category" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenZContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsArticleLike_newsArticleId_idx" ON "NewsArticleLike"("newsArticleId");

-- CreateIndex
CREATE UNIQUE INDEX "GenZContent_sourceUrl_key" ON "GenZContent"("sourceUrl");
