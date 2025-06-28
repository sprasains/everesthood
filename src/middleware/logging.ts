// src/middleware/logging.ts
// If you see a type error, run: npm install --save-dev @types/express
import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const backendLogger = (level: string, message: string, context: Record<string, any> = {}) => {
    const logEntry = {
        severity: level.toUpperCase(),
        message,
        timestamp: new Date().toISOString(),
        ...context
    };
    console.log(JSON.stringify(logEntry));
};

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime();
    const correlationId = req.header('X-Correlation-ID') || randomUUID();
    const requestId = randomUUID();

    (req as any).log = (level: string, message: string, context: Record<string, any> = {}) => {
        const logContext = {
            ...context,
            httpRequest: {
                requestMethod: req.method,
                requestUrl: req.originalUrl,
                remoteIp: req.ip,
            },
            correlationId,
            requestId,
            userId: (req as any).user?.id || 'anonymous',
        };
        backendLogger(level, message, logContext);
    };

    res.on('finish', () => {
        const totalTime = process.hrtime(startTime);
        const totalTimeInMs = totalTime[0] * 1000 + totalTime[1] / 1e6;
        (req as any).log('info', 'Request finished', {
            httpRequest: {
                status: res.statusCode,
                latency: `${totalTimeInMs.toFixed(3)}ms`,
            }
        });
    });

    next();
}; 