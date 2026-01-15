"""
Aesthetic Service - Pre-computing and managing aesthetic reference embeddings.
"""

import json
from typing import List, Dict, Optional
import redis.asyncio as redis
from loguru import logger

from app.config import get_settings
from app.embeddings.clip_service import get_clip_service

settings = get_settings()

# Popular aesthetics list
COMMON_AESTHETICS = [
    "Korean Minimal", "Streetwear", "Y2K", "Vintage", "Athleisure", 
    "Office Wear", "Boho", "Cottagecore", "Dark Academia", "Grunge", 
    "Preppy", "Cyberpunk", "Techwear", "Gorpcore", "Old Money", 
    "Quiet Luxury", "E-Girl", "E-Boy", "Soft Girl", "Indie Sleaze", 
    "Normcore", "Minimalism", "Maximalism", "Avant Garde", "Harajuku", 
    "Punk", "Rocker", "Western", "Safari", "Nautical"
]

class AestheticService:
    """Service for managing pre-computed aesthetic embeddings."""
    
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
        self._clip_service = None
        
    async def initialize(self):
        """Initialize connections."""
        try:
            self.redis_client = await redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            logger.info("Redis connection established for AestheticService")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis for AestheticService: {e}")
            self.redis_client = None
            
    async def get_clip_service(self):
        if self._clip_service is None:
            self._clip_service = await get_clip_service()
        return self._clip_service

    async def precompute_aesthetics(self) -> int:
        """
        Precompute embeddings for all common aesthetics and store in Redis.
        Returns the number of successful computations.
        """
        if not self.redis_client:
            await self.initialize()
            if not self.redis_client:
                logger.error("Redis client not available for precomputation")
                return 0

        clip = await self.get_clip_service()
        count = 0
        
        logger.info(f"Starting precomputation for {len(COMMON_AESTHETICS)} aesthetics")
        
        for aesthetic in COMMON_AESTHETICS:
            try:
                # Generate text embedding
                embedding = await clip.encode_text(aesthetic)
                
                # Store in Redis: aesthetic:vector:<name>
                key = f"aesthetic:vector:{aesthetic.lower().replace(' ', '_')}"
                await self.redis_client.set(key, json.dumps(embedding))
                
                count += 1
                logger.debug(f"Computed embedding for: {aesthetic}")
            except Exception as e:
                logger.error(f"Failed to compute embedding for {aesthetic}: {e}")
                
        logger.info(f"Precomputation complete. {count}/{len(COMMON_AESTHETICS)} successful.")
        return count

    async def get_all_aesthetics(self) -> Dict[str, List[float]]:
        """Retrieve all precomputed aesthetic embeddings from Redis."""
        if not self.redis_client:
            await self.initialize()
            if not self.redis_client:
                return {}

        results = {}
        try:
            # Find all aesthetic vector keys
            pattern = "aesthetic:vector:*"
            keys = await self.redis_client.keys(pattern)
            
            for key in keys:
                name = key.replace("aesthetic:vector:", "").replace("_", " ").title()
                vector_json = await self.redis_client.get(key)
                if vector_json:
                    results[name] = json.loads(vector_json)
                    
            return results
        except Exception as e:
            logger.error(f"Failed to retrieve aesthetic embeddings: {e}")
            return {}

    async def find_nearest_aesthetic(self, prompt: str) -> Optional[str]:
        """
        Find the closest precomputed aesthetic to a given user prompt.
        Useful for classification and faster retrieval.
        """
        try:
            clip = await self.get_clip_service()
            prompt_emb = await clip.encode_text(prompt)
            prompt_emb = prompt_emb / (sum(x**2 for x in prompt_emb)**0.5) # Normalize
            
            aesthetics = await self.get_all_aesthetics()
            if not aesthetics:
                return None
                
            best_aesthetic = None
            max_sim = -1.0
            
            import numpy as np
            p_v = np.array(prompt_emb)
            
            for name, vector in aesthetics.items():
                v = np.array(vector)
                # Cosine similarity (both normalized)
                sim = np.dot(p_v, v)
                if sim > max_sim:
                    max_sim = sim
                    best_aesthetic = name
            
            logger.info(f"Nearest aesthetic for '{prompt}': {best_aesthetic} (sim: {max_sim:.4f})")
            return best_aesthetic
        except Exception as e:
            logger.error(f"Error finding nearest aesthetic: {e}")
            return None


# Global instance
_aesthetic_service: Optional[AestheticService] = None

async def get_aesthetic_service() -> AestheticService:
    """Get or create AestheticService instance."""
    global _aesthetic_service
    if _aesthetic_service is None:
        _aesthetic_service = AestheticService()
        await _aesthetic_service.initialize()
    return _aesthetic_service
