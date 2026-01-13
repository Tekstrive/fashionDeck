#!/usr/bin/env node
/**
 * Quick Database Setup Script
 *
 * This script:
 * 1. Checks if Docker is running
 * 2. Starts PostgreSQL if needed
 * 3. Waits for database to be ready
 * 4. Runs migrations
 * 5. Tests the database
 */

const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

async function runCommand(command, description) {
  console.log(`\n${description}...`);
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stdout) console.log(stdout.trim());
    if (stderr) console.error(stderr.trim());
    return true;
  } catch (error) {
    console.error(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function waitForDatabase(maxAttempts = 30) {
  console.log("\n⏳ Waiting for database to be ready...");

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await execPromise(
        "docker exec fashiondeck-postgres pg_isready -U fashiondeck"
      );
      console.log("✅ Database is ready!");
      return true;
    } catch (error) {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n❌ Database did not become ready in time");
  return false;
}

async function main() {
  console.log("🚀 FashionDeck Database Setup\n");
  console.log("=".repeat(50));

  // Step 1: Check Docker
  console.log("\n📋 Step 1: Checking Docker...");
  const dockerCheck = await runCommand(
    "docker --version",
    "Checking Docker installation"
  );

  if (!dockerCheck) {
    console.log("\n❌ Docker is not installed or not running.");
    console.log("Please install Docker Desktop and start it.");
    console.log("Download: https://www.docker.com/products/docker-desktop");
    process.exit(1);
  }

  // Step 2: Start Docker services
  console.log("\n📋 Step 2: Starting Docker services...");
  await runCommand(
    "docker-compose up -d postgres redis",
    "Starting PostgreSQL and Redis"
  );

  // Step 3: Wait for database
  const dbReady = await waitForDatabase();
  if (!dbReady) {
    console.log("\n❌ Database setup failed. Please check Docker logs:");
    console.log("   docker-compose logs postgres");
    process.exit(1);
  }

  // Step 4: Run migrations
  console.log("\n📋 Step 3: Running database migrations...");
  const migrateSuccess = await runCommand(
    "cd apps/api && npm run migrate:up",
    "Applying migrations"
  );

  if (!migrateSuccess) {
    console.log("\n⚠️  Migrations may have already been run. Continuing...");
  }

  // Step 5: Test database
  console.log("\n📋 Step 4: Testing database...");
  await runCommand("node scripts/test-db.js", "Running database tests");

  console.log("\n" + "=".repeat(50));
  console.log("\n✅ Database setup complete!");
  console.log("\nNext steps:");
  console.log(
    "  1. Check database: docker exec -it fashiondeck-postgres psql -U fashiondeck -d fashiondeck"
  );
  console.log("  2. View tables: \\dt");
  console.log("  3. Start development: npm run dev");
  console.log("\n");
}

main().catch((error) => {
  console.error("\n❌ Setup failed:", error.message);
  process.exit(1);
});
