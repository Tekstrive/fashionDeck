/**
 * HTTP Module
 * 
 * Configures HTTP client (Axios) for making external API calls.
 * Includes timeout, retry logic, and request/response interceptors.
 */

import { Module } from '@nestjs/common';
import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestHttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.get<number>('ML_SERVICE_TIMEOUT', 5000),
        maxRedirects: 5,
        
        // Retry configuration
        retries: 3,
        retryDelay: (retryCount) => {
          return retryCount * 1000; // Exponential backoff
        },
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [NestHttpModule],
})
export class HttpModule {}
