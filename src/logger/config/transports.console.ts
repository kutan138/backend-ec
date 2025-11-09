import winston from 'winston';
import { consoleFormat } from './format';

export const createConsoleTransport = (isDev: boolean) =>
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    format: consoleFormat(isDev),
  });
