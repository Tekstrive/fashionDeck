/**
 * Health Check Controller
 * 
 * Provides health check endpoints for monitoring and load balancers.
 * Checks database, Redis, and overall application health.
 */

import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Basic health check
   * Returns 200 OK if service is running
   */
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'fashiondeck-api',
      version: '1.0.0',
    };
  }

  /**
   * Detailed health check
   * Checks database and Redis connections
   */
  @Get('detailed')
  async detailedCheck() {
    const health = await this.healthService.checkHealth();
    
    return {
      status: health.isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: health.checks,
    };
  }
}
