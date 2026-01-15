"""
Aesthetic routes - Management of pre-computed style embeddings.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from loguru import logger
import time
from typing import List, Dict

from app.services.aesthetic_service import get_aesthetic_service, AestheticService

router = APIRouter(prefix="/aesthetics", tags=["aesthetic"])


@router.post("/precompute")
async def trigger_precomputation(
    background_tasks: BackgroundTasks,
    aesthetic_service: AestheticService = Depends(get_aesthetic_service)
):
    """
    Trigger pre-computation of embeddings for common aesthetics in the background.
    """
    logger.info("Aesthetic precomputation triggered")
    background_tasks.add_task(aesthetic_service.precompute_aesthetics)
    return {"message": "Aesthetic precomputation started in background"}


@router.get("/list")
async def list_aesthetics(
    aesthetic_service: AestheticService = Depends(get_aesthetic_service)
):
    """
    List all precomputed aesthetics currently in Redis.
    """
    aesthetics = await aesthetic_service.get_all_aesthetics()
    return {
        "count": len(aesthetics),
        "aesthetics": list(aesthetics.keys())
    }


@router.get("/identify")
async def identify_style(
    prompt: str,
    aesthetic_service: AestheticService = Depends(get_aesthetic_service)
):
    """
    Identify the closest precomputed aesthetic style for a given prompt.
    """
    style = await aesthetic_service.find_nearest_aesthetic(prompt)
    if not style:
        raise HTTPException(status_code=404, detail="No aesthetic matches found")
    return {"prompt": prompt, "identified_style": style}
