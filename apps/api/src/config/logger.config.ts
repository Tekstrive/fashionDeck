/**
 * Logger Configuration
 * 
 * Winston logger configuration with structured JSON logging.
 * Different transports for development and production.
 */

import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom format for development (human-readable)
const devFormat = printf(({ level, message, timestamp, context, ...metadata }) => {
  let msg = `${timestamp} [${context || 'Application'}] ${level}: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Production format (JSON)
const prodFormat = combine(
  timestamp(),
  json()
);

export const loggerConfig = (isDevelopment: boolean): WinstonModuleOptions => ({
  transports: [
    new winston.transports.Console({
      format: isDevelopment
        ? combine(
            colorize(),
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            devFormat
          )
        : prodFormat,
    }),
    
    // File transport for production
    ...(isDevelopment
      ? []
      : [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: prodFormat,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: prodFormat,
          }),
        ]),
  ],
  
  // Default metadata
  defaultMeta: {
    service: 'fashiondeck-api',
  },
  
  // Exit on error
  exitOnError: false,
});
