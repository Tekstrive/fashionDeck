"""
Retry Logic with Exponential Backoff for Python

Implements retry decorator and helper for ML service external API calls.
"""

import asyncio
import random
import logging
from functools import wraps
from typing import TypeVar, Callable, Any
from dataclasses import dataclass

logger = logging.getLogger(__name__)

T = TypeVar('T')


@dataclass
class RetryConfig:
    """Configuration for retry logic"""
    max_retries: int = 3
    initial_delay: float = 1.0  # seconds
    max_delay: float = 10.0     # seconds
    backoff_multiplier: float = 2.0
    jitter_enabled: bool = True


def add_jitter(delay: float) -> float:
    """Add random jitter to delay (±25%)"""
    jitter_range = delay * 0.25
    jitter = random.uniform(-jitter_range, jitter_range)
    return max(0, delay + jitter)


def retry_async(config: RetryConfig = None):
    """
    Decorator for async functions with retry logic
    
    Usage:
        @retry_async(RetryConfig(max_retries=3))
        async def call_external_api():
            ...
    """
    if config is None:
        config = RetryConfig()
    
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            delay = config.initial_delay
            
            for attempt in range(config.max_retries + 1):
                try:
                    if attempt > 0:
                        logger.info(
                            f"Retry attempt {attempt}/{config.max_retries} for {func.__name__}"
                        )
                    
                    return await func(*args, **kwargs)
                    
                except Exception as e:
                    last_exception = e
                    
                    # Don't retry on last attempt
                    if attempt == config.max_retries:
                        logger.error(
                            f"All {config.max_retries} retries failed for {func.__name__}: {str(e)}"
                        )
                        break
                    
                    # Calculate backoff delay
                    backoff_delay = min(
                        delay * (config.backoff_multiplier ** attempt),
                        config.max_delay
                    )
                    
                    # Add jitter if enabled
                    final_delay = (
                        add_jitter(backoff_delay)
                        if config.jitter_enabled
                        else backoff_delay
                    )
                    
                    logger.warning(
                        f"{func.__name__} failed (attempt {attempt + 1}), "
                        f"retrying in {final_delay:.2f}s: {str(e)}"
                    )
                    
                    await asyncio.sleep(final_delay)
            
            raise last_exception
        
        return wrapper
    return decorator


# Predefined retry configurations
class RetryConfigs:
    """Predefined retry configurations for different use cases"""
    
    LLM_API = RetryConfig(
        max_retries=3,
        initial_delay=1.0,
        max_delay=10.0,
        backoff_multiplier=2.0,
        jitter_enabled=True,
    )
    
    DATABASE = RetryConfig(
        max_retries=5,
        initial_delay=2.0,
        max_delay=30.0,
        backoff_multiplier=2.0,
        jitter_enabled=False,
    )
    
    EXTERNAL_API = RetryConfig(
        max_retries=2,
        initial_delay=0.5,
        max_delay=5.0,
        backoff_multiplier=2.0,
        jitter_enabled=True,
    )
