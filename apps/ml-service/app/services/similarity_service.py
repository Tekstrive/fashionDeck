"""
Similarity Service - Distance calculations and nearest neighbor search.
"""

from typing import List, Optional, Tuple
import numpy as np
from loguru import logger

from app.services.db_service import get_db_service, DBService
from app.embeddings.clip_service import get_clip_service, CLIPService
from app.models import ProductSimilarity, SimilaritySearchRequest

class SimilarityService:
    """Service for vector similarity operations and style coherence scoring."""

    def __init__(self):
        self.db_service = get_db_service()
        self._clip_service = None

    async def get_clip_service(self):
        if self._clip_service is None:
            self._clip_service = await get_clip_service()
        return self._clip_service

    async def search_similar(self, request: SimilaritySearchRequest) -> List[ProductSimilarity]:
        """
        Search for products similar to a text query, an image, or a specific embedding.
        
        Uses pgvector's <=> (cosine distance) operator.
        """
        target_embedding = request.embedding

        # 1. Generate embedding if not provided
        if not target_embedding:
            clip = await self.get_clip_service()
            if request.image_url:
                target_embedding = await clip.encode_image(request.image_url)
            elif request.text:
                target_embedding = await clip.encode_text(request.text)
            else:
                raise ValueError("Must provide either text, image_url, or embedding")

        # 2. Build Query
        # We prefer image_embedding for visual similarity, fallback to text_embedding
        emb_str = str(target_embedding)
        
        self.db_service.connect()
        try:
            # Construct filters
            filters = []
            params = [emb_str]
            
            if request.category:
                filters.append("category = %s")
                params.append(request.category)
            
            if request.min_price is not None:
                filters.append("price >= %s")
                params.append(request.min_price)
                
            if request.max_price is not None:
                filters.append("price <= %s")
                params.append(request.max_price)
            
            where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""
            
            # Use cosine similarity (1 - cosine distance)
            query = f"""
                SELECT id, title, price, image_url, (1 - (image_embedding <=> %s::vector)) as similarity
                FROM products 
                {where_clause}
                ORDER BY image_embedding <=> %s::vector ASC
                LIMIT %s
            """
            
            limit = request.limit
            params.extend([emb_str, limit])
            
            self.db_service.cursor.execute(query, tuple(params))
            results = self.db_service.cursor.fetchall()
            
            return [
                ProductSimilarity(
                    id=str(r[0]),
                    title=r[1],
                    price=float(r[2]),
                    image_url=r[3],
                    similarity=float(r[4])
                ) for r in results
            ]
            
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return []

    def calculate_coherence(self, embeddings: List[List[float]]) -> float:
        """
        Calculate style coherence for an outfit based on pairwise cosine similarity.
        
        Coherence = average of all pairwise similarities.
        """
        if len(embeddings) < 2:
            return 1.0
            
        try:
            embs = [np.array(e) for e in embeddings]
            # Normalize just in case
            embs = [e / np.linalg.norm(e) for e in embs]
            
            similarities = []
            for i in range(len(embs)):
                for j in range(i + 1, len(embs)):
                    sim = np.dot(embs[i], embs[j])
                    similarities.append(sim)
            
            avg_sim = float(np.mean(similarities))
            
            # Penalize low coherence
            # CLIP cosine similarity for cohesive fashion items is usually > 0.7
            if avg_sim < 0.6:
                # Apply exponential decay if below threshold
                avg_sim = avg_sim * (avg_sim / 0.6)
                
            return max(0.0, min(1.0, avg_sim))
            
        except Exception as e:
            logger.error(f"Coherence calculation failed: {e}")
            return 0.5


# Global instance
_similarity_service: Optional[SimilarityService] = None

def get_similarity_service() -> SimilarityService:
    """Get or create SimilarityService instance."""
    global _similarity_service
    if _similarity_service is None:
        _similarity_service = SimilarityService()
    return _similarity_service
