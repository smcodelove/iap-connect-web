"""
CORS middleware configuration for IAP Connect application.
Handles cross-origin resource sharing for web and mobile clients.
"""

from fastapi.middleware.cors import CORSMiddleware
from ..config.settings import settings


def add_cors_middleware(app):
    """
    Add CORS middleware to FastAPI application.
    
    Args:
        app: FastAPI application instance
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )