"""
DB Service - Interface for PostgreSQL operations with pgvector.
"""

import psycopg2
from psycopg2.extras import execute_values
from loguru import logger
from typing import List, Optional, Tuple
import json

from app.config import get_settings

settings = get_settings()


class DBService:
    """Service for interacting with PostgreSQL database."""

    def __init__(self):
        self.conn = None
        self.cursor = None

    def connect(self):
        """Establish connection to PostgreSQL."""
        try:
            if self.conn is None or self.conn.closed:
                self.conn = psycopg2.connect(settings.database_url)
                self.conn.autocommit = True
                self.cursor = self.conn.cursor()
                logger.info("Connected to PostgreSQL")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise

    def close(self):
        """Close database connection."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed")

    def update_product_embeddings(
        self, 
        product_id: str, 
        image_embedding: Optional[List[float]], 
        text_embedding: Optional[List[float]]
    ):
        """Update a product's embeddings in the database."""
        self.connect()
        try:
            # We use string representation for vectors as pgvector expects
            # e.g., '[0.1, 0.2, ...]'
            updates = []
            params = []

            if image_embedding:
                updates.append("image_embedding = %s")
                params.append(str(image_embedding))
            
            if text_embedding:
                updates.append("text_embedding = %s")
                params.append(str(text_embedding))

            if not updates:
                return

            params.append(product_id)
            query = f"UPDATE products SET {', '.join(updates)}, updated_at = NOW() WHERE id = %s"
            
            self.cursor.execute(query, tuple(params))
            logger.debug(f"Updated embeddings for product {product_id}")
            
        except Exception as e:
            logger.error(f"Error updating product {product_id}: {e}")
            raise

    def get_pending_products(self, limit: int = 100) -> List[Tuple[str, str, str]]:
        """Fetch products that need embedding generation (missing either image or text embedding)."""
        self.connect()
        try:
            query = """
                SELECT id, title, image_url 
                FROM products 
                WHERE image_embedding IS NULL OR text_embedding IS NULL
                LIMIT %s
            """
            self.cursor.execute(query, (limit,))
            return self.cursor.fetchall()
        except Exception as e:
            logger.error(f"Error fetching pending products: {e}")
            return []

    def batch_update_embeddings(self, data: List[Tuple[List[float], List[float], str]]):
        """Batch update product embeddings for efficiency."""
        self.connect()
        try:
            # data item: (image_embedding, text_embedding, product_id)
            # Use execute_values for high performance updates if possible, 
            # or a simple loop for standard updates.
            query = """
                UPDATE products 
                SET image_embedding = data.img_emb::vector, 
                    text_embedding = data.txt_emb::vector,
                    updated_at = NOW()
                FROM (VALUES %s) AS data(img_emb, txt_emb, id)
                WHERE products.id = data.id::uuid
            """
            
            # Prepare data: convert lists to vector strings
            formatted_data = [
                (str(img), str(txt), pid) 
                for img, txt, pid in data
            ]
            
            execute_values(self.cursor, query, formatted_data)
            logger.info(f"Batch updated {len(data)} product embeddings")
            
        except Exception as e:
            logger.error(f"Error in batch update: {e}")
            raise


# Global instance
_db_service: Optional[DBService] = None


def get_db_service() -> DBService:
    """Get or create DBService instance."""
    global _db_service
    if _db_service is None:
        _db_service = DBService()
    return _db_service
