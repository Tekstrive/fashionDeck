/**
 * Analytics Processing Queue Producer
 * 
 * Handles adding jobs for analytics processing.
 * Processes query logs and generates insights.
 */

import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { redisConfig } from '../../../config/redis.config';

export interface AnalyticsJobData {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  startDate?: Date;
  endDate?: Date;
  metrics?: string[];
}

@Injectable()
export class AnalyticsProcessingProducer {
  constructor(
    @InjectQueue(redisConfig.queues.analyticsProcessing.name)
    private analyticsQueue: Queue<AnalyticsJobData>,
  ) {}

  /**
   * Add a daily analytics job
   */
  async addDailyAnalyticsJob(): Promise<void> {
    await this.analyticsQueue.add('process-analytics', {
      type: 'daily',
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date(),
    });
  }

  /**
   * Add a weekly analytics job
   */
  async addWeeklyAnalyticsJob(): Promise<void> {
    await this.analyticsQueue.add('process-analytics', {
      type: 'weekly',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
    });
  }

  /**
   * Schedule periodic analytics (daily at midnight)
   */
  async schedulePeriodicAnalytics(): Promise<void> {
    await this.analyticsQueue.add(
      'periodic-analytics',
      { type: 'daily' },
      {
        repeat: {
          pattern: '0 0 * * *', // Every day at midnight
        },
      },
    );
  }

  /**
   * Add custom analytics job
   */
  async addCustomAnalyticsJob(data: AnalyticsJobData): Promise<void> {
    await this.analyticsQueue.add('process-analytics', data);
  }

  /**
   * Get queue statistics
   */
  async getStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.analyticsQueue.getWaitingCount(),
      this.analyticsQueue.getActiveCount(),
      this.analyticsQueue.getCompletedCount(),
      this.analyticsQueue.getFailedCount(),
    ]);

    return { waiting, active, completed, failed };
  }

  /**
   * Clean old completed jobs
   */
  async cleanOldJobs(): Promise<void> {
    await this.analyticsQueue.clean(7 * 24 * 60 * 60 * 1000, 100, 'completed');
    await this.analyticsQueue.clean(30 * 24 * 60 * 60 * 1000, 100, 'failed');
  }
}
