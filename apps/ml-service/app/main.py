"""
FashionDeck ML Service - Main Application

FastAPI microservice for AI/ML operations:
- Prompt parsing with GPT-4o-mini
- Outfit coherence scoring with Claude 3 Haiku
- CLIP embeddings for visual similarity
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from loguru import logger
import sys

from app.config import get_settings
from app.routes import parse, plan, score, embed, similarity, aesthetic
from app.embeddings.clip_service import get_clip_service

# Configure logger
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level="INFO"
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"OpenAI Model: {settings.openai_model}")
    logger.info(f"CLIP Model: {settings.clip_model_name}")
    
    # Initialize ML models here
    try:
        clip_service = await get_clip_service()
        clip_service.load_model()
    except Exception as e:
        logger.error(f"Failed to initialize models during startup: {e}")
        # We don't exit here to allow health checks to still work
    
    yield
    
    # Shutdown
    logger.info("Shutting down ML service")
    # Cleanup resources
    try:
        from app.services.parse_service import get_parse_service
        from app.services.plan_service import get_plan_service
        from app.services.db_service import get_db_service
        
        parse_service = await get_parse_service()
        await parse_service.close()
        
        plan_service = await get_plan_service()
        await plan_service.close()

        db_service = get_db_service()
        db_service.close()
    except Exception as e:
        logger.error(f"Error during shutdown cleanup: {e}")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI/ML microservice for FashionDeck outfit recommendations",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(parse.router)
app.include_router(plan.router)
app.include_router(score.router)
app.include_router(embed.router)
app.include_router(similarity.router)
app.include_router(aesthetic.router)


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    Returns service status and configuration.
    """
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "models": {
            "openai": settings.openai_model,
            "clip": settings.clip_model_name,
        },
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "parse_prompt": "POST /parse-prompt",
            "plan_outfit": "POST /plan-outfit",
            "score_outfits": "POST /score-outfits",
            "generate_embedding": "POST /embed",
            "batch_embed": "POST /embed/batch-process",
            "similarity_search": "POST /similarity/search",
            "outfit_coherence": "POST /similarity/coherence",
            "aesthetic_precompute": "POST /aesthetics/precompute",
            "aesthetic_list": "GET /aesthetics/list",
            "aesthetic_identify": "GET /aesthetics/identify?prompt=...",
        },
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle all unhandled exceptions."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc) if settings.debug else "An error occurred processing your request",
        },
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info",
    )
