"""
Pydantic models for API requests and responses.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal


class ParsePromptRequest(BaseModel):
    """Request model for prompt parsing."""
    prompt: str = Field(..., min_length=10, max_length=200, description="User's natural language query")

    model_config = {
        "json_schema_extra": {
            "example": {
                "prompt": "Korean minimal outfit for a coffee date under 2000"
            }
        }
    }


class ParsedPrompt(BaseModel):
    """Structured output from prompt parsing."""
    aesthetic: str = Field(..., description="Fashion aesthetic or style (e.g., 'korean minimal', 'streetwear')")
    budget: Optional[int] = Field(None, description="Budget in INR", ge=0)
    size: Optional[Literal["XS", "S", "M", "L", "XL", "XXL"]] = Field(None, description="Clothing size")
    gender: Optional[Literal["male", "female", "unisex"]] = Field(None, description="Gender preference")
    occasion: Optional[str] = Field(None, description="Occasion (e.g., 'party', 'office', 'casual')")
    categories: List[Literal["top", "bottom", "shoes", "accessories"]] = Field(
        default=["top", "bottom"],
        description="Required clothing categories"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "aesthetic": "Korean Minimal",
                "budget": 2000,
                "size": "M",
                "gender": "male",
                "occasion": "coffee date",
                "categories": ["top", "bottom", "shoes"]
            }
        }
    }


class ParsePromptResponse(BaseModel):
    """Response model for prompt parsing."""
    parsed: ParsedPrompt
    processing_time: float = Field(..., description="Processing time in milliseconds")
    cached: bool = Field(default=False, description="Whether result was from cache")


class PlanOutfitRequest(BaseModel):
    """Request model for outfit planning."""
    parsed_prompt: ParsedPrompt = Field(..., description="Parsed user query")


class PlanOutfitResponse(BaseModel):
    """Response model for outfit planning."""
    items: List[str] = Field(..., description="List of specific item descriptions", min_length=2, max_length=4)
    reasoning: str = Field(..., description="Explanation of the outfit plan")
    processing_time: float = Field(..., description="Processing time in milliseconds")
    cached: bool = Field(default=False, description="Whether result was from cache")


class OutfitItem(BaseModel):
    """Product item in an outfit."""
    title: str
    category: str
    price: float


class OutfitCandidate(BaseModel):
    """A complete outfit candidate to be scored."""
    items: List[OutfitItem]


class ScoreOutfitsRequest(BaseModel):
    """Request model for batch outfit scoring."""
    aesthetic: str = Field(..., description="The aesthetic these outfits should match")
    outfits: List[OutfitCandidate] = Field(..., max_length=10, description="List of outfits to score (max 10)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "aesthetic": "streetwear",
                "outfits": [
                    {
                        "items": [
                            {"title": "Oversized Hoodie", "category": "top", "price": 1499},
                            {"title": "Baggy Cargo Pants", "category": "bottom", "price": 1999}
                        ]
                    }
                ]
            }
        }
    }


class ScoreOutfitsResponse(BaseModel):
    """Response model for batch outfit scoring."""
    scores: List[float] = Field(..., description="Scores for each outfit (1.0 to 10.0)")
    processing_time: float = Field(..., description="Processing time in milliseconds")


class EmbeddingRequest(BaseModel):
    """Request model for generating embeddings."""
    text: Optional[str] = Field(None, description="Text to encode")
    image_url: Optional[str] = Field(None, description="Image URL to encode")
    product_id: Optional[str] = Field(None, description="Optional product UUID to update in DB")

    model_config = {
        "json_schema_extra": {
            "example": {
                "text": "Oversized White T-shirt",
                "image_url": "https://example.com/item.jpg"
            }
        }
    }


class EmbeddingResponse(BaseModel):
    """Response model for generating embeddings."""
    text_embedding: Optional[List[float]] = Field(None, description="512-dim text vector")
    image_embedding: Optional[List[float]] = Field(None, description="512-dim image vector")
    processing_time: float = Field(..., description="Processing time in milliseconds")


class ProductSimilarity(BaseModel):
    """Product result from similarity search."""
    id: str
    title: str
    price: float
    image_url: str
    similarity: float


class SimilaritySearchRequest(BaseModel):
    """Request model for finding similar products."""
    text: Optional[str] = None
    image_url: Optional[str] = None
    embedding: Optional[List[float]] = None
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    limit: int = Field(10, ge=1, le=50)


class OutfitCoherenceRequest(BaseModel):
    """Request model for calculating embedding-based outfit coherence."""
    embeddings: List[List[float]] = Field(..., description="List of 512-dim item embeddings")


class OutfitCoherenceResponse(BaseModel):
    """Response model for outfit coherence score."""
    score: float = Field(..., description="Coherence score (0.0 to 1.0)")
