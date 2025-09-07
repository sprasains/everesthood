import pino from 'pino';

const NODE_ENV = process.env.NODE_ENV;

let transport: any;
try {
  transport = pino.transport({
    target: NODE_ENV === 'production' ? 'pino/file' : 'pino-pretty',
    options: {
      destination: NODE_ENV === 'production' ? 'logs/app.log' : undefined,
      mkdir: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  });
} catch (err) {
  // In test or restricted environments the transport target may not be available.
  // Fall back to a no-op transport and let pino default to stdout.
  // Keep a console warning to aid debugging.
  // eslint-disable-next-line no-console
  console.warn(
    'pino.transport unavailable, falling back to default stdout',
    err
  );
  transport = undefined;
}

export const logger = pino(
  {
    name: 'everesthood',
    level: NODE_ENV === 'production' ? 'info' : 'debug',
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'body.password',
        '*.password',
        '*.token',
        '*.key',
        '*.secret',
      ],
      censor: '[REDACTED]',
    },
  },
  transport as any
);

// Request logger middleware
export const requestLogger = (
  req: any,
  res: any,
  next: (err?: any) => void
) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
    });
  });

  next();
};

// Error logger middleware
export const errorLogger = (
  error: Error,
  req: any,
  res: any,
  next: (err?: any) => void
) => {
  logger.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    method: req.method,
    url: req.url,
  });

  next(error);
};

// Custom logger for specific features
export const createLogger = (name: string) => logger.child({ module: name });

// Development helper
// Development helper
if (NODE_ENV !== 'production') {
  logger.info('Logger initialized in development mode');
}

export default logger;
