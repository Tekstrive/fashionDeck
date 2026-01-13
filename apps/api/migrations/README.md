# Database Migrations

This directory contains database migrations for the FashionDeck API.

## Overview

We use `node-pg-migrate` for database migrations. Migrations are JavaScript files that define schema changes in a version-controlled, reversible way.

## Migration Files

### 1705174800000_initial-schema.js

Creates the core `products` table with:

- UUID primary key
- Product metadata (title, price, URLs, category, etc.)
- Vector embeddings (512-dimensional) for image and text
- IVFFlat indexes for fast cosine similarity search
- Automatic `updated_at` timestamp trigger

### 1705174900000_query-logs.js

Creates the `query_logs` table for analytics:

- Tracks user queries and performance metrics
- Stores parsed query JSON
- Records success/failure status
- Enables analytics on user behavior

## Running Migrations

### Prerequisites

1. Ensure PostgreSQL with pgvector is running:

   ```bash
   docker-compose up -d postgres
   ```

2. Set DATABASE_URL environment variable:
   ```bash
   # In apps/api/.env
   DATABASE_URL=postgresql://fashiondeck:fashiondeck_dev_password@localhost:5432/fashiondeck
   ```

### Commands

```bash
# Navigate to API directory
cd apps/api

# Run all pending migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Create a new migration
npm run migrate:create <migration-name>

# Check migration status
npm run migrate -- list
```

### From Root Directory

```bash
# Run migrations from root
npm run migrate:up --filter=@fashiondeck/api
```

## Testing Migrations

After running migrations, test the database schema:

```bash
# From root directory
node scripts/test-db.js
```

This will verify:

- ✅ pgvector extension is installed
- ✅ Tables exist with correct schema
- ✅ Vector embeddings can be inserted
- ✅ Vector similarity search works
- ✅ Indexes are created

## Migration Best Practices

1. **Always test migrations locally** before deploying to production
2. **Write both up and down migrations** for reversibility
3. **Use transactions** (node-pg-migrate does this automatically)
4. **Never modify existing migrations** - create new ones instead
5. **Keep migrations small and focused** - one logical change per migration
6. **Add comments** to explain complex schema changes

## Vector Search Performance

The IVFFlat indexes are configured with `lists = 100` for development. For production:

- **Small datasets** (< 100K rows): `lists = 100`
- **Medium datasets** (100K - 1M rows): `lists = rows / 1000`
- **Large datasets** (> 1M rows): `lists = sqrt(rows)`

Update the index creation in migrations as your dataset grows.

## Troubleshooting

### Migration fails with "relation already exists"

```bash
# Check current migration status
cd apps/api
npm run migrate -- list

# If needed, manually mark migrations as run
npm run migrate -- up --fake
```

### pgvector extension not found

```bash
# Connect to database
docker exec -it fashiondeck-postgres psql -U fashiondeck -d fashiondeck

# Enable extension manually
CREATE EXTENSION IF NOT EXISTS vector;
```

### Vector index creation is slow

This is normal for large datasets. IVFFlat indexes require scanning the data to create clusters. For very large datasets, consider:

- Creating indexes after bulk data import
- Using HNSW indexes instead (requires pgvector 0.5.0+)

## Schema Diagram

```
products
├── id (uuid, PK)
├── marketplace (varchar)
├── title (text)
├── price (decimal)
├── url (text)
├── affiliate_url (text)
├── sizes (jsonb)
├── category (varchar)
├── image_url (text)
├── image_embedding (vector(512))  ← CLIP image embedding
├── text_embedding (vector(512))   ← CLIP text embedding
├── created_at (timestamp)
└── updated_at (timestamp)

Indexes:
- idx_products_marketplace
- idx_products_category
- idx_products_price
- idx_products_marketplace_category
- idx_products_image_embedding (IVFFlat, cosine)
- idx_products_text_embedding (IVFFlat, cosine)
```

```
query_logs
├── id (uuid, PK)
├── prompt (text)
├── parsed_json (jsonb)
├── response_time_ms (integer)
├── num_results (integer)
├── success (boolean)
├── error_message (text)
├── user_ip (varchar)
├── user_agent (text)
└── created_at (timestamp)

Indexes:
- idx_query_logs_created_at
- idx_query_logs_success
- idx_query_logs_success_created_at
- idx_query_logs_parsed_json (GIN)
```

## Next Steps

After migrations are complete:

1. Implement NestJS database module (TypeORM or Prisma)
2. Create repository layer for products
3. Implement marketplace adapters to populate products
4. Set up ML service to generate embeddings
5. Implement vector similarity search in API

---

For more information, see:

- [node-pg-migrate documentation](https://salsita.github.io/node-pg-migrate/)
- [pgvector documentation](https://github.com/pgvector/pgvector)
