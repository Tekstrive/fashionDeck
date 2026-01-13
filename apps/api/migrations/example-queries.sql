-- FashionDeck Database Query Examples
-- These queries demonstrate how to use the database schema

-- ============================================
-- 1. BASIC PRODUCT QUERIES
-- ============================================

-- Insert a sample product
INSERT INTO products (
    marketplace,
    title,
    price,
    url,
    affiliate_url,
    sizes,
    category,
    image_url
) VALUES (
    'amazon',
    'Korean Minimal Oversized T-Shirt',
    899.00,
    'https://amazon.in/product/123',
    'https://amazon.in/product/123?tag=fashiondeck',
    '["S", "M", "L", "XL"]'::jsonb,
    'top',
    'https://example.com/tshirt.jpg'
);

-- Get all products from a specific marketplace
SELECT id, title, price, marketplace, category
FROM products
WHERE marketplace = 'amazon'
ORDER BY created_at DESC
LIMIT 10;

-- Get products in a price range
SELECT id, title, price, marketplace
FROM products
WHERE price BETWEEN 500 AND 1500
  AND category = 'top'
ORDER BY price ASC;

-- Get products by category and marketplace
SELECT id, title, price, sizes
FROM products
WHERE marketplace = 'flipkart'
  AND category = 'bottom'
  AND price <= 2000;

-- ============================================
-- 2. VECTOR EMBEDDING QUERIES
-- ============================================

-- Insert product with embeddings
-- (In practice, embeddings come from ML service)
INSERT INTO products (
    marketplace,
    title,
    price,
    url,
    affiliate_url,
    category,
    image_url,
    image_embedding,
    text_embedding
) VALUES (
    'amazon',
    'Streetwear Graphic Hoodie',
    1499.00,
    'https://amazon.in/hoodie/456',
    'https://amazon.in/hoodie/456?tag=fashiondeck',
    'top',
    'https://example.com/hoodie.jpg',
    -- Random 512-dim vector (replace with actual CLIP embedding)
    (SELECT array_agg(random())::vector FROM generate_series(1, 512)),
    (SELECT array_agg(random())::vector FROM generate_series(1, 512))
);

-- Find similar products by image embedding (cosine similarity)
-- Replace the query vector with actual embedding from ML service
SELECT 
    id,
    title,
    price,
    marketplace,
    1 - (image_embedding <=> '[0.1, 0.2, ...]'::vector(512)) as similarity
FROM products
WHERE image_embedding IS NOT NULL
ORDER BY image_embedding <=> '[0.1, 0.2, ...]'::vector(512)
LIMIT 10;

-- Find similar products with filters
SELECT 
    id,
    title,
    price,
    marketplace,
    category,
    1 - (image_embedding <=> $1::vector) as similarity
FROM products
WHERE image_embedding IS NOT NULL
  AND category = 'top'
  AND price <= 1500
  AND marketplace = 'amazon'
ORDER BY image_embedding <=> $1::vector
LIMIT 20;

-- Find products similar to a specific product
WITH target_product AS (
    SELECT image_embedding
    FROM products
    WHERE id = 'some-uuid-here'
)
SELECT 
    p.id,
    p.title,
    p.price,
    1 - (p.image_embedding <=> tp.image_embedding) as similarity
FROM products p, target_product tp
WHERE p.image_embedding IS NOT NULL
  AND p.id != 'some-uuid-here'
ORDER BY p.image_embedding <=> tp.image_embedding
LIMIT 10;

-- ============================================
-- 3. MULTI-VECTOR SEARCH (Image + Text)
-- ============================================

-- Combine image and text similarity with weights
SELECT 
    id,
    title,
    price,
    marketplace,
    (
        0.7 * (1 - (image_embedding <=> $1::vector)) +
        0.3 * (1 - (text_embedding <=> $2::vector))
    ) as combined_similarity
FROM products
WHERE image_embedding IS NOT NULL
  AND text_embedding IS NOT NULL
ORDER BY combined_similarity DESC
LIMIT 10;

-- ============================================
-- 4. QUERY LOGS
-- ============================================

-- Insert a query log
INSERT INTO query_logs (
    prompt,
    parsed_json,
    response_time_ms,
    num_results,
    success,
    user_ip
) VALUES (
    'korean minimal fit size M under 1500',
    '{"aesthetic": "korean minimal", "budget": 1500, "size": "M"}'::jsonb,
    3450,
    4,
    true,
    '192.168.1.1'
);

-- Get recent queries
SELECT prompt, response_time_ms, num_results, created_at
FROM query_logs
ORDER BY created_at DESC
LIMIT 20;

-- Get failed queries for debugging
SELECT prompt, error_message, created_at
FROM query_logs
WHERE success = false
ORDER BY created_at DESC;

-- Analytics: Most common search terms
SELECT 
    parsed_json->>'aesthetic' as aesthetic,
    COUNT(*) as search_count,
    AVG(response_time_ms) as avg_response_time,
    AVG(num_results) as avg_results
FROM query_logs
WHERE success = true
  AND parsed_json->>'aesthetic' IS NOT NULL
GROUP BY parsed_json->>'aesthetic'
ORDER BY search_count DESC
LIMIT 10;

-- Analytics: Performance metrics by day
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_queries,
    COUNT(*) FILTER (WHERE success = true) as successful_queries,
    AVG(response_time_ms) as avg_response_time,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY response_time_ms) as p95_response_time
FROM query_logs
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ============================================
-- 5. MAINTENANCE QUERIES
-- ============================================

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Vacuum and analyze (run periodically for performance)
VACUUM ANALYZE products;
VACUUM ANALYZE query_logs;

-- Check vector index statistics
SELECT 
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE indexname LIKE '%embedding%';

-- ============================================
-- 6. USEFUL ADMIN QUERIES
-- ============================================

-- Count products by marketplace
SELECT marketplace, COUNT(*) as product_count
FROM products
GROUP BY marketplace;

-- Count products by category
SELECT category, COUNT(*) as product_count
FROM products
GROUP BY category
ORDER BY product_count DESC;

-- Products with missing embeddings
SELECT COUNT(*) as missing_embeddings
FROM products
WHERE image_embedding IS NULL OR text_embedding IS NULL;

-- Average price by category
SELECT 
    category,
    COUNT(*) as count,
    AVG(price) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM products
GROUP BY category;

-- Recent products added
SELECT id, title, marketplace, price, created_at
FROM products
ORDER BY created_at DESC
LIMIT 10;

-- Delete old query logs (older than 90 days)
DELETE FROM query_logs
WHERE created_at < NOW() - INTERVAL '90 days';
