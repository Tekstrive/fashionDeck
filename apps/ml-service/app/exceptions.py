"""
Global Exception Handler for FastAPI ML Service

Catches all unhandled exceptions and returns consistent error responses.
Never exposes internal error details in production.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import traceback
from datetime import datetime

logger = logging.getLogger(__name__)


async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "statusCode": exc.status_code,
            "error": "HTTPException",
            "message": exc.detail,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path),
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle validation errors"""
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "statusCode": 422,
            "error": "ValidationError",
            "message": "Invalid request data",
            "details": exc.errors(),
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path),
        },
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle all other exceptions"""
    # Log full error for debugging
    logger.error(
        f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}",
        exc_info=True,
    )
    
    # Don't expose error details in production
    import os
    is_production = os.getenv("NODE_ENV") == "production"
    
    error_message = "An unexpected error occurred" if is_production else str(exc)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "statusCode": 500,
            "error": "InternalServerError",
            "message": error_message,
            "timestamp": datetime.utcnow().isoformat(),
            "path": str(request.url.path),
        },
    )
