import pino from 'pino';
import fs from 'fs';
import * as path from 'path';
let rfs: any = null;
try {
  // eslint-disable-next-line global-require
  rfs = require('rotating-file-stream');
} catch (e) {
  // ignore in test environments where rotating-file-stream isn't installed
}

// Optional pretty/multi-stream packages (may not be present in test env)
let pinoPretty: any = null;
let pinoMultiStream: any = null;
try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  pinoPretty = require('pino-pretty');
} catch (e) {
  // ignore - tests may not have this installed
}

try {
  // eslint-disable-next-line global-require, import/no-extraneous-dependencies
  pinoMultiStream = require('pino-multi-stream');
} catch (e) {
  // ignore
}

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const rotateStream = (filename: string) => {
  if (!rfs) return { write: () => {} } as any;
  return rfs.createStream(filename, {
    interval: '1d', // rotate daily
    path: logDir,
    maxFiles: 7, // keep 7 days
    compress: 'gzip',
  });
};

let logger: any;
const streams: any[] = [];
if (pinoPretty) {
  streams.push({ stream: pinoPretty({ colorize: true }) });
}
if (rotateStream) {
  streams.push({ stream: rotateStream('app.log') });
  streams.push({ stream: rotateStream('app.json') });
}

if (pinoMultiStream && streams.length > 0) {
  logger = pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level(label: string) {
          return { level: label };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    pinoMultiStream.multistream(streams)
  );
} else {
  // Fallback simple logger
  logger = pino({ level: process.env.LOG_LEVEL || 'info' });
}

export { logger };
export function getLogger() {
  return logger;
}
export default logger;
