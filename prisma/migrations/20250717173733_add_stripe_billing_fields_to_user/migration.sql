-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bonusExecutionCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "creatorBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "currentMonthExecutionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "monthlyExecutionLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "profileSpotlightEndsAt" TIMESTAMP(3),
ADD COLUMN     "stripeCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionTier" TEXT DEFAULT 'FREE';
