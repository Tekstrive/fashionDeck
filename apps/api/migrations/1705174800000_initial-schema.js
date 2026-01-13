/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Migration: Initial Schema
 *
 * Creates the core products table with pgvector support for embeddings.
 * This table stores all product information from marketplaces (Amazon, Flipkart)
 * along with their image and text embeddings for similarity search.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Enable pgvector extension (if not already enabled)
  pgm.sql("CREATE EXTENSION IF NOT EXISTS vector;");

  // Create products table
  pgm.createTable("products", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
    },
    marketplace: {
      type: "varchar(50)",
      notNull: true,
      comment: "Marketplace source: amazon or flipkart",
    },
    title: {
      type: "text",
      notNull: true,
      comment: "Product title/name",
    },
    price: {
      type: "decimal(10,2)",
      notNull: true,
      comment: "Product price in INR",
    },
    url: {
      type: "text",
      notNull: true,
      comment: "Direct product URL",
    },
    affiliate_url: {
      type: "text",
      notNull: true,
      comment: "Affiliate tracking URL",
    },
    sizes: {
      type: "jsonb",
      comment: "Available sizes as JSON array",
    },
    category: {
      type: "varchar(50)",
      notNull: true,
      comment: "Product category: top, bottom, shoes, accessories",
    },
    image_url: {
      type: "text",
      comment: "Product image URL",
    },
    image_embedding: {
      type: "vector(512)",
      comment: "CLIP image embedding (512 dimensions)",
    },
    text_embedding: {
      type: "vector(512)",
      comment: "CLIP text embedding (512 dimensions)",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create indexes for common queries
  pgm.createIndex("products", "marketplace", {
    name: "idx_products_marketplace",
  });

  pgm.createIndex("products", "category", {
    name: "idx_products_category",
  });

  pgm.createIndex("products", "price", {
    name: "idx_products_price",
  });

  pgm.createIndex("products", ["marketplace", "category"], {
    name: "idx_products_marketplace_category",
  });

  // Create IVFFlat vector indexes for cosine similarity search
  // Note: IVFFlat requires training data, so we use a default list size
  // For production, adjust lists parameter based on dataset size
  // Rule of thumb: lists = rows / 1000 (for datasets > 1M rows)
  pgm.sql(`
    CREATE INDEX idx_products_image_embedding 
    ON products 
    USING ivfflat (image_embedding vector_cosine_ops)
    WITH (lists = 100);
  `);

  pgm.sql(`
    CREATE INDEX idx_products_text_embedding 
    ON products 
    USING ivfflat (text_embedding vector_cosine_ops)
    WITH (lists = 100);
  `);

  // Create function to automatically update updated_at timestamp
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  // Create trigger to auto-update updated_at
  pgm.sql(`
    CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  `);

  // Add comments to table
  pgm.sql(`
    COMMENT ON TABLE products IS 
    'Stores product information from marketplaces with vector embeddings for similarity search';
  `);
};

exports.down = (pgm) => {
  // Drop trigger and function
  pgm.sql("DROP TRIGGER IF EXISTS update_products_updated_at ON products;");
  pgm.sql("DROP FUNCTION IF EXISTS update_updated_at_column();");

  // Drop table (indexes are dropped automatically)
  pgm.dropTable("products");

  // Note: We don't drop the vector extension as other tables might use it
  // If you want to drop it: pgm.sql('DROP EXTENSION IF EXISTS vector;');
};
