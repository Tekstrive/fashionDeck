/**
 * Queue Module
 * 
 * Provides BullMQ queue functionality for background job processing.
 * Includes queues for product refresh, embedding computation, and analytics.
 */

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { redisConfig } from '../../config/redis.config';

@Module({
  imports: [
    // Product Refresh Queue
    BullModule.registerQueue({
      name: redisConfig.queues.productRefresh.name,
      connection: redisConfig.connection,
      defaultJobOptions: redisConfig.queues.productRefresh.defaultJobOptions,
    }),

    // Embedding Computation Queue
    BullModule.registerQueue({
      name: redisConfig.queues.embeddingComputation.name,
      connection: redisConfig.connection,
      defaultJobOptions: redisConfig.queues.embeddingComputation.defaultJobOptions,
    }),

    // Analytics Processing Queue
    BullModule.registerQueue({
      name: redisConfig.queues.analyticsProcessing.name,
      connection: redisConfig.connection,
      defaultJobOptions: redisConfig.queues.analyticsProcessing.defaultJobOptions,
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
