import pino from 'pino';
import pinoPretty from 'pino-pretty';
import pinoMultiStream from 'pino-multi-stream';
import fs from 'fs';
import path from 'path';
import rfs from 'rotating-file-stream';

const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const rotateStream = (filename: string) =>
  rfs.createStream(filename, {
    interval: '1d', // rotate daily
    path: logDir,
    maxFiles: 7, // keep 7 days
    compress: 'gzip',
  });

const streams = [
  { stream: pinoPretty({ colorize: true }) }, // Console pretty
  { stream: rotateStream('app.log') }, // Rotating raw file
  { stream: rotateStream('app.json') }, // Rotating JSON file
];

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level(label) {
        return { level: label };
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pinoMultiStream.multistream(streams)
);

export default logger;
