"""
Configuration management for ML service.
Loads environment variables and provides typed settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = "FashionDeck ML Service"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # OpenAI (GPT-4o-mini for prompt parsing)
    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    openai_max_tokens: int = 500
    openai_temperature: float = 0.7
    
    # CLIP Model
    clip_model_name: str = "ViT-B/32"
    clip_pretrained: str = "openai"
    
    # Database
    database_url: str
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    redis_ttl: int = 3600  # 1 hour cache
    
    # Timeouts
    llm_timeout: int = 10  # seconds
    embedding_timeout: int = 5  # seconds
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
