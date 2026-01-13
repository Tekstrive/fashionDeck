/**
 * Product Refresh Queue Producer
 * 
 * Handles adding jobs to the product refresh queue.
 * Used to periodically refresh product data from marketplaces.
 */

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { redisConfig } from '../../config/redis.config';

export interface ProductRefreshJobData {
  marketplace: 'amazon' | 'flipkart';
  category: string;
  limit?: number;
}

@Injectable()
export class ProductRefreshProducer {
  constructor(
    @InjectQueue(redisConfig.queues.productRefresh.name)
    private productRefreshQueue: Queue<ProductRefreshJobData>,
  ) {}

  /**
   * Add a product refresh job
   */
  async addRefreshJob(data: ProductRefreshJobData): Promise<void> {
    await this.productRefreshQueue.add('refresh-products', data, {
      priority: 1,
    });
  }

  /**
   * Add bulk refresh jobs for all categories
   */
  async addBulkRefreshJobs(marketplace: 'amazon' | 'flipkart'): Promise<void> {
    const categories = ['top', 'bottom', 'shoes', 'accessories'];
    
    const jobs = categories.map(category => ({
      name: 'refresh-products',
      data: { marketplace, category, limit: 100 },
      opts: { priority: 2 },
    }));

    await this.productRefreshQueue.addBulk(jobs);
  }

  /**
   * Schedule periodic refresh (daily)
   */
  async schedulePeriodicRefresh(): Promise<void> {
    await this.productRefreshQueue.add(
      'periodic-refresh',
      { marketplace: 'amazon', category: 'all' },
      {
        repeat: {
          pattern: '0 2 * * *', // Every day at 2 AM
        },
      },
    );
  }

  /**
   * Get queue statistics
   */
  async getStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.productRefreshQueue.getWaitingCount(),
      this.productRefreshQueue.getActiveCount(),
      this.productRefreshQueue.getCompletedCount(),
      this.productRefreshQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }
}
