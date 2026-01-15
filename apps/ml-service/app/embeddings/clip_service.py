"""
CLIP Service - Image and text embedding generation using OpenCLIP.
"""

import torch
import open_clip
from PIL import Image
import httpx
from io import BytesIO
from typing import Optional, List, Tuple
import numpy as np
from loguru import logger
import time
from pathlib import Path

from app.config import get_settings

settings = get_settings()


class CLIPService:
    """Service for generating CLIP embeddings for images and text."""
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.preprocess = None
        self.tokenizer = None
        self.model_name = settings.clip_model_name
        self.pretrained = settings.clip_pretrained
        
    def load_model(self):
        """Load CLIP model and weights."""
        try:
            logger.info(f"Loading CLIP model: {self.model_name} (Pretrained: {self.pretrained}) on {self.device}")
            start_time = time.time()
            
            # Create models directory if it doesn't exist
            models_dir = Path(__file__).parent.parent / "models_cache"
            models_dir.mkdir(exist_ok=True)
            
            # Set cache dir for torch/open_clip
            import os
            os.environ['TORCH_HOME'] = str(models_dir)
            
            self.model, _, self.preprocess = open_clip.create_model_and_transforms(
                self.model_name, 
                pretrained=self.pretrained,
                device=self.device
            )
            self.tokenizer = open_clip.get_tokenizer(self.model_name)
            self.model.eval()
            
            load_time = time.time() - start_time
            logger.info(f"CLIP model loaded successfully in {load_time:.2f}s")
            
        except Exception as e:
            logger.error(f"Failed to load CLIP model: {e}")
            raise RuntimeError(f"CLIP model initialization failed: {str(e)}")

    @torch.no_grad()
    async def encode_text(self, text: str) -> List[float]:
        """Encode text into a 512-dim vector."""
        if not self.model:
            self.load_model()
            
        try:
            text_tokens = self.tokenizer([text]).to(self.device)
            text_features = self.model.encode_text(text_tokens)
            text_features /= text_features.norm(dim=-1, keepdim=True)
            
            return text_features.cpu().numpy()[0].tolist()
        except Exception as e:
            logger.error(f"Error encoding text: {e}")
            raise

    @torch.no_grad()
    async def encode_image(self, image_url: str) -> List[float]:
        """Download and encode image into a 512-dim vector."""
        if not self.model:
            self.load_model()
            
        try:
            # Download image
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(image_url)
                response.raise_for_status()
                image_data = BytesIO(response.content)
            
            image = Image.open(image_data).convert("RGB")
            image_input = self.preprocess(image).unsqueeze(0).to(self.device)
            
            image_features = self.model.encode_image(image_input)
            image_features /= image_features.norm(dim=-1, keepdim=True)
            
            return image_features.cpu().numpy()[0].tolist()
        except Exception as e:
            logger.error(f"Error encoding image from {image_url}: {e}")
            raise

    @torch.no_grad()
    async def encode_batch(self, texts: Optional[List[str]] = None, image_urls: Optional[List[str]] = None) -> Tuple[Optional[List[List[float]]], Optional[List[List[float]]]]:
        """Encode multiple texts or images in a batch."""
        if not self.model:
            self.load_model()
            
        text_embeddings = None
        image_embeddings = None
        
        if texts:
            text_tokens = self.tokenizer(texts).to(self.device)
            text_features = self.model.encode_text(text_tokens)
            text_features /= text_features.norm(dim=-1, keepdim=True)
            text_embeddings = text_features.cpu().numpy().tolist()
            
        if image_urls:
            # Note: This is simplified batching. In production, 
            # we'd pre-download images in parallel before processing.
            images = []
            async with httpx.AsyncClient(timeout=20.0) as client:
                for url in image_urls:
                    try:
                        resp = await client.get(url)
                        resp.raise_for_status()
                        img = Image.open(BytesIO(resp.content)).convert("RGB")
                        images.append(self.preprocess(img))
                    except Exception as e:
                        logger.warning(f"Failed to process image {url}: {e}")
                        # Append a placeholder/zero tensor to maintain index alignment if needed, 
                        # but here we'll just skip and log.
            
            if images:
                image_input = torch.stack(images).to(self.device)
                image_features = self.model.encode_image(image_input)
                image_features /= image_features.norm(dim=-1, keepdim=True)
                image_embeddings = image_features.cpu().numpy().tolist()
                
        return text_embeddings, image_embeddings


# Global instance
_clip_service: Optional[CLIPService] = None


async def get_clip_service() -> CLIPService:
    """Get or create CLIPService instance."""
    global _clip_service
    if _clip_service is None:
        _clip_service = CLIPService()
        # Note: We don't load_model automatically here to avoid 
        # blocking service start if not needed immediately.
    return _clip_service
