"""
Embed endpoint - Generate CLIP embeddings for text and images.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from loguru import logger
import time
from typing import Optional

from app.models import EmbeddingRequest, EmbeddingResponse
from app.embeddings.clip_service import get_clip_service, CLIPService
from app.services.embed_service import get_embed_service, EmbedService

router = APIRouter(prefix="/embed", tags=["embedding"])


@router.post("", response_model=EmbeddingResponse)
async def generate_embedding(
    request: EmbeddingRequest,
    background_tasks: BackgroundTasks,
    clip_service: CLIPService = Depends(get_clip_service),
    embed_service: EmbedService = Depends(get_embed_service)
):
    """
    Generate CLIP embeddings for text and/or an image URL.
    
    If 'product_id' is provided, the embeddings will be persisted to the database
    in the background.
    """
    if not request.text and not request.image_url:
        raise HTTPException(
            status_code=400,
            detail="Must provide either 'text' or 'image_url'"
        )
        
    start_time = time.time()
    
    try:
        text_embedding = None
        image_embedding = None
        
        # Generate text embedding if provided
        if request.text:
            logger.info(f"Generating embedding for text: '{request.text[:50]}...'")
            text_embedding = await clip_service.encode_text(request.text)
            
        # Generate image embedding if provided
        if request.image_url:
            logger.info(f"Generating embedding for image: {request.image_url}")
            image_embedding = await clip_service.encode_image(request.image_url)
            
        # Persist if product_id is provided
        if request.product_id:
            logger.info(f"Queueing background persistence for product {request.product_id}")
            # We can directly update if we already have the embeddings
            # but using the service method ensures consistency
            background_tasks.add_task(
                embed_service.process_product,
                request.product_id,
                request.text or "unnamed",
                request.image_url or ""
            )

        processing_time = (time.time() - start_time) * 1000  # Convert to ms
        
        return EmbeddingResponse(
            text_embedding=text_embedding,
            image_embedding=image_embedding,
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Error generating embeddings: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Embedding generation failed: {str(e)}"
        )


@router.post("/batch-process")
async def batch_process_embeddings(
    background_tasks: BackgroundTasks,
    embed_service: EmbedService = Depends(get_embed_service),
    batch_size: int = 32
):
    """
    Trigger a background batch process to embed pending products from the database.
    """
    try:
        logger.info(f"Triggering batch processing for next {batch_size} pending products")
        background_tasks.add_task(embed_service.process_batch, batch_size)
        return {"message": "Batch processing started in background"}
    except Exception as e:
        logger.error(f"Error starting batch process: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start batch process: {str(e)}"
        )
