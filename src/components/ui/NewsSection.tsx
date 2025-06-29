import { logger, newCorrelationId, getCorrelationId } from '@/services/logger';

// Fetches the latest news articles for the news section
const fetchNews = async () => {
    // Start a new correlation ID for this user flow
    newCorrelationId();
    logger.info('Fetching news articles.');
    try {
        // Make the API call, passing the correlation ID for traceability
        const res = await fetch('/api/v1/news', { headers: { 'X-Correlation-ID': getCorrelationId() } });
        if (!res.ok) {
            logger.warn('Failed to fetch news articles.', { status: res.status });
            throw new Error('Failed to fetch news');
        }
        // Log success
        logger.info('Fetched news articles.');
        return res.json();
    } catch (error: any) {
        logger.error('Error fetching news articles.', { error: error.message, stack: error.stack });
        throw error;
    }
} 