/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Migration: Query Logs
 *
 * Creates a table to track user queries for analytics and debugging.
 * This helps us understand:
 * - What users are searching for
 * - Query performance metrics
 * - Failed queries for improvement
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Create query_logs table
  pgm.createTable("query_logs", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
    },
    prompt: {
      type: "text",
      notNull: true,
      comment: "Original user prompt",
    },
    parsed_json: {
      type: "jsonb",
      comment: "Parsed query JSON from ML service",
    },
    response_time_ms: {
      type: "integer",
      comment: "Total response time in milliseconds",
    },
    num_results: {
      type: "integer",
      comment: "Number of outfits returned",
    },
    success: {
      type: "boolean",
      notNull: true,
      default: true,
      comment: "Whether the query succeeded",
    },
    error_message: {
      type: "text",
      comment: "Error message if query failed",
    },
    user_ip: {
      type: "varchar(45)",
      comment: "User IP address (anonymized)",
    },
    user_agent: {
      type: "text",
      comment: "User agent string",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  // Create indexes for analytics queries
  pgm.createIndex("query_logs", "created_at", {
    name: "idx_query_logs_created_at",
  });

  pgm.createIndex("query_logs", "success", {
    name: "idx_query_logs_success",
  });

  pgm.createIndex("query_logs", ["success", "created_at"], {
    name: "idx_query_logs_success_created_at",
  });

  // Create GIN index on parsed_json for JSON queries
  pgm.sql(`
    CREATE INDEX idx_query_logs_parsed_json 
    ON query_logs 
    USING gin (parsed_json);
  `);

  // Add comments to table
  pgm.sql(`
    COMMENT ON TABLE query_logs IS 
    'Tracks user queries for analytics, performance monitoring, and debugging';
  `);
};

exports.down = (pgm) => {
  // Drop table (indexes are dropped automatically)
  pgm.dropTable("query_logs");
};
