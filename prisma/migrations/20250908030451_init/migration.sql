-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ORG_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."AgentRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'AWAITING_INPUT');

-- CreateEnum
CREATE TYPE "public"."AgentVisibility" AS ENUM ('PRIVATE', 'ORG', 'PUBLIC');

-- CreateEnum
CREATE TYPE "public"."BillingStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PersonaStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."PersonaVisibility" AS ENUM ('PRIVATE', 'PUBLIC', 'SHARED');

-- CreateEnum
CREATE TYPE "public"."GuideStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'UNDER_REVIEW');

-- CreateEnum
CREATE TYPE "public"."GuideDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "public"."GuideStepType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'CODE', 'QUIZ', 'EXERCISE');

-- CreateEnum
CREATE TYPE "public"."NewsArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'FEATURED');

-- CreateEnum
CREATE TYPE "public"."NewsSourceType" AS ENUM ('RSS', 'API', 'MANUAL', 'SCRAPED');

-- CreateEnum
CREATE TYPE "public"."NewsCategory" AS ENUM ('TECHNOLOGY', 'BUSINESS', 'SCIENCE', 'HEALTH', 'ENTERTAINMENT', 'SPORTS', 'POLITICS', 'EDUCATION', 'LIFESTYLE', 'TRAVEL', 'FOOD', 'FASHION', 'GAMING', 'AI_ML', 'PROGRAMMING', 'STARTUPS', 'CRYPTO', 'OTHER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "orgId" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "subscriptionTier" TEXT NOT NULL DEFAULT 'FREE',
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT,
    "defaultPrompt" TEXT NOT NULL,
    "defaultModel" TEXT NOT NULL DEFAULT 'gpt-4o',
    "defaultTools" JSONB,
    "defaultConfig" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "orgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "steps" JSONB,
    "credentials" JSONB,
    "health" JSONB,
    "jobQueue" JSONB,

    CONSTRAINT "AgentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentInstance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "configOverride" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "visibility" "public"."AgentVisibility" NOT NULL DEFAULT 'PRIVATE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AgentInstance_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "public"."AgentRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentInstanceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "cost" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AgentRunStep" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "AgentRunStep_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."FeatureFlag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "public"."AISummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceText" TEXT,
    "model" TEXT NOT NULL DEFAULT 'gpt-4o',
    "tokensUsed" INTEGER,
    "cost" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "tags" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AISummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "mediaUrls" TEXT[],
    "tags" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "parentCommentId" TEXT,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WellnessSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "moodBefore" INTEGER,
    "moodAfter" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WellnessSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "benefits" TEXT[],
    "location" TEXT NOT NULL,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "postedBy" TEXT,
    "applications" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JobApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "coverLetter" TEXT,
    "resumeUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "billingPeriod" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT NOT NULL,
    "referenceId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tip" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "message" TEXT,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Friendship" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Achievement" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 10,
    "requirements" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" INTEGER NOT NULL DEFAULT 100,
    "metadata" JSONB,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AmbassadorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'BRONZE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "monthlyEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lifetimeEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bio" TEXT,
    "socialLinks" JSONB,
    "specialties" TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmbassadorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AmbassadorActivity" (
    "id" TEXT NOT NULL,
    "ambassadorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "earnings" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AmbassadorActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AmbassadorReward" (
    "id" TEXT NOT NULL,
    "ambassadorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "claimedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AmbassadorReward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "referredId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rewardAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExclusiveContent" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "tier" TEXT NOT NULL DEFAULT 'PREMIUM',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "thumbnailUrl" TEXT,
    "mediaUrls" TEXT[],
    "duration" INTEGER,
    "difficulty" TEXT,
    "prerequisites" TEXT[],
    "learningOutcomes" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ExclusiveContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "accessType" TEXT NOT NULL DEFAULT 'PURCHASED',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContentAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentComment" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ContentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpotlightProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specialties" TEXT[],
    "socialLinks" JSONB,
    "portfolio" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "featuredUntil" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "contactCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotlightProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpotlightReview" (
    "id" TEXT NOT NULL,
    "spotlightId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotlightReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HealthMetric" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HealthGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "originalPrice" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "category" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "image" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "discount" INTEGER,
    "tags" TEXT[],
    "sellerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CartItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WishlistItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductReview" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "notHelpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Budget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "category" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Bill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "frequency" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Persona" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "avatar" TEXT,
    "status" "public"."PersonaStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "public"."PersonaVisibility" NOT NULL DEFAULT 'PRIVATE',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonaInstance" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonaInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonaReview" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "notHelpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonaReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonaShare" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sharedWith" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonaShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Guide" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" "public"."GuideDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "status" "public"."GuideStatus" NOT NULL DEFAULT 'DRAFT',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail" TEXT,
    "estimatedTime" INTEGER,
    "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "learningOutcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuideStep" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "public"."GuideStepType" NOT NULL DEFAULT 'TEXT',
    "order" INTEGER NOT NULL,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "estimatedTime" INTEGER,
    "mediaUrl" TEXT,
    "codeLanguage" TEXT,
    "quizData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuideReview" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "notHelpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuideProgress" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentStep" TEXT,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GuideBookmark" (
    "id" TEXT NOT NULL,
    "guideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NewsSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."NewsSourceType" NOT NULL DEFAULT 'RSS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastFetched" TIMESTAMP(3),
    "fetchInterval" INTEGER NOT NULL DEFAULT 3600,
    "categories" "public"."NewsCategory"[] DEFAULT ARRAY[]::"public"."NewsCategory"[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NewsArticle" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "url" TEXT NOT NULL,
    "imageUrl" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "status" "public"."NewsArticleStatus" NOT NULL DEFAULT 'PUBLISHED',
    "category" "public"."NewsCategory" NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "sentiment" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NewsInteraction" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NewsBookmark" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserNewsPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categories" "public"."NewsCategory"[] DEFAULT ARRAY[]::"public"."NewsCategory"[],
    "sources" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNewsPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AgentTemplate_name_key" ON "public"."AgentTemplate"("name");

-- CreateIndex
CREATE INDEX "AgentTemplate_orgId_idx" ON "public"."AgentTemplate"("orgId");

-- CreateIndex
CREATE INDEX "AgentTemplate_deletedAt_idx" ON "public"."AgentTemplate"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentTemplate_name_orgId_key" ON "public"."AgentTemplate"("name", "orgId");

-- CreateIndex
CREATE INDEX "AgentInstance_userId_idx" ON "public"."AgentInstance"("userId");

-- CreateIndex
CREATE INDEX "AgentInstance_templateId_idx" ON "public"."AgentInstance"("templateId");

-- CreateIndex
CREATE INDEX "AgentInstance_deletedAt_idx" ON "public"."AgentInstance"("deletedAt");

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
CREATE UNIQUE INDEX "FeatureFlag_name_key" ON "public"."FeatureFlag"("name");

-- CreateIndex
CREATE INDEX "AISummary_userId_idx" ON "public"."AISummary"("userId");

-- CreateIndex
CREATE INDEX "AISummary_sourceType_idx" ON "public"."AISummary"("sourceType");

-- CreateIndex
CREATE INDEX "AISummary_isPublic_idx" ON "public"."AISummary"("isPublic");

-- CreateIndex
CREATE INDEX "AISummary_deletedAt_idx" ON "public"."AISummary"("deletedAt");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "public"."Post"("userId");

-- CreateIndex
CREATE INDEX "Post_type_idx" ON "public"."Post"("type");

-- CreateIndex
CREATE INDEX "Post_isPublic_idx" ON "public"."Post"("isPublic");

-- CreateIndex
CREATE INDEX "Post_deletedAt_idx" ON "public"."Post"("deletedAt");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "public"."Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "public"."Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_parentCommentId_idx" ON "public"."Comment"("parentCommentId");

-- CreateIndex
CREATE INDEX "Comment_deletedAt_idx" ON "public"."Comment"("deletedAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "public"."Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "WellnessSession_userId_idx" ON "public"."WellnessSession"("userId");

-- CreateIndex
CREATE INDEX "WellnessSession_type_idx" ON "public"."WellnessSession"("type");

-- CreateIndex
CREATE INDEX "WellnessSession_createdAt_idx" ON "public"."WellnessSession"("createdAt");

-- CreateIndex
CREATE INDEX "Job_category_idx" ON "public"."Job"("category");

-- CreateIndex
CREATE INDEX "Job_type_idx" ON "public"."Job"("type");

-- CreateIndex
CREATE INDEX "Job_level_idx" ON "public"."Job"("level");

-- CreateIndex
CREATE INDEX "Job_isActive_idx" ON "public"."Job"("isActive");

-- CreateIndex
CREATE INDEX "Job_expiresAt_idx" ON "public"."Job"("expiresAt");

-- CreateIndex
CREATE INDEX "JobApplication_userId_idx" ON "public"."JobApplication"("userId");

-- CreateIndex
CREATE INDEX "JobApplication_jobId_idx" ON "public"."JobApplication"("jobId");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "public"."JobApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_userId_jobId_key" ON "public"."JobApplication"("userId", "jobId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "public"."Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "public"."Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_nextBillingDate_idx" ON "public"."Subscription"("nextBillingDate");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "public"."Wallet"("userId");

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "public"."Wallet"("userId");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletId_idx" ON "public"."WalletTransaction"("walletId");

-- CreateIndex
CREATE INDEX "WalletTransaction_type_idx" ON "public"."WalletTransaction"("type");

-- CreateIndex
CREATE INDEX "WalletTransaction_status_idx" ON "public"."WalletTransaction"("status");

-- CreateIndex
CREATE INDEX "WalletTransaction_createdAt_idx" ON "public"."WalletTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "Tip_senderId_idx" ON "public"."Tip"("senderId");

-- CreateIndex
CREATE INDEX "Tip_receiverId_idx" ON "public"."Tip"("receiverId");

-- CreateIndex
CREATE INDEX "Tip_status_idx" ON "public"."Tip"("status");

-- CreateIndex
CREATE INDEX "Tip_createdAt_idx" ON "public"."Tip"("createdAt");

-- CreateIndex
CREATE INDEX "Friendship_userId_idx" ON "public"."Friendship"("userId");

-- CreateIndex
CREATE INDEX "Friendship_friendId_idx" ON "public"."Friendship"("friendId");

-- CreateIndex
CREATE INDEX "Friendship_status_idx" ON "public"."Friendship"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_userId_friendId_key" ON "public"."Friendship"("userId", "friendId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_name_key" ON "public"."Achievement"("name");

-- CreateIndex
CREATE INDEX "Achievement_category_idx" ON "public"."Achievement"("category");

-- CreateIndex
CREATE INDEX "Achievement_isActive_idx" ON "public"."Achievement"("isActive");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "public"."UserAchievement"("userId");

-- CreateIndex
CREATE INDEX "UserAchievement_achievementId_idx" ON "public"."UserAchievement"("achievementId");

-- CreateIndex
CREATE INDEX "UserAchievement_earnedAt_idx" ON "public"."UserAchievement"("earnedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "public"."UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "AmbassadorProfile_userId_key" ON "public"."AmbassadorProfile"("userId");

-- CreateIndex
CREATE INDEX "AmbassadorProfile_userId_idx" ON "public"."AmbassadorProfile"("userId");

-- CreateIndex
CREATE INDEX "AmbassadorProfile_tier_idx" ON "public"."AmbassadorProfile"("tier");

-- CreateIndex
CREATE INDEX "AmbassadorProfile_status_idx" ON "public"."AmbassadorProfile"("status");

-- CreateIndex
CREATE INDEX "AmbassadorProfile_totalReferrals_idx" ON "public"."AmbassadorProfile"("totalReferrals");

-- CreateIndex
CREATE INDEX "AmbassadorActivity_ambassadorId_idx" ON "public"."AmbassadorActivity"("ambassadorId");

-- CreateIndex
CREATE INDEX "AmbassadorActivity_type_idx" ON "public"."AmbassadorActivity"("type");

-- CreateIndex
CREATE INDEX "AmbassadorActivity_createdAt_idx" ON "public"."AmbassadorActivity"("createdAt");

-- CreateIndex
CREATE INDEX "AmbassadorReward_ambassadorId_idx" ON "public"."AmbassadorReward"("ambassadorId");

-- CreateIndex
CREATE INDEX "AmbassadorReward_type_idx" ON "public"."AmbassadorReward"("type");

-- CreateIndex
CREATE INDEX "AmbassadorReward_status_idx" ON "public"."AmbassadorReward"("status");

-- CreateIndex
CREATE INDEX "AmbassadorReward_expiresAt_idx" ON "public"."AmbassadorReward"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referredId_key" ON "public"."Referral"("referredId");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "public"."Referral"("referrerId");

-- CreateIndex
CREATE INDEX "Referral_referredId_idx" ON "public"."Referral"("referredId");

-- CreateIndex
CREATE INDEX "Referral_status_idx" ON "public"."Referral"("status");

-- CreateIndex
CREATE INDEX "Referral_createdAt_idx" ON "public"."Referral"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referrerId_referredId_key" ON "public"."Referral"("referrerId", "referredId");

-- CreateIndex
CREATE INDEX "ExclusiveContent_authorId_idx" ON "public"."ExclusiveContent"("authorId");

-- CreateIndex
CREATE INDEX "ExclusiveContent_type_idx" ON "public"."ExclusiveContent"("type");

-- CreateIndex
CREATE INDEX "ExclusiveContent_category_idx" ON "public"."ExclusiveContent"("category");

-- CreateIndex
CREATE INDEX "ExclusiveContent_tier_idx" ON "public"."ExclusiveContent"("tier");

-- CreateIndex
CREATE INDEX "ExclusiveContent_isPublished_idx" ON "public"."ExclusiveContent"("isPublished");

-- CreateIndex
CREATE INDEX "ExclusiveContent_featured_idx" ON "public"."ExclusiveContent"("featured");

-- CreateIndex
CREATE INDEX "ExclusiveContent_publishedAt_idx" ON "public"."ExclusiveContent"("publishedAt");

-- CreateIndex
CREATE INDEX "ExclusiveContent_deletedAt_idx" ON "public"."ExclusiveContent"("deletedAt");

-- CreateIndex
CREATE INDEX "ContentAccess_userId_idx" ON "public"."ContentAccess"("userId");

-- CreateIndex
CREATE INDEX "ContentAccess_contentId_idx" ON "public"."ContentAccess"("contentId");

-- CreateIndex
CREATE INDEX "ContentAccess_accessType_idx" ON "public"."ContentAccess"("accessType");

-- CreateIndex
CREATE INDEX "ContentAccess_isActive_idx" ON "public"."ContentAccess"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ContentAccess_userId_contentId_key" ON "public"."ContentAccess"("userId", "contentId");

-- CreateIndex
CREATE INDEX "ContentComment_contentId_idx" ON "public"."ContentComment"("contentId");

-- CreateIndex
CREATE INDEX "ContentComment_userId_idx" ON "public"."ContentComment"("userId");

-- CreateIndex
CREATE INDEX "ContentComment_parentId_idx" ON "public"."ContentComment"("parentId");

-- CreateIndex
CREATE INDEX "ContentComment_isApproved_idx" ON "public"."ContentComment"("isApproved");

-- CreateIndex
CREATE INDEX "ContentComment_createdAt_idx" ON "public"."ContentComment"("createdAt");

-- CreateIndex
CREATE INDEX "ContentComment_deletedAt_idx" ON "public"."ContentComment"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SpotlightProfile_userId_key" ON "public"."SpotlightProfile"("userId");

-- CreateIndex
CREATE INDEX "SpotlightProfile_userId_idx" ON "public"."SpotlightProfile"("userId");

-- CreateIndex
CREATE INDEX "SpotlightProfile_category_idx" ON "public"."SpotlightProfile"("category");

-- CreateIndex
CREATE INDEX "SpotlightProfile_isActive_idx" ON "public"."SpotlightProfile"("isActive");

-- CreateIndex
CREATE INDEX "SpotlightProfile_isVerified_idx" ON "public"."SpotlightProfile"("isVerified");

-- CreateIndex
CREATE INDEX "SpotlightProfile_featuredUntil_idx" ON "public"."SpotlightProfile"("featuredUntil");

-- CreateIndex
CREATE INDEX "SpotlightReview_spotlightId_idx" ON "public"."SpotlightReview"("spotlightId");

-- CreateIndex
CREATE INDEX "SpotlightReview_reviewerId_idx" ON "public"."SpotlightReview"("reviewerId");

-- CreateIndex
CREATE INDEX "SpotlightReview_rating_idx" ON "public"."SpotlightReview"("rating");

-- CreateIndex
CREATE INDEX "SpotlightReview_isVerified_idx" ON "public"."SpotlightReview"("isVerified");

-- CreateIndex
CREATE INDEX "SpotlightReview_createdAt_idx" ON "public"."SpotlightReview"("createdAt");

-- CreateIndex
CREATE INDEX "HealthMetric_userId_idx" ON "public"."HealthMetric"("userId");

-- CreateIndex
CREATE INDEX "HealthMetric_category_idx" ON "public"."HealthMetric"("category");

-- CreateIndex
CREATE INDEX "HealthMetric_date_idx" ON "public"."HealthMetric"("date");

-- CreateIndex
CREATE INDEX "HealthMetric_metric_idx" ON "public"."HealthMetric"("metric");

-- CreateIndex
CREATE INDEX "HealthGoal_userId_idx" ON "public"."HealthGoal"("userId");

-- CreateIndex
CREATE INDEX "HealthGoal_category_idx" ON "public"."HealthGoal"("category");

-- CreateIndex
CREATE INDEX "HealthGoal_deadline_idx" ON "public"."HealthGoal"("deadline");

-- CreateIndex
CREATE INDEX "HealthGoal_isCompleted_idx" ON "public"."HealthGoal"("isCompleted");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "public"."Product"("category");

-- CreateIndex
CREATE INDEX "Product_brand_idx" ON "public"."Product"("brand");

-- CreateIndex
CREATE INDEX "Product_inStock_idx" ON "public"."Product"("inStock");

-- CreateIndex
CREATE INDEX "Product_isActive_idx" ON "public"."Product"("isActive");

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "public"."Product"("sellerId");

-- CreateIndex
CREATE INDEX "Product_price_idx" ON "public"."Product"("price");

-- CreateIndex
CREATE INDEX "Product_rating_idx" ON "public"."Product"("rating");

-- CreateIndex
CREATE INDEX "CartItem_userId_idx" ON "public"."CartItem"("userId");

-- CreateIndex
CREATE INDEX "CartItem_productId_idx" ON "public"."CartItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_productId_key" ON "public"."CartItem"("userId", "productId");

-- CreateIndex
CREATE INDEX "WishlistItem_userId_idx" ON "public"."WishlistItem"("userId");

-- CreateIndex
CREATE INDEX "WishlistItem_productId_idx" ON "public"."WishlistItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_userId_productId_key" ON "public"."WishlistItem"("userId", "productId");

-- CreateIndex
CREATE INDEX "ProductReview_productId_idx" ON "public"."ProductReview"("productId");

-- CreateIndex
CREATE INDEX "ProductReview_userId_idx" ON "public"."ProductReview"("userId");

-- CreateIndex
CREATE INDEX "ProductReview_rating_idx" ON "public"."ProductReview"("rating");

-- CreateIndex
CREATE INDEX "ProductReview_isVerified_idx" ON "public"."ProductReview"("isVerified");

-- CreateIndex
CREATE INDEX "ProductReview_createdAt_idx" ON "public"."ProductReview"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "public"."Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_category_idx" ON "public"."Transaction"("category");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "public"."Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "public"."Transaction"("date");

-- CreateIndex
CREATE INDEX "Budget_userId_idx" ON "public"."Budget"("userId");

-- CreateIndex
CREATE INDEX "Budget_category_idx" ON "public"."Budget"("category");

-- CreateIndex
CREATE INDEX "Budget_period_idx" ON "public"."Budget"("period");

-- CreateIndex
CREATE INDEX "Budget_isActive_idx" ON "public"."Budget"("isActive");

-- CreateIndex
CREATE INDEX "Bill_userId_idx" ON "public"."Bill"("userId");

-- CreateIndex
CREATE INDEX "Bill_category_idx" ON "public"."Bill"("category");

-- CreateIndex
CREATE INDEX "Bill_dueDate_idx" ON "public"."Bill"("dueDate");

-- CreateIndex
CREATE INDEX "Bill_isPaid_idx" ON "public"."Bill"("isPaid");

-- CreateIndex
CREATE INDEX "Bill_frequency_idx" ON "public"."Bill"("frequency");

-- CreateIndex
CREATE INDEX "Persona_userId_idx" ON "public"."Persona"("userId");

-- CreateIndex
CREATE INDEX "Persona_status_idx" ON "public"."Persona"("status");

-- CreateIndex
CREATE INDEX "Persona_visibility_idx" ON "public"."Persona"("visibility");

-- CreateIndex
CREATE INDEX "Persona_tags_idx" ON "public"."Persona"("tags");

-- CreateIndex
CREATE INDEX "Persona_isDefault_idx" ON "public"."Persona"("isDefault");

-- CreateIndex
CREATE INDEX "Persona_rating_idx" ON "public"."Persona"("rating");

-- CreateIndex
CREATE INDEX "PersonaInstance_personaId_idx" ON "public"."PersonaInstance"("personaId");

-- CreateIndex
CREATE INDEX "PersonaInstance_userId_idx" ON "public"."PersonaInstance"("userId");

-- CreateIndex
CREATE INDEX "PersonaInstance_isActive_idx" ON "public"."PersonaInstance"("isActive");

-- CreateIndex
CREATE INDEX "PersonaReview_personaId_idx" ON "public"."PersonaReview"("personaId");

-- CreateIndex
CREATE INDEX "PersonaReview_userId_idx" ON "public"."PersonaReview"("userId");

-- CreateIndex
CREATE INDEX "PersonaReview_rating_idx" ON "public"."PersonaReview"("rating");

-- CreateIndex
CREATE INDEX "PersonaShare_personaId_idx" ON "public"."PersonaShare"("personaId");

-- CreateIndex
CREATE INDEX "PersonaShare_userId_idx" ON "public"."PersonaShare"("userId");

-- CreateIndex
CREATE INDEX "PersonaShare_sharedWith_idx" ON "public"."PersonaShare"("sharedWith");

-- CreateIndex
CREATE INDEX "Guide_userId_idx" ON "public"."Guide"("userId");

-- CreateIndex
CREATE INDEX "Guide_category_idx" ON "public"."Guide"("category");

-- CreateIndex
CREATE INDEX "Guide_status_idx" ON "public"."Guide"("status");

-- CreateIndex
CREATE INDEX "Guide_difficulty_idx" ON "public"."Guide"("difficulty");

-- CreateIndex
CREATE INDEX "Guide_isPublic_idx" ON "public"."Guide"("isPublic");

-- CreateIndex
CREATE INDEX "Guide_isFeatured_idx" ON "public"."Guide"("isFeatured");

-- CreateIndex
CREATE INDEX "Guide_rating_idx" ON "public"."Guide"("rating");

-- CreateIndex
CREATE INDEX "GuideStep_guideId_idx" ON "public"."GuideStep"("guideId");

-- CreateIndex
CREATE INDEX "GuideStep_order_idx" ON "public"."GuideStep"("order");

-- CreateIndex
CREATE INDEX "GuideReview_guideId_idx" ON "public"."GuideReview"("guideId");

-- CreateIndex
CREATE INDEX "GuideReview_userId_idx" ON "public"."GuideReview"("userId");

-- CreateIndex
CREATE INDEX "GuideReview_rating_idx" ON "public"."GuideReview"("rating");

-- CreateIndex
CREATE INDEX "GuideProgress_guideId_idx" ON "public"."GuideProgress"("guideId");

-- CreateIndex
CREATE INDEX "GuideProgress_userId_idx" ON "public"."GuideProgress"("userId");

-- CreateIndex
CREATE INDEX "GuideProgress_isCompleted_idx" ON "public"."GuideProgress"("isCompleted");

-- CreateIndex
CREATE UNIQUE INDEX "GuideProgress_guideId_userId_key" ON "public"."GuideProgress"("guideId", "userId");

-- CreateIndex
CREATE INDEX "GuideBookmark_guideId_idx" ON "public"."GuideBookmark"("guideId");

-- CreateIndex
CREATE INDEX "GuideBookmark_userId_idx" ON "public"."GuideBookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GuideBookmark_guideId_userId_key" ON "public"."GuideBookmark"("guideId", "userId");

-- CreateIndex
CREATE INDEX "NewsSource_isActive_idx" ON "public"."NewsSource"("isActive");

-- CreateIndex
CREATE INDEX "NewsSource_type_idx" ON "public"."NewsSource"("type");

-- CreateIndex
CREATE INDEX "NewsSource_lastFetched_idx" ON "public"."NewsSource"("lastFetched");

-- CreateIndex
CREATE INDEX "NewsArticle_sourceId_idx" ON "public"."NewsArticle"("sourceId");

-- CreateIndex
CREATE INDEX "NewsArticle_status_idx" ON "public"."NewsArticle"("status");

-- CreateIndex
CREATE INDEX "NewsArticle_category_idx" ON "public"."NewsArticle"("category");

-- CreateIndex
CREATE INDEX "NewsArticle_publishedAt_idx" ON "public"."NewsArticle"("publishedAt");

-- CreateIndex
CREATE INDEX "NewsArticle_isFeatured_idx" ON "public"."NewsArticle"("isFeatured");

-- CreateIndex
CREATE INDEX "NewsArticle_isTrending_idx" ON "public"."NewsArticle"("isTrending");

-- CreateIndex
CREATE INDEX "NewsArticle_sentiment_idx" ON "public"."NewsArticle"("sentiment");

-- CreateIndex
CREATE INDEX "NewsInteraction_articleId_idx" ON "public"."NewsInteraction"("articleId");

-- CreateIndex
CREATE INDEX "NewsInteraction_userId_idx" ON "public"."NewsInteraction"("userId");

-- CreateIndex
CREATE INDEX "NewsInteraction_type_idx" ON "public"."NewsInteraction"("type");

-- CreateIndex
CREATE UNIQUE INDEX "NewsInteraction_articleId_userId_type_key" ON "public"."NewsInteraction"("articleId", "userId", "type");

-- CreateIndex
CREATE INDEX "NewsBookmark_articleId_idx" ON "public"."NewsBookmark"("articleId");

-- CreateIndex
CREATE INDEX "NewsBookmark_userId_idx" ON "public"."NewsBookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsBookmark_articleId_userId_key" ON "public"."NewsBookmark"("articleId", "userId");

-- CreateIndex
CREATE INDEX "UserNewsPreference_userId_idx" ON "public"."UserNewsPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNewsPreference_userId_key" ON "public"."UserNewsPreference"("userId");

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
ALTER TABLE "public"."AgentRunStep" ADD CONSTRAINT "AgentRunStep_runId_fkey" FOREIGN KEY ("runId") REFERENCES "public"."AgentRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentEvent" ADD CONSTRAINT "AgentEvent_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "public"."AgentRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BillingAccount" ADD CONSTRAINT "BillingAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_billingAccountId_fkey" FOREIGN KEY ("billingAccountId") REFERENCES "public"."BillingAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Charge" ADD CONSTRAINT "Charge_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AISummary" ADD CONSTRAINT "AISummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentCommentId_fkey" FOREIGN KEY ("parentCommentId") REFERENCES "public"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WellnessSession" ADD CONSTRAINT "WellnessSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "public"."Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tip" ADD CONSTRAINT "Tip_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Tip" ADD CONSTRAINT "Tip_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Friendship" ADD CONSTRAINT "Friendship_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AmbassadorProfile" ADD CONSTRAINT "AmbassadorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AmbassadorActivity" ADD CONSTRAINT "AmbassadorActivity_ambassadorId_fkey" FOREIGN KEY ("ambassadorId") REFERENCES "public"."AmbassadorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AmbassadorReward" ADD CONSTRAINT "AmbassadorReward_ambassadorId_fkey" FOREIGN KEY ("ambassadorId") REFERENCES "public"."AmbassadorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExclusiveContent" ADD CONSTRAINT "ExclusiveContent_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentAccess" ADD CONSTRAINT "ContentAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentAccess" ADD CONSTRAINT "ContentAccess_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."ExclusiveContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentComment" ADD CONSTRAINT "ContentComment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."ExclusiveContent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentComment" ADD CONSTRAINT "ContentComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContentComment" ADD CONSTRAINT "ContentComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."ContentComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpotlightProfile" ADD CONSTRAINT "SpotlightProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpotlightReview" ADD CONSTRAINT "SpotlightReview_spotlightId_fkey" FOREIGN KEY ("spotlightId") REFERENCES "public"."SpotlightProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpotlightReview" ADD CONSTRAINT "SpotlightReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HealthMetric" ADD CONSTRAINT "HealthMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HealthGoal" ADD CONSTRAINT "HealthGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductReview" ADD CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductReview" ADD CONSTRAINT "ProductReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bill" ADD CONSTRAINT "Bill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Persona" ADD CONSTRAINT "Persona_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonaInstance" ADD CONSTRAINT "PersonaInstance_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "public"."Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonaInstance" ADD CONSTRAINT "PersonaInstance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonaReview" ADD CONSTRAINT "PersonaReview_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "public"."Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonaReview" ADD CONSTRAINT "PersonaReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonaShare" ADD CONSTRAINT "PersonaShare_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "public"."Persona"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonaShare" ADD CONSTRAINT "PersonaShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Guide" ADD CONSTRAINT "Guide_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuideStep" ADD CONSTRAINT "GuideStep_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."Guide"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuideReview" ADD CONSTRAINT "GuideReview_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."Guide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuideReview" ADD CONSTRAINT "GuideReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuideProgress" ADD CONSTRAINT "GuideProgress_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."Guide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuideProgress" ADD CONSTRAINT "GuideProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuideBookmark" ADD CONSTRAINT "GuideBookmark_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."Guide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GuideBookmark" ADD CONSTRAINT "GuideBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsArticle" ADD CONSTRAINT "NewsArticle_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."NewsSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsInteraction" ADD CONSTRAINT "NewsInteraction_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."NewsArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsInteraction" ADD CONSTRAINT "NewsInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsBookmark" ADD CONSTRAINT "NewsBookmark_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."NewsArticle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NewsBookmark" ADD CONSTRAINT "NewsBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserNewsPreference" ADD CONSTRAINT "UserNewsPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
