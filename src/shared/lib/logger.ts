import pino from 'pino';

const transport = pino.transport({
  target: process.env.NODE_ENV === 'development' ? 'pino-pretty' : 'pino/file',
  options: {
    colorize: true,
  },
});

export const logger = pino(
  {
    level: 'info',
  },
  process.env.NODE_ENV === 'development' ? transport : undefined,
);

if (process.env.NODE_ENV === 'production') {
  logger.info = console.log;
  logger.warn = console.log;
  logger.error = console.error;
}