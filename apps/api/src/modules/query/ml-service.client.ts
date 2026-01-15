/**
 * ML Service Client
 * 
 * Handles communication with the FastAPI ML service for:
 * - Prompt parsing (GPT-4o-mini)
 * - Outfit planning (GPT-4o-mini)
 * - Embedding scoring (CLIP)
 * - Outfit ranking (GPT-4o-mini)
 * 
 * Features:
 * - Circuit breaker pattern for fault tolerance
 * - Automatic retries with exponential backoff
 * - Fallback responses for graceful degradation
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout, retry, timer } from 'rxjs';
import { ParsedPrompt, Outfit } from '@fashiondeck/types';
import { CircuitBreaker, CircuitState } from './circuit-breaker';

export interface ParsePromptResponse {
  parsed: ParsedPrompt;
  processingTime: number;
}

export interface PlanOutfitResponse {
  categories: string[];
  reasoning: string;
}

export interface ScoreEmbeddingsResponse {
  scores: number[];
  processingTime: number;
}

export interface RankOutfitsResponse {
  scores: number[];
  rankings: number[];
  processingTime: number;
}

export interface ScoreOutfitRequest {
  aesthetic: string;
  items: Array<{
    title: string;
    category: string;
    price: number;
  }>;
}

export interface ScoreOutfitResponse {
  score: number;
  reasoning: string;
}

@Injectable()
export class MLServiceClient {
  private readonly logger = new Logger(MLServiceClient.name);
  private readonly mlServiceUrl: string;
  private readonly mlServiceTimeout: number;
  private readonly maxRetries: number;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL', 'http://localhost:8000');
    this.mlServiceTimeout = this.configService.get<number>('ML_SERVICE_TIMEOUT', 5000);
    this.maxRetries = 3;

    // Initialize circuit breaker
    // 5 failures in 60 seconds opens circuit, reset after 30 seconds
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 30000, // 30 seconds
      monitoringWindow: 60000, // 1 minute
    });
  }

  /**
   * Parse user prompt using LLM
   */
  async parsePrompt(prompt: string): Promise<ParsedPrompt> {
    const startTime = Date.now();

    // Check circuit breaker
    if (!this.circuitBreaker.canExecute()) {
      this.logger.warn('Circuit breaker OPEN, using fallback prompt parsing');
      return this.createFallbackParsedPrompt(prompt);
    }

    try {
      this.logger.debug(`Parsing prompt: "${prompt}"`);

      const response = await this.executeWithRetry<ParsePromptResponse>(
        () => this.httpService.post(`${this.mlServiceUrl}/parse-prompt`, { prompt }),
        'parsePrompt'
      );

      const processingTime = Date.now() - startTime;
      this.logger.log(`Prompt parsed in ${processingTime}ms`);

      this.circuitBreaker.recordSuccess();
      return response.data.parsed;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(`Failed to parse prompt after ${processingTime}ms:`, error.message);

      this.circuitBreaker.recordFailure();

      // Fallback: Return basic parsed prompt
      return this.createFallbackParsedPrompt(prompt);
    }
  }

  /**
   * Plan outfit categories based on query
   */
  async planOutfit(parsedPrompt: ParsedPrompt): Promise<string[]> {
    // Check circuit breaker
    if (!this.circuitBreaker.canExecute()) {
      this.logger.warn('Circuit breaker OPEN, using fallback outfit planning');
      return this.createFallbackOutfitPlan(parsedPrompt);
    }

    try {
      this.logger.debug('Planning outfit categories');

      const response = await this.executeWithRetry<PlanOutfitResponse>(
        () => this.httpService.post(`${this.mlServiceUrl}/plan-outfit`, { query: parsedPrompt }),
        'planOutfit'
      );

      this.circuitBreaker.recordSuccess();
      return response.data.categories;

    } catch (error) {
      this.logger.error('Failed to plan outfit:', error.message);
      this.circuitBreaker.recordFailure();

      // Fallback
      return this.createFallbackOutfitPlan(parsedPrompt);
    }
  }

  /**
   * Score outfits using CLIP embeddings
   */
  async scoreEmbeddings(outfits: Outfit[]): Promise<number[]> {
    // Check circuit breaker
    if (!this.circuitBreaker.canExecute()) {
      this.logger.warn('Circuit breaker OPEN, using fallback embedding scores');
      return outfits.map(() => 0.5);
    }

    try {
      this.logger.debug(`Scoring ${outfits.length} outfits with embeddings`);

      const response = await this.executeWithRetry<ScoreEmbeddingsResponse>(
        () => this.httpService.post(`${this.mlServiceUrl}/score-embeddings`, { outfits }),
        'scoreEmbeddings'
      );

      this.circuitBreaker.recordSuccess();
      return response.data.scores;

    } catch (error) {
      this.logger.error('Failed to score embeddings:', error.message);
      this.circuitBreaker.recordFailure();

      // Fallback: Return neutral scores
      return outfits.map(() => 0.5);
    }
  }

  /**
   * Rank outfits using LLM coherence scoring
   */
  async rankOutfits(outfits: Outfit[]): Promise<number[]> {
    // Check circuit breaker
    if (!this.circuitBreaker.canExecute()) {
      this.logger.warn('Circuit breaker OPEN, using fallback ranking');
      return outfits.map((_, index) => index);
    }

    try {
      this.logger.debug(`Ranking ${outfits.length} outfits with LLM`);

      const response = await this.executeWithRetry<RankOutfitsResponse>(
        () => this.httpService.post(`${this.mlServiceUrl}/rank-outfits`, { outfits }),
        'rankOutfits'
      );

      this.circuitBreaker.recordSuccess();
      return response.data.rankings;

    } catch (error) {
      this.logger.error('Failed to rank outfits:', error.message);
      this.circuitBreaker.recordFailure();

      // Fallback: Return sequential rankings
      return outfits.map((_, index) => index);
    }
  }

  /**
   * Score outfit coherence using LLM
   */
  async scoreOutfit(request: ScoreOutfitRequest): Promise<number> {
    const startTime = Date.now();

    // Check circuit breaker
    if (!this.circuitBreaker.canExecute()) {
      this.logger.warn('Circuit breaker OPEN, using fallback outfit scoring');
      return 0.5;
    }

    try {
      this.logger.debug(`Scoring outfit with ${request.items.length} items`);

      const response = await this.executeWithRetry<ScoreOutfitResponse>(
        () => this.httpService.post(`${this.mlServiceUrl}/score-outfit`, request),
        'scoreOutfit'
      );

      const processingTime = Date.now() - startTime;
      this.logger.log(`Outfit scored in ${processingTime}ms: ${response.data.score}`);

      this.circuitBreaker.recordSuccess();
      return response.data.score;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.warn(`Failed to score outfit after ${processingTime}ms:`, error.message);

      this.circuitBreaker.recordFailure();

      // Fallback: Return neutral score
      return 0.5;
    }
  }

  /**
   * Generate embedding for product
   */
  async generateEmbedding(text: string, imageUrl?: string): Promise<number[]> {
    // Check circuit breaker
    if (!this.circuitBreaker.canExecute()) {
      this.logger.warn('Circuit breaker OPEN, skipping embedding generation');
      throw new Error('ML service unavailable');
    }

    try {
      const response = await this.executeWithRetry<{ embedding: number[] }>(
        () => this.httpService.post(`${this.mlServiceUrl}/generate-embedding`, { text, imageUrl }),
        'generateEmbedding'
      );

      this.circuitBreaker.recordSuccess();
      return response.data.embedding;

    } catch (error) {
      this.logger.error('Failed to generate embedding:', error.message);
      this.circuitBreaker.recordFailure();
      throw error;
    }
  }

  /**
   * Health check for ML service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get(`${this.mlServiceUrl}/health`)
          .pipe(timeout(2000))
      );

      return response.status === 200;
    } catch (error) {
      this.logger.warn('ML service health check failed:', error.message);
      return false;
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus() {
    return {
      state: this.circuitBreaker.getState(),
      failureCount: this.circuitBreaker.getFailureCount(),
      isOpen: this.circuitBreaker.getState() === CircuitState.OPEN,
    };
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => any,
    operation: string
  ): Promise<{ data: T }> {
    return await firstValueFrom(
      requestFn().pipe(
        timeout(this.mlServiceTimeout),
        retry({
          count: this.maxRetries,
          delay: (error, retryCount) => {
            this.logger.debug(`Retry ${retryCount}/${this.maxRetries} for ${operation}`);
            // Exponential backoff: 1s, 2s, 4s
            return timer(Math.pow(2, retryCount - 1) * 1000);
          },
        })
      )
    );
  }

  /**
   * Create fallback parsed prompt when ML service is unavailable
   */
  private createFallbackParsedPrompt(prompt: string): ParsedPrompt {
    this.logger.warn('Using fallback prompt parsing');

    // Extract basic information from prompt
    const lowerPrompt = prompt.toLowerCase();
    
    // Try to extract budget
    const budgetMatch = lowerPrompt.match(/(\d+)/);
    const budget = budgetMatch ? parseInt(budgetMatch[1]) : undefined;

    // Try to extract size
    let size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | undefined;
    if (lowerPrompt.includes(' xs ') || lowerPrompt.includes('extra small')) size = 'XS';
    else if (lowerPrompt.includes(' s ') || lowerPrompt.includes('small')) size = 'S';
    else if (lowerPrompt.includes(' m ') || lowerPrompt.includes('medium')) size = 'M';
    else if (lowerPrompt.includes(' l ') || lowerPrompt.includes('large')) size = 'L';
    else if (lowerPrompt.includes(' xl ') || lowerPrompt.includes('extra large')) size = 'XL';
    else if (lowerPrompt.includes('xxl') || lowerPrompt.includes('2xl')) size = 'XXL';

    // Try to extract gender
    let gender: 'male' | 'female' | 'unisex' | undefined;
    if (lowerPrompt.includes('men') || lowerPrompt.includes('male')) gender = 'male';
    else if (lowerPrompt.includes('women') || lowerPrompt.includes('female')) gender = 'female';
    else gender = 'unisex';

    // Default categories
    const categories: Array<'top' | 'bottom' | 'shoes' | 'accessories'> = ['top', 'bottom'];

    return {
      aesthetic: prompt, // Use full prompt as aesthetic
      budget,
      size,
      gender,
      categories,
    };
  }

  /**
   * Create fallback outfit plan
   */
  private createFallbackOutfitPlan(parsedPrompt: ParsedPrompt): string[] {
    this.logger.warn('Using fallback outfit planning');
    return parsedPrompt.categories || ['top', 'bottom'];
  }
}
