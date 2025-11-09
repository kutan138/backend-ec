import winston from 'winston';
import { fileFormat } from './format';

export const createFileTransports = () => [
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: fileFormat,
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
    level: 'info',
    format: fileFormat,
  }),
];
