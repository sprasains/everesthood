// src/services/logger.ts

// Utility to detect environment
const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
const isBrowser = typeof window !== 'undefined';

// Correlation/trace ID helpers
let correlationId: string | undefined = undefined;

export function setCorrelationId(id: string) {
  correlationId = id;
}

export function getCorrelationId() {
  if (correlationId) return correlationId;
  if (isNode) {
    // Use crypto for UUID in Node
    return require('crypto').randomUUID();
  } else if (isBrowser && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  // fallback
  return Math.random().toString(36).slice(2) + Date.now();
}

export function newCorrelationId() {
  const id = getCorrelationId();
  setCorrelationId(id);
  return id;
}

export { correlationId };

// Main log function
async function log(
  level: 'info' | 'warn' | 'error',
  message: string,
  context: Record<string, any> = {}
) {
  const traceId = context.traceId || getCorrelationId();
  const logEntry: Record<string, any> = {
    severity: level.toUpperCase(),
    level,
    message,
    timestamp: new Date().toISOString(),
    traceId,
    ...context,
  };

  if (isNode) {
    // Node: log to stdout for GCP ingestion
    // eslint-disable-next-line no-console
    console[level](JSON.stringify(logEntry));
  } else if (isBrowser) {
    // Browser: log to console, and POST to backend unless in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console[level](JSON.stringify(logEntry, null, 2));
    } else {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logEntry),
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to send log to backend', e);
      }
    }
  }
}

export const logger = {
  info: (message: string, context?: Record<string, any>) => log('info', message, context),
  warn: (message: string, context?: Record<string, any>) => log('warn', message, context),
  error: (message: string, context?: Record<string, any>) => log('error', message, context),
  setCorrelationId,
  getCorrelationId,
}; 