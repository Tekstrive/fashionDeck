/**
 * Environment Configuration Schema
 * 
 * Validates and provides type-safe access to environment variables.
 * Uses class-validator for runtime validation.
 */

import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  // Application
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1000)
  @Max(65535)
  PORT: number = 3001;

  @IsString()
  @IsOptional()
  LOG_LEVEL?: string = 'debug';

  // Database
  @IsString()
  DATABASE_URL: string;

  @IsNumber()
  @IsOptional()
  DB_POOL_MIN?: number = 2;

  @IsNumber()
  @IsOptional()
  DB_POOL_MAX?: number = 10;

  // Redis
  @IsString()
  REDIS_URL: string;

  @IsNumber()
  @IsOptional()
  REDIS_TTL_PRODUCTS?: number = 21600; // 6 hours

  @IsNumber()
  @IsOptional()
  REDIS_TTL_PROMPTS?: number = 86400; // 24 hours

  // ML Service
  @IsString()
  ML_SERVICE_URL: string;

  @IsNumber()
  @IsOptional()
  ML_SERVICE_TIMEOUT?: number = 5000;

  // Marketplace APIs
  @IsString()
  @IsOptional()
  AMAZON_AFFILIATE_TAG?: string;

  @IsString()
  @IsOptional()
  AMAZON_ACCESS_KEY?: string;

  @IsString()
  @IsOptional()
  AMAZON_SECRET_KEY?: string;

  @IsString()
  @IsOptional()
  FLIPKART_AFFILIATE_ID?: string;

  @IsString()
  @IsOptional()
  FLIPKART_AFFILIATE_TOKEN?: string;

  // Rate Limiting
  @IsNumber()
  @IsOptional()
  RATE_LIMIT_WINDOW_MS?: number = 60000;

  @IsNumber()
  @IsOptional()
  RATE_LIMIT_MAX_REQUESTS?: number = 10;

  // CORS
  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string = 'http://localhost:3000';

  // Monitoring
  @IsString()
  @IsOptional()
  SENTRY_DSN?: string;

  @IsString()
  @IsOptional()
  ENABLE_REQUEST_LOGGING?: string = 'true';
}

/**
 * Validation function for environment variables
 */
export function validate(config: Record<string, unknown>) {
  const validatedConfig = new EnvironmentVariables();
  Object.assign(validatedConfig, config);
  return validatedConfig;
}
