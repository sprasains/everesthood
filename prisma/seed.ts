import { PrismaClient } from '@prisma/client';
import { seedCoreStaticData } from './seed-core';
import { seedUsers } from './seed-users';
import { seedSocialGraph } from './seed-social';
import { seedFeatures } from './seed-features';
import { seedAgentTemplates } from './seedAgentTemplates';
import { seedAdvancedAgents } from './seedAdvancedAgents';
import { seedSophisticatedAgents } from './seedSophisticatedAgents';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Process Started ---');
  console.log('🧹 Clearing old data... (Order is critical)');

  // Deletion in reverse order of creation to respect foreign key constraints
  // News & Content Curation models
  await prisma.newsBookmark.deleteMany();
  await prisma.newsInteraction.deleteMany();
  await prisma.newsArticle.deleteMany();
  await prisma.newsSource.deleteMany();
  await prisma.userNewsPreference.deleteMany();
  
  // Guide & Tutorials models
  await prisma.guideBookmark.deleteMany();
  await prisma.guideProgress.deleteMany();
  await prisma.guideReview.deleteMany();
  await prisma.guideStep.deleteMany();
  await prisma.guide.deleteMany();
  
  // Custom AI Personas models
  await prisma.personaShare.deleteMany();
  await prisma.personaReview.deleteMany();
  await prisma.personaInstance.deleteMany();
  await prisma.persona.deleteMany();
  
  // Money module models
  await prisma.bill.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  
  // Shopping module models
  await prisma.productReview.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  
  // Health module models
  await prisma.healthGoal.deleteMany();
  await prisma.healthMetric.deleteMany();
  
  // Profile Spotlight models
  await prisma.spotlightReview.deleteMany();
  await prisma.spotlightProfile.deleteMany();
  
  // Exclusive Content models
  await prisma.contentComment.deleteMany();
  await prisma.contentAccess.deleteMany();
  await prisma.exclusiveContent.deleteMany();
  
  // Ambassador Program models
  await prisma.ambassadorReward.deleteMany();
  await prisma.ambassadorActivity.deleteMany();
  await prisma.ambassadorProfile.deleteMany();
  await prisma.referral.deleteMany();
  
  // Billing & Subscriptions models
  await prisma.subscription.deleteMany();
  
  // Achievements & Gamification models
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  
  // Friends & Social Connections models
  await prisma.friendship.deleteMany();
  
  // Wallet & Tipping models
  await prisma.tip.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  
  // Community models
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  
  // Job Board models
  await prisma.jobApplication.deleteMany();
  await prisma.job.deleteMany();
  
  // Digital Wellness models
  await prisma.wellnessSession.deleteMany();
  
  // Notifications models
  await prisma.notification.deleteMany();
  
  // AI Summaries models
  await prisma.aISummary.deleteMany();
  
  // Agent models
  await prisma.agentRun.deleteMany();
  await prisma.agentCredential.deleteMany();
  await prisma.agentInstance.deleteMany();
  await prisma.agentTemplate.deleteMany();
  
  // Billing Account models
  await prisma.billingAccount.deleteMany();
  
  // User model (delete last due to foreign key constraints)
  await prisma.user.deleteMany();
  console.log('✅ Old data cleared successfully.');

  // --- Run Seeding Modules Sequentially ---
  try {
    await seedCoreStaticData(prisma);
    const allUsers = await seedUsers(prisma);
    await seedSocialGraph(prisma, allUsers);
    await seedFeatures(prisma, allUsers);

    // Run agent template seeders explicitly
    await seedAgentTemplates(prisma);
    await seedAdvancedAgents(prisma);
    await seedSophisticatedAgents(prisma);

    console.log('--- ✅✅✅ Seeding Process Finished Successfully! ---');
    console.log(
      '--- Your database is now populated with a large, complex, and interconnected dataset. ---'
    );
  } catch (error) {
    console.error(
      'A critical error occurred during the seeding process:',
      error
    );
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('An unhandled error occurred in main:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
  });
