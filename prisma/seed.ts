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
  
  await prisma.userActivity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.contentVector.deleteMany();
  await prisma.postRevision.deleteMany();
  await prisma.tip.deleteMany();
  await prisma.post.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.squadMembership.deleteMany();
  await prisma.squad.deleteMany();
  await prisma.userChangelogSeen.deleteMany();
  await prisma.changelog.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.agentRun.deleteMany();
  await prisma.agentConfigRevision.deleteMany();
  await prisma.agentShare.deleteMany();
  await prisma.agentInstance.deleteMany();
  await prisma.agentTemplate.deleteMany();
  await prisma.tool.deleteMany();
  await prisma.customPersona.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.eventAttendee.deleteMany();
  await prisma.event.deleteMany();
  await prisma.task.deleteMany();
  await prisma.moodLog.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.journalPrompt.deleteMany();
  await prisma.guideFavorite.deleteMany();
  await prisma.guideView.deleteMany();
  await prisma.guide.deleteMany();
  await prisma.digitalDetoxProgress.deleteMany();
  await prisma.digitalDetoxTask.deleteMany();
  await prisma.digitalDetoxPlan.deleteMany();
  await prisma.productivityTip.deleteMany();
  await prisma.ambassadorMetric.deleteMany();
  await prisma.user.deleteMany();
  await prisma.family.deleteMany();
  await prisma.vibe.deleteMany();
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
