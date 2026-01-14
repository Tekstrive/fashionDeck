# FashionDeck API

NestJS backend API for the FashionDeck platform.

## Overview

The API handles:

- User query processing
- Marketplace integration (Amazon, Flipkart)
- Outfit assembly and scoring
- ML service communication
- Caching and background jobs

## Tech Stack

- **Framework**: NestJS 10
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 15 with pgvector
- **Cache**: Redis 7
- **Queue**: BullMQ
- **ORM**: TypeORM
- **Validation**: class-validator
- **Logging**: Winston
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- PostgreSQL with pgvector
- Redis
- Docker (optional)

### Installation

```bash
# From root directory
npm install

# Or from this directory
cd apps/api
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `ML_SERVICE_URL` - ML service endpoint

### Running the API

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm run start

# From root directory
npm run dev --filter=@fashiondeck/api
```

The API will start on `http://localhost:3001`.

### Health Check

```bash
# Basic health check
curl http://localhost:3001/api/health

# Detailed health check (includes DB, Redis status)
curl http://localhost:3001/api/health/detailed
```

## Project Structure

```
src/
├── config/                 # Configuration files
│   ├── env.validation.ts  # Environment variable validation
│   ├── logger.config.ts   # Winston logger configuration
│   └── redis.config.ts    # Redis configuration
├── modules/
│   ├── database/          # TypeORM database module
│   ├── redis/             # Redis caching module
│   ├── queue/             # BullMQ queue module
│   ├── http/              # HTTP client module
│   ├── health/            # Health check endpoints
│   ├── query/             # Query processing (TODO)
│   ├── marketplace/       # Marketplace adapters (TODO)
│   ├── outfit/            # Outfit assembly (TODO)
│   └── ml/                # ML service client (TODO)
├── app.module.ts          # Root module
└── main.ts                # Application entry point
```

## API Endpoints

### Health

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health with dependency status

### Query (TODO)

- `POST /api/query` - Process user query and return outfits

## Database Migrations

```bash
# Run migrations
npm run migrate:up

# Create new migration
npm run migrate:create <migration-name>

# Rollback migration
npm run migrate:down
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker

### Build Image

```bash
# From root directory
docker build -f apps/api/Dockerfile -t fashiondeck-api .
```

### Run Container

```bash
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  fashiondeck-api
```

### Docker Compose

```bash
# Start all services
docker-compose up

# Start only API
docker-compose up api
```

## Development

### Adding a New Module

```bash
# Generate module
nest g module modules/my-module

# Generate controller
nest g controller modules/my-module

# Generate service
nest g service modules/my-module
```

### Code Style

```bash
# Lint
npm run lint

# Format
npm run format
```

### Type Checking

```bash
npm run type-check
```

## Logging

The API uses Winston for structured logging.

**Development**: Human-readable colored logs
**Production**: JSON-formatted logs

Log levels: `error`, `warn`, `info`, `debug`

```typescript
import { Logger } from "@nestjs/common";

const logger = new Logger("MyService");
logger.log("Info message");
logger.error("Error message", error);
logger.warn("Warning message");
logger.debug("Debug message");
```

## Error Handling

All errors are caught by global exception filters and returned in a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-14T00:00:00.000Z",
  "path": "/api/query"
}
```

## Performance

- **Target latency**: ≤7 seconds p95
- **Caching**: Redis with smart TTL strategies
- **Connection pooling**: PostgreSQL (2-10 connections)
- **Parallel processing**: Marketplace fetches run concurrently
- **Background jobs**: BullMQ for async tasks

## Monitoring

### Metrics

- Request/response times
- Error rates
- Cache hit rates
- Queue job statistics
- Database connection pool usage

### Health Checks

The `/api/health/detailed` endpoint provides:

- Database connectivity
- Redis connectivity
- Response times for each check

## Deployment

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Environment Variables (Production)

Set these in your deployment platform:

```
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ML_SERVICE_URL=https://...
PORT=3001
```

## Troubleshooting

### Port already in use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database connection failed

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
psql $DATABASE_URL
```

### Redis connection failed

```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli -u $REDIS_URL ping
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Run linter and tests
5. Submit PR

## License

Proprietary - All rights reserved

---

**Built with ❤️ for FashionDeck**
