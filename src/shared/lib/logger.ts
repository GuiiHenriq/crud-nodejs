import pino, { LoggerOptions } from 'pino';

const pinoConfig: LoggerOptions = {
  level: 'info',
};

if (process.env.NODE_ENV === 'development') {
  pinoConfig.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  };
}

export const logger = pino(pinoConfig);
