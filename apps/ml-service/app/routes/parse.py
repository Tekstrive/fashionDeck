"""
Parse endpoint - Convert natural language to structured data.
"""

from fastapi import APIRouter, HTTPException, Depends
from loguru import logger
import time

from app.models import ParsePromptRequest, ParsePromptResponse
from app.services.parse_service import get_parse_service, ParseService

router = APIRouter(prefix="/parse-prompt", tags=["parse"])


@router.post("", response_model=ParsePromptResponse)
async def parse_prompt(
    request: ParsePromptRequest,
    parse_service: ParseService = Depends(get_parse_service)
):
    """
    Parse natural language fashion query into structured data.
    
    **Example Request:**
    ```json
    {
        "prompt": "korean minimal fit size M under 1500"
    }
    ```
    
    **Example Response:**
    ```json
    {
        "parsed": {
            "aesthetic": "korean minimal",
            "budget": 1500,
            "size": "M",
            "gender": "unisex",
            "occasion": null,
            "categories": ["top", "bottom"]
        },
        "processing_time": 245.3,
        "cached": false
    }
    ```
    """
    start_time = time.time()
    
    try:
        logger.info(f"Received parse request: '{request.prompt}'")
        
        # Parse prompt
        parsed, is_cached = await parse_service.parse_prompt(request.prompt)
        
        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return ParsePromptResponse(
            parsed=parsed,
            processing_time=processing_time,
            cached=is_cached
        )
        
    except Exception as e:
        logger.error(f"Error parsing prompt: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse prompt: {str(e)}"
        )
