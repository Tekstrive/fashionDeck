"""
Parse Service - Natural language prompt parsing using GPT-4o-mini.
"""

import json
import hashlib
from pathlib import Path
from typing import Optional
from openai import AsyncOpenAI
from loguru import logger
import redis.asyncio as redis

from app.config import get_settings
from app.models import ParsedPrompt

settings = get_settings()


class ParseService:
    """Service for parsing natural language prompts into structured data."""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.redis_client: Optional[redis.Redis] = None
        self.prompt_template = self._load_prompt_template()
        
    async def initialize(self):
        """Initialize Redis connection."""
        try:
            self.redis_client = await redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            logger.info("Redis connection established for ParseService")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Caching disabled.")
            self.redis_client = None
    
    async def close(self):
        """Close Redis connection."""
        if self.redis_client:
            await self.redis_client.close()
    
    def _load_prompt_template(self) -> str:
        """Load the prompt template from file."""
        template_path = Path(__file__).parent.parent / "prompts" / "parse_prompt.txt"
        with open(template_path, "r", encoding="utf-8") as f:
            return f.read()
    
    def _generate_cache_key(self, prompt: str) -> str:
        """Generate cache key from prompt text."""
        prompt_hash = hashlib.md5(prompt.lower().strip().encode()).hexdigest()
        return f"parse:{prompt_hash}"
    
    async def _get_cached(self, cache_key: str) -> Optional[ParsedPrompt]:
        """Get cached parsed prompt."""
        if not self.redis_client:
            return None
        
        try:
            cached = await self.redis_client.get(cache_key)
            if cached:
                logger.info(f"Cache hit for key: {cache_key}")
                return ParsedPrompt(**json.loads(cached))
        except Exception as e:
            logger.warning(f"Cache retrieval error: {e}")
        
        return None
    
    async def _set_cache(self, cache_key: str, parsed: ParsedPrompt):
        """Cache parsed prompt."""
        if not self.redis_client:
            return
        
        try:
            await self.redis_client.setex(
                cache_key,
                settings.redis_ttl,  # 24 hours
                parsed.model_dump_json()
            )
            logger.info(f"Cached result for key: {cache_key}")
        except Exception as e:
            logger.warning(f"Cache storage error: {e}")
    
    async def parse_prompt(self, prompt: str) -> tuple[ParsedPrompt, bool]:
        """
        Parse natural language prompt into structured data.
        
        Args:
            prompt: User's natural language query
            
        Returns:
            Tuple of (ParsedPrompt, is_cached)
        """
        # Check cache
        cache_key = self._generate_cache_key(prompt)
        cached = await self._get_cached(cache_key)
        if cached:
            return cached, True
        
        # Call OpenAI API
        try:
            logger.info(f"Parsing prompt with GPT-4o-mini: '{prompt}'")
            
            response = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {"role": "system", "content": self.prompt_template},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=settings.openai_max_tokens,
                temperature=settings.openai_temperature,
                response_format={"type": "json_object"}  # Enforce JSON output
            )
            
            # Extract and parse JSON response
            content = response.choices[0].message.content
            logger.debug(f"GPT-4o-mini response: {content}")
            
            parsed_data = json.loads(content)
            parsed = ParsedPrompt(**parsed_data)
            
            # Cache result
            await self._set_cache(cache_key, parsed)
            
            logger.info(f"Successfully parsed prompt: {parsed.aesthetic}")
            return parsed, False
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from GPT-4o-mini: {e}")
            return self._create_fallback_parse(prompt), False
            
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            return self._create_fallback_parse(prompt), False
    
    def _create_fallback_parse(self, prompt: str) -> ParsedPrompt:
        """
        Create fallback parsed prompt when API fails.
        Uses simple regex-based extraction.
        """
        logger.warning("Using fallback prompt parsing")
        
        prompt_lower = prompt.lower()
        
        # Extract budget
        budget = None
        import re
        budget_match = re.search(r'(\d+)', prompt_lower)
        if budget_match:
            budget = int(budget_match.group(1))
        
        # Extract size
        size = None
        for s in ["xs", "s", "m", "l", "xl", "xxl"]:
            if f" {s} " in f" {prompt_lower} " or f"size {s}" in prompt_lower:
                size = s.upper()
                break
        
        # Extract gender
        gender = "unisex"
        if "men" in prompt_lower or "male" in prompt_lower:
            gender = "male"
        elif "women" in prompt_lower or "female" in prompt_lower:
            gender = "female"
        
        # Default categories
        categories = ["top", "bottom"]
        if "shoe" in prompt_lower:
            categories.append("shoes")
        if "accessor" in prompt_lower:
            categories.append("accessories")
        
        return ParsedPrompt(
            aesthetic=prompt,  # Use full prompt as aesthetic
            budget=budget,
            size=size,
            gender=gender,
            occasion=None,
            categories=categories
        )


# Global instance
_parse_service: Optional[ParseService] = None


async def get_parse_service() -> ParseService:
    """Get or create ParseService instance."""
    global _parse_service
    if _parse_service is None:
        _parse_service = ParseService()
        await _parse_service.initialize()
    return _parse_service
