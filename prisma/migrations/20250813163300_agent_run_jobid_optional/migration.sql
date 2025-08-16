/*
  Warnings:

  - The values [CREATOR,ADMIN] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `completedAt` on the `AgentRun` table. All the data in the column will be lost.
  - You are about to drop the column `input` on the `AgentRun` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `AgentRun` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `AgentRun` table. All the data in the column will be lost.
  - You are about to drop the column `capabilities` on the `AgentTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `connectors` on the `AgentTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `customFields` on the `AgentTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `integrations` on the `AgentTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `AgentTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `performanceMetrics` on the `AgentTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `securityConfig` on the `AgentTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `workflowRelationships` on the `AgentTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `workflows` on the `AgentTemplate` table. All the data in the column will be lost.
  - The `defaultTools` column on the `AgentTemplate` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `FeatureFlag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `FeatureFlag` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `FeatureFlag` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `FeatureFlag` table. All the data in the column will be lost.
  - You are about to drop the column `banReason` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bonusExecutionCredits` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `coverPicture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `creatorBalance` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `currentMonthExecutionCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `currentStreak` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `currentVibeId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `familyId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isAmbassador` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isBanned` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `languagePreference` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastActiveAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyExecutionLimit` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileSpotlightEndsAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `publicProfile` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `referralCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `socialLinks` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCurrentPeriodEnd` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionTier` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Achievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AgentConfigRevision` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AgentShare` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AmbassadorMetric` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Badge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Changelog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommentLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ContentVector` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomPersona` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DigitalDetoxPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DigitalDetoxProgress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DigitalDetoxTask` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventAttendee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Family` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Friendship` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Guide` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuideFavorite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GuideView` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JournalEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JournalPrompt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MoodLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostLike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostRevision` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductivityTip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Squad` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SquadMembership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tool` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAchievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserBadge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserChangelogSeen` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vibe` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[jobId]` on the table `AgentRun` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,orgId]` on the table `AgentTemplate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `FeatureFlag` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `FeatureFlag` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name` to the `FeatureFlag` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FeatureFlag` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."AgentVisibility" AS ENUM ('PRIVATE', 'ORG', 'PUBLIC');

-- CreateEnum
CREATE TYPE "public"."BillingStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "public"."AgentRunStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."UserRole_new" AS ENUM ('USER', 'ORG_ADMIN', 'SUPER_ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."User" ALTER COLUMN "role" TYPE "public"."UserRole_new" USING ("role"::text::"public"."UserRole_new");
ALTER TYPE "public"."UserRole" RENAME TO "UserRole_old";
ALTER TYPE "public"."UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "public"."User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."AgentConfigRevision" DROP CONSTRAINT "AgentConfigRevision_agentInstanceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AgentConfigRevision" DROP CONSTRAINT "AgentConfigRevision_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AgentInstance" DROP CONSTRAINT "AgentInstance_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AgentInstance" DROP CONSTRAINT "AgentInstance_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AgentRun" DROP CONSTRAINT "AgentRun_agentInstanceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AgentRun" DROP CONSTRAINT "AgentRun_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AgentShare" DROP CONSTRAINT "AgentShare_agentInstanceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AgentShare" DROP CONSTRAINT "AgentShare_sharedWithUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AmbassadorMetric" DROP CONSTRAINT "AmbassadorMetric_ambassadorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AmbassadorMetric" DROP CONSTRAINT "AmbassadorMetric_referredUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Bill" DROP CONSTRAINT "Bill_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Budget" DROP CONSTRAINT "Budget_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentLike" DROP CONSTRAINT "CommentLike_commentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CommentLike" DROP CONSTRAINT "CommentLike_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ContentVector" DROP CONSTRAINT "ContentVector_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CustomPersona" DROP CONSTRAINT "CustomPersona_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DigitalDetoxProgress" DROP CONSTRAINT "DigitalDetoxProgress_taskId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DigitalDetoxProgress" DROP CONSTRAINT "DigitalDetoxProgress_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DigitalDetoxTask" DROP CONSTRAINT "DigitalDetoxTask_planId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Event" DROP CONSTRAINT "Event_familyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventAttendee" DROP CONSTRAINT "EventAttendee_eventId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventAttendee" DROP CONSTRAINT "EventAttendee_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Friendship" DROP CONSTRAINT "Friendship_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Friendship" DROP CONSTRAINT "Friendship_requesterId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GuideFavorite" DROP CONSTRAINT "GuideFavorite_guideId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GuideFavorite" DROP CONSTRAINT "GuideFavorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GuideView" DROP CONSTRAINT "GuideView_guideId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GuideView" DROP CONSTRAINT "GuideView_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JournalEntry" DROP CONSTRAINT "JournalEntry_promptId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JournalEntry" DROP CONSTRAINT "JournalEntry_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MoodLog" DROP CONSTRAINT "MoodLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostLike" DROP CONSTRAINT "PostLike_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostLike" DROP CONSTRAINT "PostLike_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PostRevision" DROP CONSTRAINT "PostRevision_postId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Squad" DROP CONSTRAINT "Squad_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SquadMembership" DROP CONSTRAINT "SquadMembership_squadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SquadMembership" DROP CONSTRAINT "SquadMembership_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Tip" DROP CONSTRAINT "Tip_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Tip" DROP CONSTRAINT "Tip_toUserId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_budgetId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_currentVibeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_familyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserAchievement" DROP CONSTRAINT "UserAchievement_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserAchievement" DROP CONSTRAINT "UserAchievement_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserActivity" DROP CONSTRAINT "UserActivity_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserBadge" DROP CONSTRAINT "UserBadge_badgeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserBadge" DROP CONSTRAINT "UserBadge_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserChangelogSeen" DROP CONSTRAINT "UserChangelogSeen_changelogId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserChangelogSeen" DROP CONSTRAINT "UserChangelogSeen_userId_fkey";

-- DropIndex
DROP INDEX "public"."User_referralCode_key";

-- AlterTable
ALTER TABLE "public"."AgentInstance" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "visibility" "public"."AgentVisibility" NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "public"."AgentRun" DROP COLUMN "completedAt",
DROP COLUMN "input",
DROP COLUMN "output",
DROP COLUMN "userId",
ADD COLUMN     "cost" DOUBLE PRECISION,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "jobId" TEXT,
ADD COLUMN     "logsPointer" TEXT,
ADD COLUMN     "metrics" JSONB,
ADD COLUMN     "retries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "startedAt" DROP NOT NULL,
ALTER COLUMN "startedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."AgentTemplate" DROP COLUMN "capabilities",
DROP COLUMN "connectors",
DROP COLUMN "customFields",
DROP COLUMN "integrations",
DROP COLUMN "metadata",
DROP COLUMN "performanceMetrics",
DROP COLUMN "securityConfig",
DROP COLUMN "workflowRelationships",
DROP COLUMN "workflows",
ADD COLUMN     "defaultConfig" JSONB,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "health" JSONB,
ADD COLUMN     "jobQueue" JSONB,
ADD COLUMN     "orgId" TEXT,
ADD COLUMN     "steps" JSONB,
ALTER COLUMN "category" DROP DEFAULT,
DROP COLUMN "defaultTools",
ADD COLUMN     "defaultTools" JSONB;

-- AlterTable
ALTER TABLE "public"."FeatureFlag" DROP CONSTRAINT "FeatureFlag_pkey",
DROP COLUMN "description",
DROP COLUMN "key",
DROP COLUMN "value",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "banReason",
DROP COLUMN "bio",
DROP COLUMN "bonusExecutionCredits",
DROP COLUMN "coverPicture",
DROP COLUMN "creatorBalance",
DROP COLUMN "currentMonthExecutionCount",
DROP COLUMN "currentStreak",
DROP COLUMN "currentVibeId",
DROP COLUMN "emailVerified",
DROP COLUMN "familyId",
DROP COLUMN "isAmbassador",
DROP COLUMN "isBanned",
DROP COLUMN "languagePreference",
DROP COLUMN "lastActiveAt",
DROP COLUMN "level",
DROP COLUMN "monthlyExecutionLimit",
DROP COLUMN "passwordHash",
DROP COLUMN "profilePicture",
DROP COLUMN "profileSpotlightEndsAt",
DROP COLUMN "publicProfile",
DROP COLUMN "referralCode",
DROP COLUMN "socialLinks",
DROP COLUMN "stripeCurrentPeriodEnd",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripePriceId",
DROP COLUMN "stripeSubscriptionId",
DROP COLUMN "subscriptionTier",
DROP COLUMN "xp",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "orgId" TEXT,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "public"."Achievement";

-- DropTable
DROP TABLE "public"."AgentConfigRevision";

-- DropTable
DROP TABLE "public"."AgentShare";

-- DropTable
DROP TABLE "public"."AmbassadorMetric";

-- DropTable
DROP TABLE "public"."Badge";

-- DropTable
DROP TABLE "public"."Bill";

-- DropTable
DROP TABLE "public"."Budget";

-- DropTable
DROP TABLE "public"."Changelog";

-- DropTable
DROP TABLE "public"."Comment";

-- DropTable
DROP TABLE "public"."CommentLike";

-- DropTable
DROP TABLE "public"."ContentVector";

-- DropTable
DROP TABLE "public"."CustomPersona";

-- DropTable
DROP TABLE "public"."DigitalDetoxPlan";

-- DropTable
DROP TABLE "public"."DigitalDetoxProgress";

-- DropTable
DROP TABLE "public"."DigitalDetoxTask";

-- DropTable
DROP TABLE "public"."Event";

-- DropTable
DROP TABLE "public"."EventAttendee";

-- DropTable
DROP TABLE "public"."Family";

-- DropTable
DROP TABLE "public"."Friendship";

-- DropTable
DROP TABLE "public"."Guide";

-- DropTable
DROP TABLE "public"."GuideFavorite";

-- DropTable
DROP TABLE "public"."GuideView";

-- DropTable
DROP TABLE "public"."JournalEntry";

-- DropTable
DROP TABLE "public"."JournalPrompt";

-- DropTable
DROP TABLE "public"."MoodLog";

-- DropTable
DROP TABLE "public"."Notification";

-- DropTable
DROP TABLE "public"."Post";

-- DropTable
DROP TABLE "public"."PostLike";

-- DropTable
DROP TABLE "public"."PostRevision";

-- DropTable
DROP TABLE "public"."ProductivityTip";

-- DropTable
DROP TABLE "public"."Squad";

-- DropTable
DROP TABLE "public"."SquadMembership";

-- DropTable
DROP TABLE "public"."Subscription";

-- DropTable
DROP TABLE "public"."Task";

-- DropTable
DROP TABLE "public"."Tip";

-- DropTable
DROP TABLE "public"."Tool";

-- DropTable
DROP TABLE "public"."Transaction";

-- DropTable
DROP TABLE "public"."UserAchievement";

-- DropTable
DROP TABLE "public"."UserActivity";

-- DropTable
DROP TABLE "public"."UserBadge";

-- DropTable
DROP TABLE "public"."UserChangelogSeen";

-- DropTable
DROP TABLE "public"."Vibe";

-- DropEnum
DROP TYPE "public"."FriendshipStatus";

-- DropEnum
DROP TYPE "public"."GuideCategory";

-- DropEnum
DROP TYPE "public"."JournalPromptCategory";

-- DropEnum
DROP TYPE "public"."Mood";

-- DropEnum
DROP TYPE "public"."NotificationType";

-- DropEnum
DROP TYPE "public"."PostType";

-- CreateTable
CREATE TABLE "public"."AgentCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentInstanceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "secretId" TEXT NOT NULL,
    "rotatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Secret" (
    "id" TEXT NOT NULL,
    "encryptedBlob" BYTEA NOT NULL,
    "kmsKeyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Secret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentEvent" (
    "id" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UsageMeter" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "orgId" TEXT,
    "model" TEXT,
    "tool" TEXT,
    "agentId" TEXT,
    "count" INTEGER NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageMeter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BillingAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "orgId" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "billingAccountId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "status" "public"."BillingStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Charge" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "stripeChargeId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "public"."BillingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "orgId" TEXT,
    "action" TEXT NOT NULL,
    "targetId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentCredential_provider_idx" ON "public"."AgentCredential"("provider");

-- CreateIndex
CREATE INDEX "AgentCredential_secretId_idx" ON "public"."AgentCredential"("secretId");

-- CreateIndex
CREATE UNIQUE INDEX "AgentCredential_userId_agentInstanceId_provider_key" ON "public"."AgentCredential"("userId", "agentInstanceId", "provider");

-- CreateIndex
CREATE INDEX "UsageMeter_periodStart_periodEnd_idx" ON "public"."UsageMeter"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "BillingAccount_userId_key" ON "public"."BillingAccount"("userId");

-- CreateIndex
CREATE INDEX "AgentInstance_userId_idx" ON "public"."AgentInstance"("userId");

-- CreateIndex
CREATE INDEX "AgentInstance_templateId_idx" ON "public"."AgentInstance"("templateId");

-- CreateIndex
CREATE INDEX "AgentInstance_deletedAt_idx" ON "public"."AgentInstance"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentRun_jobId_key" ON "public"."AgentRun"("jobId");

-- CreateIndex
CREATE INDEX "AgentTemplate_orgId_idx" ON "public"."AgentTemplate"("orgId");

-- CreateIndex
CREATE INDEX "AgentTemplate_deletedAt_idx" ON "public"."AgentTemplate"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentTemplate_name_orgId_key" ON "public"."AgentTemplate"("name", "orgId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_name_key" ON "public"."FeatureFlag"("name");

-- AddForeignKey
ALTER TABLE "public"."AgentInstance" ADD CONSTRAINT "AgentInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentInstance" ADD CONSTRAINT "AgentInstance_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."AgentTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentCredential" ADD CONSTRAINT "AgentCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentCredential" ADD CONSTRAINT "AgentCredential_agentInstanceId_fkey" FOREIGN KEY ("agentInstanceId") REFERENCES "public"."AgentInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentCredential" ADD CONSTRAINT "AgentCredential_secretId_fkey" FOREIGN KEY ("secretId") REFERENCES "public"."Secret"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentRun" ADD CONSTRAINT "AgentRun_agentInstanceId_fkey" FOREIGN KEY ("agentInstanceId") REFERENCES "public"."AgentInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentEvent" ADD CONSTRAINT "AgentEvent_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "public"."AgentRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BillingAccount" ADD CONSTRAINT "BillingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "public"."BillingAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Charge" ADD CONSTRAINT "Charge_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
