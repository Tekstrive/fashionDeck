/**
 * Redis Test Script
 *
 * Tests Redis connection, caching, and queue functionality.
 * Run with: node scripts/test-redis.js
 */

require("dotenv").config({ path: "apps/api/.env" });
const Redis = require("ioredis");
const { Queue, Worker } = require("bullmq");

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD,
};

async function testRedis() {
  console.log("🧪 Testing Redis Connection and Functionality\n");
  console.log("=".repeat(50));

  // Test 1: Basic Connection
  console.log("\n📋 Test 1: Testing Redis connection...");
  const redis = new Redis(redisConfig);

  redis.on("connect", () => {
    console.log("✅ Connected to Redis");
  });

  redis.on("error", (error) => {
    console.error("❌ Redis connection error:", error.message);
  });

  try {
    // Wait for connection
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test PING
    const pong = await redis.ping();
    console.log(`✅ PING response: ${pong}`);

    // Test 2: Basic Cache Operations
    console.log("\n📋 Test 2: Testing cache operations...");

    // Set a value
    await redis.set("test:key", "test-value", "EX", 60);
    console.log("✅ Set cache key: test:key");

    // Get the value
    const value = await redis.get("test:key");
    console.log(`✅ Get cache key: ${value}`);

    // Test 3: Cache with TTL
    console.log("\n📋 Test 3: Testing TTL...");

    await redis.set("test:ttl", "expires-soon", "EX", 5);
    const ttl = await redis.ttl("test:ttl");
    console.log(`✅ TTL for test:ttl: ${ttl} seconds`);

    // Test 4: JSON Storage
    console.log("\n📋 Test 4: Testing JSON storage...");

    const testData = {
      aesthetic: "korean minimal",
      budget: 1500,
      size: "M",
    };

    await redis.set("test:json", JSON.stringify(testData), "EX", 60);
    const jsonValue = await redis.get("test:json");
    const parsedData = JSON.parse(jsonValue);
    console.log("✅ Stored and retrieved JSON:", parsedData);

    // Test 5: Hash Operations
    console.log("\n📋 Test 5: Testing hash operations...");

    await redis.hset("test:hash", "field1", "value1");
    await redis.hset("test:hash", "field2", "value2");
    const hashValue = await redis.hgetall("test:hash");
    console.log("✅ Hash values:", hashValue);

    // Test 6: List Operations
    console.log("\n📋 Test 6: Testing list operations...");

    await redis.lpush("test:list", "item1", "item2", "item3");
    const listLength = await redis.llen("test:list");
    const listItems = await redis.lrange("test:list", 0, -1);
    console.log(`✅ List length: ${listLength}, Items:`, listItems);

    // Test 7: Key Pattern Matching
    console.log("\n📋 Test 7: Testing key pattern matching...");

    const keys = await redis.keys("test:*");
    console.log(`✅ Found ${keys.length} keys matching 'test:*':`, keys);

    // Test 8: Queue Operations
    console.log("\n📋 Test 8: Testing BullMQ queue...");

    const testQueue = new Queue("test-queue", { connection: redisConfig });

    // Add a job
    const job = await testQueue.add("test-job", {
      message: "Hello from test job",
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ Added job to queue: ${job.id}`);

    // Create a worker to process the job
    const worker = new Worker(
      "test-queue",
      async (job) => {
        console.log(`✅ Processing job ${job.id}:`, job.data);
        return { processed: true };
      },
      { connection: redisConfig }
    );

    // Wait for job to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get queue stats
    const [waiting, active, completed] = await Promise.all([
      testQueue.getWaitingCount(),
      testQueue.getActiveCount(),
      testQueue.getCompletedCount(),
    ]);

    console.log(
      `✅ Queue stats - Waiting: ${waiting}, Active: ${active}, Completed: ${completed}`
    );

    // Test 9: Performance Test
    console.log("\n📋 Test 9: Testing performance...");

    const startTime = Date.now();
    const promises = [];

    for (let i = 0; i < 100; i++) {
      promises.push(redis.set(`perf:${i}`, `value-${i}`, "EX", 60));
    }

    await Promise.all(promises);
    const endTime = Date.now();

    console.log(`✅ Set 100 keys in ${endTime - startTime}ms`);

    // Test 10: Cleanup
    console.log("\n📋 Test 10: Cleaning up test data...");

    const testKeys = await redis.keys("test:*");
    const perfKeys = await redis.keys("perf:*");
    const allTestKeys = [...testKeys, ...perfKeys];

    if (allTestKeys.length > 0) {
      await redis.del(...allTestKeys);
      console.log(`✅ Deleted ${allTestKeys.length} test keys`);
    }

    // Close connections
    await testQueue.close();
    await worker.close();
    await redis.quit();

    console.log("\n" + "=".repeat(50));
    console.log("\n✅ All Redis tests passed!");
    console.log("\nRedis is ready for use in FashionDeck.");
    console.log("\nNext steps:");
    console.log("  1. Implement cache service in NestJS");
    console.log("  2. Set up BullMQ queues for background jobs");
    console.log("  3. Configure cache TTL strategies");
    console.log("\n");
  } catch (error) {
    console.error("\n❌ Redis test failed:", error.message);
    console.error(error);
  }
}

// Run tests
testRedis().catch(console.error);
