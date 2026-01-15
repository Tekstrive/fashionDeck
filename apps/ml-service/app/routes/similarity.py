"""
Similarity routes - Vector search and coherence scoring.
"""

from fastapi import APIRouter, HTTPException, Depends
from loguru import logger
import time
from typing import List

from app.models import (
    SimilaritySearchRequest, 
    ProductSimilarity, 
    OutfitCoherenceRequest, 
    OutfitCoherenceResponse
)
from app.services.similarity_service import get_similarity_service, SimilarityService

router = APIRouter(prefix="/similarity", tags=["similarity"])


@router.post("/search", response_model=List[ProductSimilarity])
async def search_similar_products(
    request: SimilaritySearchRequest,
    similarity_service: SimilarityService = Depends(get_similarity_service)
):
    """
    Search for similar products using vector similarity.
    Supports filtering by category and price.
    """
    start_time = time.time()
    try:
        results = await similarity_service.search_similar(request)
        processing_time = (time.time() - start_time) * 1000
        logger.info(f"Similarity search found {len(results)} results in {processing_time:.2f}ms")
        return results
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail="Search failed")


@router.post("/coherence", response_model=OutfitCoherenceResponse)
async def calculate_coherence(
    request: OutfitCoherenceRequest,
    similarity_service: SimilarityService = Depends(get_similarity_service)
):
    """
    Calculate the stylistic coherence of an outfit based on item embeddings.
    Returns a score between 0.0 and 1.0.
    """
    try:
        score = similarity_service.calculate_coherence(request.embeddings)
        return OutfitCoherenceResponse(score=score)
    except Exception as e:
        logger.error(f"Coherence calculation error: {e}")
        raise HTTPException(status_code=500, detail="Coherence calculation failed")
