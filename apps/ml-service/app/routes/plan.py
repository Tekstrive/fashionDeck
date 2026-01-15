"""
Plan endpoint - Generate outfit schema from parsed query.
"""

from fastapi import APIRouter, HTTPException, Depends
from loguru import logger
import time

from app.models import PlanOutfitRequest, PlanOutfitResponse
from app.services.plan_service import get_plan_service, PlanService

router = APIRouter(prefix="/plan-outfit", tags=["plan"])


@router.post("", response_model=PlanOutfitResponse)
async def plan_outfit(
    request: PlanOutfitRequest,
    plan_service: PlanService = Depends(get_plan_service)
):
    """
    Generate outfit schema from parsed user query.
    
    **Example Request:**
    ```json
    {
        "parsed_prompt": {
            "aesthetic": "korean minimal",
            "gender": "unisex",
            "categories": ["top", "bottom", "shoes"]
        }
    }
    ```
    
    **Example Response:**
    ```json
    {
        "items": [
            "oversized white t-shirt",
            "straight black pants",
            "white minimal sneakers"
        ],
        "reasoning": "Korean minimal aesthetic emphasizes clean lines...",
        "processing_time": 312.5,
        "cached": false
    }
    ```
    """
    start_time = time.time()
    
    try:
        logger.info(f"Received plan request for aesthetic: '{request.parsed_prompt.aesthetic}'")
        
        # Plan outfit
        items, reasoning, is_cached = await plan_service.plan_outfit(request.parsed_prompt)
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return PlanOutfitResponse(
            items=items,
            reasoning=reasoning,
            processing_time=processing_time,
            cached=is_cached
        )
        
    except Exception as e:
        logger.error(f"Error planning outfit: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to plan outfit: {str(e)}"
        )
