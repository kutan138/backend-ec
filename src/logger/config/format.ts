/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import winston from 'winston';

export const consoleFormat = (isDev: boolean) =>
  winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.ms(),
    isDev
      ? winston.format.colorize({ all: true })
      : winston.format.uncolorize(),
    winston.format.printf(({ level, message, timestamp, context }) => {
      const msg =
        typeof message === 'string'
          ? message
          : JSON.stringify(message, null, 2);
      return `[${timestamp}] ${level} ${context ? '[' + context + ']' : ''}: ${msg}`;
    }),
  );

export const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json(),
);
