# Redis Configuration

This directory contains Redis caching and queue configuration for the FashionDeck API.

## Overview

Redis is used for two main purposes:

1. **Caching** - Fast in-memory caching for products, prompts, and embeddings
2. **Message Queues** - Background job processing with BullMQ

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Redis (Port 6379)                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │   Cache Store    │      │   BullMQ Queues  │        │
│  ├──────────────────┤      ├──────────────────┤        │
│  │ • Products (6h)  │      │ • Product Refresh│        │
│  │ • Prompts (24h)  │      │ • Embeddings     │        │
│  │ • Aesthetics (∞) │      │ • Analytics      │        │
│  │ • Embeddings (∞) │      │                  │        │
│  └──────────────────┘      └──────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Cache TTL Strategies

| Cache Type | TTL       | Reason                              |
| ---------- | --------- | ----------------------------------- |
| Products   | 6 hours   | Marketplace data changes frequently |
| Prompts    | 24 hours  | Parsed prompts are reusable         |
| Aesthetics | No expiry | Static pattern data                 |
| Embeddings | No expiry | Stored in DB, cached for speed      |
| Sessions   | 7 days    | Future user sessions                |

## Queue Configurations

### 1. Product Refresh Queue

- **Purpose**: Refresh product data from marketplaces
- **Retry**: 3 attempts with exponential backoff
- **Schedule**: Daily at 2 AM
- **Priority**: Low (background task)

### 2. Embedding Computation Queue

- **Purpose**: Generate CLIP embeddings for products
- **Retry**: 2 attempts
- **Priority**: Medium (needed for search)
- **Batch Size**: 32 products at a time

### 3. Analytics Processing Queue

- **Purpose**: Process query logs and generate insights
- **Retry**: 1 attempt (can be retried manually)
- **Schedule**: Daily at midnight
- **Priority**: Low (non-critical)

## Usage

### Caching

```typescript
import { CacheService } from "./modules/redis/cache.service";

@Injectable()
export class ProductService {
  constructor(private cacheService: CacheService) {}

  async getProducts(query: string) {
    // Generate cache key
    const cacheKey = this.cacheService.generateHash(query);

    // Try to get from cache
    const cached = await this.cacheService.getCachedProducts(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database/API
    const products = await this.fetchProducts(query);

    // Cache the result
    await this.cacheService.cacheProducts(cacheKey, products);

    return products;
  }
}
```

### Queues

```typescript
import { ProductRefreshProducer } from "./modules/queue/producers/product-refresh.producer";

@Injectable()
export class MarketplaceService {
  constructor(private productRefreshProducer: ProductRefreshProducer) {}

  async refreshAmazonProducts() {
    // Add job to queue
    await this.productRefreshProducer.addRefreshJob({
      marketplace: "amazon",
      category: "top",
      limit: 100,
    });
  }

  async schedulePeriodicRefresh() {
    // Schedule daily refresh
    await this.productRefreshProducer.schedulePeriodicRefresh();
  }
}
```

## Testing

### Test Redis Connection

```bash
# From root directory
node scripts/test-redis.js
```

This will test:

- ✅ Redis connection
- ✅ Cache operations (set/get)
- ✅ TTL functionality
- ✅ JSON storage
- ✅ Queue operations
- ✅ Performance

### Manual Redis Commands

```bash
# Connect to Redis
docker exec -it fashiondeck-redis redis-cli

# Common commands
PING                          # Test connection
KEYS *                        # List all keys
GET key_name                  # Get value
SET key_name value EX 60      # Set with 60s TTL
TTL key_name                  # Check TTL
DEL key_name                  # Delete key
FLUSHALL                      # Clear all data (use with caution!)

# Queue-specific commands
KEYS bull:*                   # List all queue keys
LLEN bull:product-refresh:wait  # Check queue length
```

## Configuration

### Environment Variables

```bash
# apps/api/.env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=           # Optional
REDIS_DB=0                # Database number (0-15)
```

### Custom TTL

To customize TTL for specific cache types, edit `apps/api/src/config/redis.config.ts`:

```typescript
ttl: {
  products: 6 * 60 * 60,    // 6 hours
  prompts: 24 * 60 * 60,    // 24 hours
  aesthetics: 0,             // No expiry
  // Add your custom TTL here
}
```

## Monitoring

### Queue Statistics

```typescript
// Get queue stats
const stats = await productRefreshProducer.getStats();
console.log(stats);
// { waiting: 5, active: 2, completed: 100, failed: 3 }
```

### Cache Hit Rate

```typescript
// Track cache hits/misses
let hits = 0;
let misses = 0;

const cached = await cacheService.getCachedProducts(key);
if (cached) {
  hits++;
} else {
  misses++;
}

const hitRate = (hits / (hits + misses)) * 100;
console.log(`Cache hit rate: ${hitRate}%`);
```

## Performance Optimization

### 1. Connection Pooling

Redis connections are pooled automatically by ioredis. Default settings:

- Max retries: 3
- Retry delay: Exponential backoff (50ms - 2000ms)

### 2. Pipeline Operations

For bulk operations, use pipelines:

```typescript
const pipeline = redis.pipeline();
for (let i = 0; i < 1000; i++) {
  pipeline.set(`key:${i}`, `value:${i}`);
}
await pipeline.exec();
```

### 3. Batch Queue Jobs

Add multiple jobs at once:

```typescript
await productRefreshProducer.addBulkRefreshJobs("amazon");
```

## Troubleshooting

### Redis connection refused

```bash
# Check if Redis is running
docker ps | grep redis

# Check Redis logs
docker logs fashiondeck-redis

# Restart Redis
docker-compose restart redis
```

### Queue jobs not processing

```bash
# Check worker is running
# Workers are started automatically with the API

# Check queue stats
# Use the producer's getStats() method

# Manually process stuck jobs
docker exec -it fashiondeck-redis redis-cli
KEYS bull:*:failed
# Inspect failed jobs
```

### High memory usage

```bash
# Check memory usage
docker exec -it fashiondeck-redis redis-cli INFO memory

# Clear old completed jobs
# This is done automatically based on queue configuration

# Manually clear cache
docker exec -it fashiondeck-redis redis-cli FLUSHDB
```

### Cache not expiring

```bash
# Check TTL
docker exec -it fashiondeck-redis redis-cli TTL key_name

# If TTL is -1, key has no expiry
# If TTL is -2, key doesn't exist
```

## Production Considerations

### 1. Persistence

For production, enable Redis persistence:

```yaml
# docker-compose.yml (production)
redis:
  command: redis-server --appendonly yes --appendfsync everysec
```

### 2. Memory Limits

Set max memory and eviction policy:

```bash
# In production Redis config
maxmemory 2gb
maxmemory-policy allkeys-lru
```

### 3. Monitoring

Use Redis monitoring tools:

- **Redis Commander** - Web UI for Redis
- **RedisInsight** - Official Redis GUI
- **Prometheus + Grafana** - Metrics and dashboards

### 4. High Availability

For production, consider:

- **Redis Sentinel** - Automatic failover
- **Redis Cluster** - Horizontal scaling
- **Managed Redis** - Railway, AWS ElastiCache, etc.

## Next Steps

1. Implement queue processors for each queue type
2. Add monitoring and alerting for queue failures
3. Optimize cache hit rates through analytics
4. Set up Redis Sentinel for high availability (production)

---

For more information, see:

- [Redis Documentation](https://redis.io/documentation)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [ioredis Documentation](https://github.com/redis/ioredis)
