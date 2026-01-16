import { Logger } from '@nestjs/common';
import { setTimeout } from 'timers/promises';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;  // milliseconds
  maxDelay: number;      // milliseconds
  backoffMultiplier: number;
  jitterEnabled: boolean;
}

export class RetryHelper {
  private static readonly logger = new Logger(RetryHelper.name);

  /**
   * Execute a function with retry logic
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    config: RetryConfig,
    context: string = 'operation',
  ): Promise<T> {
    let lastError: Error;
    let delay = config.initialDelay;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          this.logger.log(
            `Retry attempt ${attempt}/${config.maxRetries} for ${context}`,
          );
        }

        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on last attempt
        if (attempt === config.maxRetries) {
          this.logger.error(
            `All ${config.maxRetries} retries failed for ${context}: ${lastError.message}`,
          );
          break;
        }

        // Calculate delay with exponential backoff
        const backoffDelay = Math.min(
          delay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay,
        );

        // Add jitter if enabled (randomize ±25%)
        const finalDelay = config.jitterEnabled
          ? this.addJitter(backoffDelay)
          : backoffDelay;

        this.logger.warn(
          `${context} failed (attempt ${attempt + 1}), retrying in ${finalDelay}ms: ${lastError.message}`,
        );

        await setTimeout(finalDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Add random jitter to delay (±25%)
   */
  private static addJitter(delay: number): number {
    const jitterRange = delay * 0.25;
    const jitter = Math.random() * jitterRange * 2 - jitterRange;
    return Math.max(0, delay + jitter);
  }
}

/**
 * Predefined retry configurations
 */
export const RetryConfigs = {
  /**
   * For LLM API calls (OpenAI, Anthropic)
   */
  LLM_API: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitterEnabled: true,
  } as RetryConfig,

  /**
   * For marketplace API calls (Amazon, Flipkart)
   */
  MARKETPLACE_API: {
    maxRetries: 2,
    initialDelay: 500,
    maxDelay: 5000,
    backoffMultiplier: 2,
    jitterEnabled: true,
  } as RetryConfig,

  /**
   * For database connections
   */
  DATABASE: {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitterEnabled: false,
  } as RetryConfig,

  /**
   * For ML service calls
   */
  ML_SERVICE: {
    maxRetries: 2,
    initialDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 2,
    jitterEnabled: true,
  } as RetryConfig,
};
