/**
 * Embedding Computation Queue Producer
 * 
 * Handles adding jobs to compute embeddings for products.
 * Calls ML service to generate CLIP embeddings.
 */

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { redisConfig } from '../../../config/redis.config';

export interface EmbeddingJobData {
  productId: string;
  imageUrl: string;
  title: string;
  category: string;
}

@Injectable()
export class EmbeddingComputationProducer {
  constructor(
    @InjectQueue(redisConfig.queues.embeddingComputation.name)
    private embeddingQueue: Queue<EmbeddingJobData>,
  ) {}

  /**
   * Add a single embedding computation job
   */
  async addEmbeddingJob(data: EmbeddingJobData): Promise<void> {
    await this.embeddingQueue.add('compute-embedding', data, {
      priority: 1,
    });
  }

  /**
   * Add bulk embedding jobs
   */
  async addBulkEmbeddingJobs(products: EmbeddingJobData[]): Promise<void> {
    const jobs = products.map(product => ({
      name: 'compute-embedding',
      data: product,
      opts: { priority: 2 },
    }));

    await this.embeddingQueue.addBulk(jobs);
  }

  /**
   * Add high-priority embedding job (for new products)
   */
  async addPriorityEmbeddingJob(data: EmbeddingJobData): Promise<void> {
    await this.embeddingQueue.add('compute-embedding', data, {
      priority: 0, // Higher priority (lower number)
    });
  }

  /**
   * Get queue statistics
   */
  async getStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.embeddingQueue.getWaitingCount(),
      this.embeddingQueue.getActiveCount(),
      this.embeddingQueue.getCompletedCount(),
      this.embeddingQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }

  /**
   * Pause queue processing
   */
  async pause(): Promise<void> {
    await this.embeddingQueue.pause();
  }

  /**
   * Resume queue processing
   */
  async resume(): Promise<void> {
    await this.embeddingQueue.resume();
  }
}
