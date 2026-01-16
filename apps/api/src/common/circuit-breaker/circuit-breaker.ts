

import { Injectable, Logger } from '@nestjs/common';

enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Circuit is open, rejecting requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening
  failureWindow: number;        // Time window for counting failures (ms)
  resetTimeout: number;         // Time before attempting to close circuit (ms)
  successThreshold: number;     // Successes needed in HALF_OPEN to close
}

interface CircuitStats {
  failures: number;
  successes: number;
  lastFailureTime: number;
  lastStateChange: number;
}

@Injectable()
export class CircuitBreaker {
  private readonly logger = new Logger(CircuitBreaker.name);
  private state: CircuitState = CircuitState.CLOSED;
  private stats: CircuitStats = {
    failures: 0,
    successes: 0,
    lastFailureTime: 0,
    lastStateChange: Date.now(),
  };

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig,
  ) {
    this.logger.log(`Circuit breaker initialized for: ${name}`);
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    // Check if circuit should transition states
    this.checkStateTransition();

    // If circuit is OPEN, reject immediately
    if (this.state === CircuitState.OPEN) {
      this.logger.warn(`Circuit ${this.name} is OPEN, rejecting request`);
      if (fallback) {
        return fallback();
      }
      throw new Error(`Circuit breaker is OPEN for ${this.name}`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      
      // If we have a fallback, use it
      if (fallback) {
        this.logger.warn(`Using fallback for ${this.name}`);
        return fallback();
      }
      
      throw error;
    }
  }

  /**
   * Record a successful call
   */
  private onSuccess(): void {
    this.stats.successes++;

    // If in HALF_OPEN state and reached success threshold, close circuit
    if (
      this.state === CircuitState.HALF_OPEN &&
      this.stats.successes >= this.config.successThreshold
    ) {
      this.transitionTo(CircuitState.CLOSED);
      this.resetStats();
    }
  }

  /**
   * Record a failed call
   */
  private onFailure(): void {
    this.stats.failures++;
    this.stats.lastFailureTime = Date.now();

    // Check if we should open the circuit
    if (this.shouldOpenCircuit()) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  /**
   * Check if circuit should open based on failure threshold
   */
  private shouldOpenCircuit(): boolean {
    if (this.state === CircuitState.OPEN) {
      return false;
    }

    // Check if failures exceed threshold within the time window
    const now = Date.now();
    const windowStart = now - this.config.failureWindow;

    // If last failure was outside the window, reset counter
    if (this.stats.lastFailureTime < windowStart) {
      this.stats.failures = 1;
      return false;
    }

    return this.stats.failures >= this.config.failureThreshold;
  }

  /**
   * Check if circuit should transition to a different state
   */
  private checkStateTransition(): void {
    if (this.state !== CircuitState.OPEN) {
      return;
    }

    const now = Date.now();
    const timeSinceOpen = now - this.stats.lastStateChange;

    // If enough time has passed, try HALF_OPEN
    if (timeSinceOpen >= this.config.resetTimeout) {
      this.transitionTo(CircuitState.HALF_OPEN);
      this.stats.successes = 0;
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.stats.lastStateChange = Date.now();

    this.logger.log(
      `Circuit ${this.name} transitioned: ${oldState} -> ${newState}`,
    );
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats.failures = 0;
    this.stats.successes = 0;
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit statistics
   */
  getStats(): CircuitStats {
    return { ...this.stats };
  }
}

/**
 * Factory for creating circuit breakers with default configs
 */
export class CircuitBreakerFactory {
  private static breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create a circuit breaker for ML service
   */
  static getMLServiceBreaker(): CircuitBreaker {
    const name = 'ml-service';
    if (!this.breakers.has(name)) {
      this.breakers.set(
        name,
        new CircuitBreaker(name, {
          failureThreshold: 5,
          failureWindow: 60000, // 1 minute
          resetTimeout: 30000,  // 30 seconds
          successThreshold: 2,
        }),
      );
    }
    return this.breakers.get(name)!;
  }

  /**
   * Get or create a circuit breaker for marketplace APIs
   */
  static getMarketplaceBreaker(marketplace: string): CircuitBreaker {
    const name = `marketplace-${marketplace}`;
    if (!this.breakers.has(name)) {
      this.breakers.set(
        name,
        new CircuitBreaker(name, {
          failureThreshold: 3,
          failureWindow: 60000, // 1 minute
          resetTimeout: 20000,  // 20 seconds
          successThreshold: 1,
        }),
      );
    }
    return this.breakers.get(name)!;
  }
}
