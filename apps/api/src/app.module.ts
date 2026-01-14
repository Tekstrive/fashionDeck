/**
 * App Module
 * 
 * Root module that imports all feature modules and configures the application.
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { validate } from './config/env.validation';
import { loggerConfig } from './config/logger.config';
import { DatabaseModule } from './modules/database/database.module';
import { RedisModule } from './modules/redis/redis.module';
import { QueueModule } from './modules/queue/queue.module';
import { HttpModule } from './modules/http/http.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: ['.env.local', '.env'],
    }),

    // Logging
    WinstonModule.forRoot(
      loggerConfig(process.env.NODE_ENV !== 'production')
    ),

    // Core Modules
    DatabaseModule,
    RedisModule,
    QueueModule,
    HttpModule,

    // Feature Modules
    HealthModule,
    
    // TODO: Add more modules as they are implemented
    // QueryModule,
    // MarketplaceModule,
    // OutfitModule,
    // MLModule,
  ],
})
export class AppModule {}
