/**
 * Health Check Service
 * 
 * Performs health checks on critical dependencies.
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy';
  message?: string;
  responseTime?: number;
}

interface HealthStatus {
  isHealthy: boolean;
  checks: HealthCheck[];
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async checkHealth(): Promise<HealthStatus> {
    const checks: HealthCheck[] = [];

    // Check database
    const dbCheck = await this.checkDatabase();
    checks.push(dbCheck);

    // Check Redis (if available)
    // const redisCheck = await this.checkRedis();
    // checks.push(redisCheck);

    const isHealthy = checks.every(check => check.status === 'healthy');

    return {
      isHealthy,
      checks,
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      await this.dataSource.query('SELECT 1');
      
      return {
        name: 'database',
        status: 'healthy',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      
      return {
        name: 'database',
        status: 'unhealthy',
        message: error.message,
        responseTime: Date.now() - startTime,
      };
    }
  }

  // Uncomment when Redis module is properly configured
  /*
  private async checkRedis(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      await this.redis.ping();
      
      return {
        name: 'redis',
        status: 'healthy',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error('Redis health check failed', error);
      
      return {
        name: 'redis',
        status: 'unhealthy',
        message: error.message,
        responseTime: Date.now() - startTime,
      };
    }
  }
  */
}
