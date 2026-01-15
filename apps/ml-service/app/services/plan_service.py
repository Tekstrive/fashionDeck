"""
Plan Service - Outfit schema planning using GPT-4o-mini.
"""

import json
import hashlib
from pathlib import Path
from typing import Optional, List, Tuple
from openai import AsyncOpenAI
from loguru import logger
import redis.asyncio as redis

from app.config import get_settings
from app.models import ParsedPrompt

settings = get_settings()


class PlanService:
    """Service for planning outfit schemas from parsed prompts."""
    
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
            logger.info("Redis connection established for PlanService")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Caching disabled.")
            self.redis_client = None
    
    async def close(self):
        """Close Redis connection."""
        if self.redis_client:
            await self.redis_client.close()
    
    def _load_prompt_template(self) -> str:
        """Load the prompt template from file."""
        template_path = Path(__file__).parent.parent / "prompts" / "plan_outfit.txt"
        with open(template_path, "r", encoding="utf-8") as f:
            return f.read()
    
    def _generate_cache_key(self, parsed_prompt: ParsedPrompt) -> str:
        """Generate cache key from parsed prompt."""
        # Create deterministic key from aesthetic + gender + categories
        key_parts = [
            parsed_prompt.aesthetic.lower().strip(),
            parsed_prompt.gender or "unisex",
            ",".join(sorted(parsed_prompt.categories)),
            parsed_prompt.occasion or ""
        ]
        key_string = "|".join(key_parts)
        key_hash = hashlib.md5(key_string.encode()).hexdigest()
        return f"plan:{key_hash}"
    
    async def _get_cached(self, cache_key: str) -> Optional[Tuple[List[str], str]]:
        """Get cached outfit plan."""
        if not self.redis_client:
            return None
        
        try:
            cached = await self.redis_client.get(cache_key)
            if cached:
                logger.info(f"Cache hit for plan key: {cache_key}")
                data = json.loads(cached)
                return data["items"], data["reasoning"]
        except Exception as e:
            logger.warning(f"Cache retrieval error: {e}")
        
        return None
    
    async def _set_cache(self, cache_key: str, items: List[str], reasoning: str):
        """Cache outfit plan (no expiry for common aesthetics)."""
        if not self.redis_client:
            return
        
        try:
            data = {"items": items, "reasoning": reasoning}
            # No expiry - cache common aesthetic patterns permanently
            await self.redis_client.set(cache_key, json.dumps(data))
            logger.info(f"Cached plan for key: {cache_key}")
        except Exception as e:
            logger.warning(f"Cache storage error: {e}")
    
    async def plan_outfit(self, parsed_prompt: ParsedPrompt) -> Tuple[List[str], str, bool]:
        """
        Plan outfit schema from parsed prompt.
        
        Args:
            parsed_prompt: Structured user query
            
        Returns:
            Tuple of (items, reasoning, is_cached)
        """
        # Check cache
        cache_key = self._generate_cache_key(parsed_prompt)
        cached = await self._get_cached(cache_key)
        if cached:
            items, reasoning = cached
            return items, reasoning, True
        
        # Call OpenAI API
        try:
            logger.info(f"Planning outfit for aesthetic: '{parsed_prompt.aesthetic}'")
            
            # Build user message with parsed prompt details
            user_message = json.dumps({
                "aesthetic": parsed_prompt.aesthetic,
                "gender": parsed_prompt.gender,
                "occasion": parsed_prompt.occasion,
                "categories": parsed_prompt.categories
            }, indent=2)
            
            response = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {"role": "system", "content": self.prompt_template},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=settings.openai_max_tokens,
                temperature=0.8,  # Higher temperature for more creative planning
                response_format={"type": "json_object"}
            )
            
            # Extract and parse JSON response
            content = response.choices[0].message.content
            logger.debug(f"GPT-4o-mini planning response: {content}")
            
            plan_data = json.loads(content)
            items = plan_data["items"]
            reasoning = plan_data.get("reasoning", "")
            
            # Validate items count
            if not (2 <= len(items) <= 4):
                logger.warning(f"Invalid item count: {len(items)}, using fallback")
                return self._create_fallback_plan(parsed_prompt)
            
            # Cache result
            await self._set_cache(cache_key, items, reasoning)
            
            logger.info(f"Successfully planned outfit: {len(items)} items")
            return items, reasoning, False
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from GPT-4o-mini: {e}")
            return self._create_fallback_plan(parsed_prompt)
            
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            return self._create_fallback_plan(parsed_prompt)
    
    def _create_fallback_plan(self, parsed_prompt: ParsedPrompt) -> Tuple[List[str], str, bool]:
        """
        Create fallback outfit plan when API fails.
        Uses simple aesthetic-to-items mapping.
        """
        logger.warning("Using fallback outfit planning")
        
        aesthetic_lower = parsed_prompt.aesthetic.lower()
        
        # Simple aesthetic mappings
        if "korean" in aesthetic_lower or "minimal" in aesthetic_lower:
            items = ["oversized t-shirt", "straight pants", "white sneakers"]
            reasoning = "Korean minimal aesthetic with clean lines and neutral colors"
        elif "street" in aesthetic_lower:
            items = ["graphic hoodie", "cargo pants", "chunky sneakers"]
            reasoning = "Streetwear with bold graphics and utility elements"
        elif "y2k" in aesthetic_lower:
            items = ["crop top", "low-rise jeans", "platform shoes"]
            reasoning = "Y2K aesthetic with 2000s-inspired pieces"
        elif "vintage" in aesthetic_lower:
            items = ["vintage blouse", "high-waisted skirt"]
            reasoning = "Vintage style with classic silhouettes"
        elif "athle" in aesthetic_lower or "sport" in aesthetic_lower:
            items = ["sports top", "leggings", "running shoes"]
            reasoning = "Athleisure combining athletic and casual style"
        elif "office" in aesthetic_lower or "formal" in aesthetic_lower:
            items = ["button-down shirt", "chino pants"]
            reasoning = "Office wear balancing professionalism and comfort"
        else:
            # Generic fallback
            items = ["casual top", "comfortable pants"]
            reasoning = f"Casual outfit for {parsed_prompt.aesthetic} aesthetic"
        
        # Trim to match categories
        if "shoes" in parsed_prompt.categories and len(items) == 2:
            items.append("casual shoes")
        
        return items[:4], reasoning, False


# Global instance
_plan_service: Optional[PlanService] = None


async def get_plan_service() -> PlanService:
    """Get or create PlanService instance."""
    global _plan_service
    if _plan_service is None:
        _plan_service = PlanService()
        await _plan_service.initialize()
    return _plan_service
