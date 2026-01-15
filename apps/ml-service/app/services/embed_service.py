"""
Embed Service - Orchestrates CLIP embedding generation and DB persistence.
"""

from loguru import logger
from typing import List, Optional, Tuple
import asyncio

from app.embeddings.clip_service import get_clip_service, CLIPService
from app.services.db_service import get_db_service, DBService

class EmbedService:
    """Orchestrator for product embedding pipeline."""

    def __init__(self):
        self.clip_service: Optional[CLIPService] = None
        self.db_service: Optional[DBService] = None

    async def initialize(self):
        """Initialize dependent services."""
        self.clip_service = await get_clip_service()
        self.db_service = get_db_service()

    async def process_product(self, product_id: str, title: str, image_url: str):
        """Process a single product: generate embeddings and save to DB."""
        if not self.clip_service:
            await self.initialize()

        try:
            logger.info(f"Processing product {product_id}: {title}")
            
            # 1. Generate embeddings
            text_embedding = await self.clip_service.encode_text(title)
            image_embedding = await self.clip_service.encode_image(image_url)
            
            # 2. Save to DB
            self.db_service.update_product_embeddings(
                product_id, 
                image_embedding, 
                text_embedding
            )
            
            logger.info(f"Successfully processed product {product_id}")
            
        except Exception as e:
            logger.error(f"Failed to process product {product_id}: {e}")
            raise

    async def process_batch(self, batch_size: int = 32):
        """Background worker task: process pending products in batches."""
        if not self.clip_service:
            await self.initialize()
            
        try:
            # 1. Get pending products
            pending = self.db_service.get_pending_products(limit=batch_size)
            if not pending:
                logger.debug("No pending products to process")
                return 0

            logger.info(f"Processing batch of {len(pending)} products")
            
            # 2. Separate data for batch processing
            product_ids = [p[0] for p in pending]
            titles = [p[1] for p in pending]
            image_urls = [p[2] for p in pending]
            
            # 3. Generate embeddings in batch
            # Note: encode_batch in CLIPService handles the heavy lifting
            text_embs, image_embs = await self.clip_service.encode_batch(
                texts=titles, 
                image_urls=image_urls
            )
            
            # 4. Filter out failures and prepare for DB update
            update_data = []
            for i, pid in enumerate(product_ids):
                # Ensure we have both embeddings for the update
                # (or handle partial updates if desired)
                if text_embs and image_embs and i < len(text_embs) and i < len(image_embs):
                    update_data.append((image_embs[i], text_embs[i], pid))
            
            # 5. Batch update DB
            if update_data:
                self.db_service.batch_update_embeddings(update_data)
            
            return len(update_data)

        except Exception as e:
            logger.error(f"Error in batch processing: {e}")
            raise

# Global instance
_embed_service: Optional[EmbedService] = None

async def get_embed_service() -> EmbedService:
    """Get or create EmbedService instance."""
    global _embed_service
    if _embed_service is None:
        _embed_service = EmbedService()
        await _embed_service.initialize()
    return _embed_service
