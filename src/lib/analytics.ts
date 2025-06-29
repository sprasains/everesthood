import { logger } from '../services/logger';

export const trackEngagement = {
  articleRead: (articleId: string, timeSpent: number, userId?: string) => {
    logger.info('Article read', { articleId, timeSpent, userId });
    // You can integrate with analytics services like:
    // - Google Analytics 4
    // - Mixpanel
    // - PostHog
    // - Amplitude
  },

  streakMaintained: (streakCount: number, userId?: string) => {
    logger.info('Streak maintained', { streakCount, userId });
  },

  socialShare: (platform: string, contentType: string, userId?: string) => {
    logger.info('Social share', { platform, contentType, userId });
  },

  premiumConversion: (fromTrial: boolean, conversionPoint: string, userId?: string) => {
    logger.info('Premium conversion', { fromTrial, conversionPoint, userId });
  },

  aiSummaryUsed: (persona: string, articleId: string, userId?: string) => {
    logger.info('AI summary used', { persona, articleId, userId });
  }
}