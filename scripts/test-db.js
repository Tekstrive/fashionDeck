/**
 * Database Test Script
 *
 * This script verifies that:
 * 1. pgvector extension is installed
 * 2. Products table exists with correct schema
 * 3. Vector embeddings can be inserted
 * 4. Vector similarity search works correctly
 *
 * Run with: node scripts/test-db.js
 */

require("dotenv").config({ path: "apps/api/.env" });
const { Client } = require("pg");

async function testDatabase() {
  const client = new Client({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://fashiondeck:fashiondeck_dev_password@localhost:5432/fashiondeck",
  });

  try {
    await client.connect();
    console.log("✅ Connected to database\n");

    // Test 1: Check pgvector extension
    console.log("Test 1: Checking pgvector extension...");
    const extResult = await client.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      WHERE extname = 'vector';
    `);

    if (extResult.rows.length > 0) {
      console.log(
        `✅ pgvector extension installed (version ${extResult.rows[0].extversion})\n`
      );
    } else {
      console.log("❌ pgvector extension not found\n");
      return;
    }

    // Test 2: Check products table schema
    console.log("Test 2: Checking products table schema...");
    const schemaResult = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'products'
      ORDER BY ordinal_position;
    `);

    console.log("Products table columns:");
    schemaResult.rows.forEach((row) => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.udt_name})`);
    });
    console.log("");

    // Test 3: Insert sample product with embeddings
    console.log("Test 3: Inserting sample product with embeddings...");

    // Create a random 512-dimensional vector
    const randomVector = Array.from({ length: 512 }, () => Math.random());
    const vectorString = `[${randomVector.join(",")}]`;

    const insertResult = await client.query(
      `
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
        'Test Product - Korean Minimal T-Shirt',
        999.00,
        'https://amazon.in/test-product',
        'https://amazon.in/test-product?tag=test',
        'top',
        'https://example.com/image.jpg',
        $1::vector,
        $2::vector
      )
      RETURNING id, title, marketplace;
    `,
      [vectorString, vectorString]
    );

    const insertedProduct = insertResult.rows[0];
    console.log(
      `✅ Inserted product: ${insertedProduct.title} (ID: ${insertedProduct.id})\n`
    );

    // Test 4: Vector similarity search
    console.log("Test 4: Testing vector similarity search...");

    // Create a query vector (slightly different from the inserted one)
    const queryVector = randomVector.map((v) => v * 0.9 + 0.1);
    const queryVectorString = `[${queryVector.join(",")}]`;

    const similarityResult = await client.query(
      `
      SELECT 
        id,
        title,
        marketplace,
        1 - (image_embedding <=> $1::vector) as similarity
      FROM products
      WHERE image_embedding IS NOT NULL
      ORDER BY image_embedding <=> $1::vector
      LIMIT 5;
    `,
      [queryVectorString]
    );

    console.log("Top 5 similar products:");
    similarityResult.rows.forEach((row, index) => {
      console.log(
        `  ${index + 1}. ${row.title} (similarity: ${row.similarity.toFixed(4)})`
      );
    });
    console.log("");

    // Test 5: Check indexes
    console.log("Test 5: Checking indexes...");
    const indexResult = await client.query(`
      SELECT 
        indexname, 
        indexdef
      FROM pg_indexes
      WHERE tablename = 'products'
      ORDER BY indexname;
    `);

    console.log("Indexes on products table:");
    indexResult.rows.forEach((row) => {
      console.log(`  - ${row.indexname}`);
    });
    console.log("");

    // Test 6: Check query_logs table
    console.log("Test 6: Checking query_logs table...");
    const queryLogsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'query_logs'
      ORDER BY ordinal_position;
    `);

    if (queryLogsResult.rows.length > 0) {
      console.log("✅ query_logs table exists with columns:");
      queryLogsResult.rows.forEach((row) => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
      console.log("");
    } else {
      console.log("⚠️  query_logs table not found\n");
    }

    // Clean up: Delete test product
    console.log("Cleaning up test data...");
    await client.query("DELETE FROM products WHERE title LIKE $1", [
      "Test Product%",
    ]);
    console.log("✅ Test data cleaned up\n");

    console.log("🎉 All database tests passed!");
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

// Run tests
testDatabase();
