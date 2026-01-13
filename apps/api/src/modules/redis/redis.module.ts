/**
 * Redis Module
 * 
 * Provides Redis caching functionality for the application.
 * Uses cache-manager with Redis store for distributed caching.
 */

import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { redisConfig, getRedisUrl } from '../config/redis.config';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: redisConfig.connection.host,
            port: redisConfig.connection.port,
          },
          password: redisConfig.connection.password,
          database: redisConfig.connection.db,
          ttl: redisConfig.ttl.default * 1000, // Convert to milliseconds
        });

        return {
          store,
          ttl: redisConfig.ttl.default * 1000,
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
