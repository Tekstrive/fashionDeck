/**
 * Database Module
 * 
 * Configures TypeORM connection to PostgreSQL with pgvector.
 * Includes connection pooling and automatic entity discovery.
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false, // Use migrations instead
        logging: configService.get('NODE_ENV') === 'development',
        
        // Connection pool settings
        extra: {
          max: configService.get<number>('DB_POOL_MAX', 10),
          min: configService.get<number>('DB_POOL_MIN', 2),
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },

        // Retry connection
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
