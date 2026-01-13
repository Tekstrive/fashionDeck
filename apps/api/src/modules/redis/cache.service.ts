/**
 * Cache Service
 * 
 * Provides high-level caching operations with type safety and TTL management.
 * Wraps cache-manager with domain-specific methods.
 */

import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { redisConfig, getCacheKey } from '../../config/redis.config';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Cache a product search result
   */
  async cacheProducts(queryHash: string, products: any[]): Promise<void> {
    const key = getCacheKey('product', queryHash);
    await this.cacheManager.set(key, products, redisConfig.ttl.products * 1000);
  }

  /**
   * Get cached product search result
   */
  async getCachedProducts(queryHash: string): Promise<any[] | null> {
    const key = getCacheKey('product', queryHash);
    return await this.cacheManager.get(key);
  }

  /**
   * Cache a parsed prompt
   */
  async cachePrompt(promptHash: string, parsedData: any): Promise<void> {
    const key = getCacheKey('prompt', promptHash);
    await this.cacheManager.set(key, parsedData, redisConfig.ttl.prompts * 1000);
  }

  /**
   * Get cached parsed prompt
   */
  async getCachedPrompt(promptHash: string): Promise<any | null> {
    const key = getCacheKey('prompt', promptHash);
    return await this.cacheManager.get(key);
  }

  /**
   * Cache an aesthetic pattern (no expiry)
   */
  async cacheAesthetic(aestheticName: string, pattern: any): Promise<void> {
    const key = getCacheKey('aesthetic', aestheticName);
    // TTL of 0 means no expiry
    await this.cacheManager.set(key, pattern, 0);
  }

  /**
   * Get cached aesthetic pattern
   */
  async getCachedAesthetic(aestheticName: string): Promise<any | null> {
    const key = getCacheKey('aesthetic', aestheticName);
    return await this.cacheManager.get(key);
  }

  /**
   * Cache marketplace data
   */
  async cacheMarketplaceData(marketplace: string, category: string, data: any): Promise<void> {
    const key = getCacheKey('marketplace', `${marketplace}:${category}`);
    await this.cacheManager.set(key, data, redisConfig.ttl.products * 1000);
  }

  /**
   * Get cached marketplace data
   */
  async getCachedMarketplaceData(marketplace: string, category: string): Promise<any | null> {
    const key = getCacheKey('marketplace', `${marketplace}:${category}`);
    return await this.cacheManager.get(key);
  }

  /**
   * Cache product embedding
   */
  async cacheEmbedding(productId: string, embedding: number[]): Promise<void> {
    const key = getCacheKey('embedding', productId);
    // Embeddings cached indefinitely (stored in DB as well)
    await this.cacheManager.set(key, embedding, 0);
  }

  /**
   * Get cached embedding
   */
  async getCachedEmbedding(productId: string): Promise<number[] | null> {
    const key = getCacheKey('embedding', productId);
    return await this.cacheManager.get(key);
  }

  /**
   * Generic set with custom TTL
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const ttlMs = ttl ? ttl * 1000 : redisConfig.ttl.default * 1000;
    await this.cacheManager.set(key, value, ttlMs);
  }

  /**
   * Generic get
   */
  async get<T>(key: string): Promise<T | null> {
    return await this.cacheManager.get<T>(key);
  }

  /**
   * Delete a cached item
   */
  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Delete multiple cached items by pattern
   */
  async deleteByPattern(pattern: string): Promise<void> {
    // Note: This requires direct Redis access
    // For now, we'll implement a simple version
    // In production, consider using Redis SCAN command
    const keys = await this.cacheManager.store.keys(pattern);
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }

  /**
   * Clear all cache
   */
  async clearAll(): Promise<void> {
    await this.cacheManager.reset();
  }

  /**
   * Generate hash for caching
   */
  generateHash(data: any): string {
    // Simple hash function - in production, use crypto
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const value = await this.cacheManager.get(key);
    return value !== null && value !== undefined;
  }

  /**
   * Get cache statistics (if supported by store)
   */
  async getStats(): Promise<any> {
    // This depends on the Redis store implementation
    return {
      keyPrefixes: redisConfig.keyPrefixes,
      ttlConfig: redisConfig.ttl,
    };
  }
}
