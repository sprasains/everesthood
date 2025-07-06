import Parser from 'rss-parser';
import { PrismaClient } from '@prisma/client';
import { logger } from '../services/logger';

const prisma = new PrismaClient();
const parser = new Parser();

const JOB_FEEDS = [
  { source: 'WeWorkRemotely AI', url: 'https://weworkremotely.com/remote-jobs/search?term=artificial-intelligence&category_id=&sort=newest.rss' },
  { source: 'Stack Overflow AI', url: 'https://stackoverflow.com/jobs/feed?q=artificial+intelligence' },
  { source: 'Remotive ML', url: 'https://remotive.com/remote-jobs/machine-learning.rss' },
];

export async function fetchAndStoreJobs() {
  logger.info('Starting AI job fetch process...');

  for (const feed of JOB_FEEDS) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      for (const item of parsedFeed.items) {
        if (!item.link) continue;
        // Extract company name, often part of the title or creator field
        const titleParts = item.title?.split(' at ');
        const title = titleParts?.[0] || 'Untitled Job';
        const companyName = titleParts?.[1]?.split(' (')[0] || item.creator || 'Unknown Company';
        await prisma.job.upsert({
          where: { externalUrl: item.link },
          update: {
            title: title,
            description: item.contentSnippet || item.content || '',
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
          },
          create: {
            title: title,
            description: item.contentSnippet || item.content || '',
            externalUrl: item.link,
            source: feed.source,
            companyName: companyName,
            location: 'Remote',
            type: 'Full-time',
            publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
          },
        });
      }
      logger.info('Successfully processed job feed', { source: feed.source });
    } catch (error) {
      logger.error('Failed to process job feed', { source: feed.source, error });
    }
  }
  logger.info('AI job fetch process finished.');
}
