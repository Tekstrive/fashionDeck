/**
 * Main Application Entry Point
 * 
 * Bootstraps the NestJS application with global configuration.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create application
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get services
  const configService = app.get(ConfigService);
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  
  // Use Winston logger
  app.useLogger(logger);

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert types automatically
      },
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Graceful shutdown
  app.enableShutdownHooks();

  // Get port
  const port = configService.get<number>('PORT', 3001);

  // Start server
  await app.listen(port);

  // Log startup
  const url = await app.getUrl();
  logger.log(`🚀 FashionDeck API is running on: ${url}`, 'Bootstrap');
  logger.log(`📝 Environment: ${configService.get('NODE_ENV')}`, 'Bootstrap');
  logger.log(`🔗 Health check: ${url}/api/health`, 'Bootstrap');
  logger.log(`📊 Database: ${configService.get('DATABASE_URL') ? 'Connected' : 'Not configured'}`, 'Bootstrap');
  logger.log(`🔴 Redis: ${configService.get('REDIS_URL') ? 'Connected' : 'Not configured'}`, 'Bootstrap');
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Bootstrap application
bootstrap();
