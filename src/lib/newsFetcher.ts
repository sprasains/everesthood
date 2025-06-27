import Parser from 'rss-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const parser = new Parser();

const RSS_FEEDS = [
    { name: 'HYPEBEAST', url: 'https://hypebeast.com/feeds/main' },
    { name: 'Dazed', url: 'https://www.dazeddigital.com/rss' },
    { name: 'Nylon', url: 'https://nylon.com/rss' },
    { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
    { name: 'MIT News - AI', url: 'https://news.mit.edu/topic/artificial-intelligence2-rss.xml' },
];

export async function fetchAndStoreNews() {
  console.log('Starting news fetch process...');
  let articlesAdded = 0;

  for (const feed of RSS_FEEDS) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      for (const item of parsedFeed.items) {
        if (!item.link) continue;
        await prisma.newsArticle.upsert({
          where: { link: item.link },
          update: {},
          create: {
            title: item.title || 'Untitled',
            link: item.link,
            description: item.contentSnippet || item.content,
            imageUrl: item.enclosure?.url || null,
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
            sourceName: feed.name,
          },
        });
        // Create NEWS notification for all users
        const users = await prisma.user.findMany({ select: { id: true } });
        for (const user of users) {
          await prisma.notification.create({
            data: {
              recipientId: user.id,
              actorId: users[0].id, // Use first user as system or replace with a real system user id
              type: 'NEWS',
              entityId: item.link, // You may want to use the news article id
            },
          });
        }
      }
      console.log(`Successfully processed feed: ${feed.name}`);
    } catch (error) {
      console.error(`Failed to fetch or process feed ${feed.name}:`, error);
    }
  }
  console.log('News fetch process finished.');
}
