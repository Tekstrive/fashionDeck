/**
 * Redis Configuration
 * 
 * Centralized Redis configuration for caching and queues.
 * Supports both development (Docker) and production (Railway) environments.
 */

export const redisConfig = {
  // Redis connection
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    
    // Connection pool settings
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    
    // Reconnection strategy
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  },

  // Cache TTL strategies (in seconds)
  ttl: {
    products: 6 * 60 * 60,        // 6 hours
    prompts: 24 * 60 * 60,        // 24 hours
    aesthetics: 0,                 // No expiry (manual refresh)
    sessions: 7 * 24 * 60 * 60,   // 7 days (future use)
    default: 1 * 60 * 60,         // 1 hour
  },

  // Cache key prefixes
  keyPrefixes: {
    product: 'product:',
    prompt: 'prompt:',
    aesthetic: 'aesthetic:',
    marketplace: 'marketplace:',
    embedding: 'embedding:',
    session: 'session:',
  },

  // Queue configurations
  queues: {
    productRefresh: {
      name: 'product-refresh',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100,  // Keep last 100 completed jobs
        removeOnFail: 500,      // Keep last 500 failed jobs
      },
    },
    embeddingComputation: {
      name: 'embedding-computation',
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 50,
        removeOnFail: 200,
      },
    },
    analyticsProcessing: {
      name: 'analytics-processing',
      defaultJobOptions: {
        attempts: 1,  // Analytics can be retried manually if needed
        removeOnComplete: 20,
        removeOnFail: 100,
      },
    },
  },
};

/**
 * Get Redis connection URL
 */
export function getRedisUrl(): string {
  return process.env.REDIS_URL || 
         `redis://${redisConfig.connection.host}:${redisConfig.connection.port}`;
}

/**
 * Generate cache key with prefix
 */
export function getCacheKey(prefix: keyof typeof redisConfig.keyPrefixes, id: string): string {
  return `${redisConfig.keyPrefixes[prefix]}${id}`;
}
