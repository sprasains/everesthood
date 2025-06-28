// src/services/logger.ts

// Generate a unique correlation ID for each session or flow
let correlationId = crypto.randomUUID();

export const newCorrelationId = () => {
    correlationId = crypto.randomUUID();
};

const log = (level: 'info' | 'warn' | 'error', message: string, context: Record<string, any> = {}) => {
    const logEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context: {
            ...context,
            correlationId,
            userId: (window as any).currentUser?.id || 'anonymous',
            url: window.location.href,
            userAgent: navigator.userAgent
        },
        severity: level.toUpperCase(),
    };

    if (process.env.NODE_ENV === 'development') {
        console[level](JSON.stringify(logEntry, null, 2));
    }

    // Example: send to Sentry, Logtail, or your own endpoint
    // Sentry.captureMessage(message, { extra: logEntry });
    // fetch('https://your-logging-endpoint.com/logs', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(logEntry)
    // });
};

export const logger = {
    info: (message: string, context?: Record<string, any>) => log('info', message, context),
    warn: (message: string, context?: Record<string, any>) => log('warn', message, context),
    error: (message: string, context?: Record<string, any>) => log('error', message, context),
}; 