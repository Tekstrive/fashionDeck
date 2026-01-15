"""
Score endpoint - Score outfit coherence using GPT-4o-mini.
"""

from fastapi import APIRouter, HTTPException, Depends
from loguru import logger
import time

from app.models import ScoreOutfitsRequest, ScoreOutfitsResponse
from app.services.score_service import get_score_service, ScoreService

router = APIRouter(prefix="/score-outfits", tags=["score"])


@router.post("", response_model=ScoreOutfitsResponse)
async def score_outfits(
    request: ScoreOutfitsRequest,
    score_service: ScoreService = Depends(get_score_service)
):
    """
    Score a batch of outfit candidates for coherence and aesthetic match.
    
    **Example Request:**
    ```json
    {
        "aesthetic": "korean minimal",
        "outfits": [
            {
                "items": [
                    {"title": "Oversized White Tee", "category": "top", "price": 999},
                    {"title": "Black Straight Trousers", "category": "bottom", "price": 1499}
                ]
            }
        ]
    }
    ```
    
    **Example Response:**
    ```json
    {
        "scores": [8.5],
        "processing_time": 450.2
    }
    ```
    """
    start_time = time.time()
    
    try:
        logger.info(f"Received scoring request for {len(request.outfits)} outfits")
        
        # Score outfits
        scores = await score_service.score_outfits(request)
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return ScoreOutfitsResponse(
            scores=scores,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error scoring outfits: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to score outfits: {str(e)}"
        )
