"""
Score Service - Outfit coherence scoring using GPT-4o-mini.
"""

import json
from pathlib import Path
from typing import Optional, List
from openai import AsyncOpenAI
from loguru import logger

from app.config import get_settings
from app.models import OutfitCandidate, ScoreOutfitsRequest

settings = get_settings()


class ScoreService:
    """Service for scoring outfit coherence using GPT-4o-mini."""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.prompt_template = self._load_prompt_template()
    
    def _load_prompt_template(self) -> str:
        """Load the prompt template from file."""
        template_path = Path(__file__).parent.parent / "prompts" / "score_outfit.txt"
        with open(template_path, "r", encoding="utf-8") as f:
            return f.read()
    
    async def score_outfits(self, request: ScoreOutfitsRequest) -> List[float]:
        """
        Score a batch of outfit candidates.
        
        Args:
            request: Batch score request with aesthetic and outfits
            
        Returns:
            List of scores (1.0 to 10.0)
        """
        try:
            num_outfits = len(request.outfits)
            logger.info(f"Scoring batch of {num_outfits} outfits for aesthetic: '{request.aesthetic}'")
            
            # Prepare outfits for prompt
            outfits_data = []
            for i, outfit in enumerate(request.outfits):
                items_desc = [f"{item.category}: {item.title} (₹{item.price})" for item in outfit.items]
                outfits_data.append({
                    "id": i + 1,
                    "items": items_desc
                })
            
            # Populate template
            prompt = self.prompt_template.replace("{{ aesthetic }}", request.aesthetic)
            prompt = prompt.replace("{{ outfits_json }}", json.dumps(outfits_data, indent=2))
            
            response = await self.client.chat.completions.create(
                model=settings.openai_model,
                messages=[
                    {"role": "system", "content": "You are a professional fashion stylist scoring outfit coherence."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=settings.openai_max_tokens,
                temperature=0.3,  # Lower temperature for more consistent scoring
                response_format={"type": "json_object"}
            )
            
            # Extract and parse JSON response
            content = response.choices[0].message.content
            logger.debug(f"GPT-4o-mini scoring response: {content}")
            
            result = json.loads(content)
            scores = result.get("scores", [])
            
            # Validate scores
            if len(scores) != num_outfits:
                logger.error(f"Expected {num_outfits} scores, got {len(scores)}")
                return [5.0] * num_outfits  # Neutral fallback
            
            # Clean and bound scores
            bounded_scores = [max(1.0, min(10.0, float(s))) for s in scores]
            
            logger.info(f"Successfully scored {num_outfits} outfits")
            return bounded_scores
            
        except Exception as e:
            logger.error(f"Error calling OpenAI API for scoring: {e}")
            return [5.0] * len(request.outfits)  # Neutral fallback


# Global instance
_score_service: Optional[ScoreService] = None


async def get_score_service() -> ScoreService:
    """Get or create ScoreService instance."""
    global _score_service
    if _score_service is None:
        _score_service = ScoreService()
    return _score_service
