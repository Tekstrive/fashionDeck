import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import { validate } from './config/env.validation';
import { loggerConfig } from './config/logger.config';
import { DatabaseModule } from './modules/database/database.module';
import { RedisModule } from './modules/redis/redis.module';
import { QueueModule } from './modules/queue/queue.module';
import { HttpModule } from './modules/http/http.module';
import { HealthModule } from './modules/health/health.module';
import { QueryModule } from './modules/query/query.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { OutfitModule } from './modules/outfit/outfit.module';

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

    // Rate Limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([
        {
          ttl: config.get('RATE_LIMIT_WINDOW_MS', 60000),
          limit: config.get('RATE_LIMIT_MAX_REQUESTS', 10),
        },
      ]),
    }),

    // Core Modules
    DatabaseModule,
    RedisModule,
    QueueModule,
    HttpModule,

    // Feature Modules
    HealthModule,
    QueryModule,
    MarketplaceModule,
    OutfitModule,
  ],
})
export class AppModule {}
