"""
Main FastAPI application for IAP Connect.
Entry point for the backend API server.
"""

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from .config.database import engine, Base
from .middleware.cors import add_cors_middleware
from .routers import auth, users, posts, comments, admin

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI application
app = FastAPI(
    title="IAP Connect API",
    description="Social media platform for medical professionals - connecting doctors and students",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
add_cors_middleware(app)

# Include routers with API versioning
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(posts.router, prefix="/api/v1")
app.include_router(comments.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


@app.get("/")
def root():
    """
    Root endpoint - API health check.
    
    Returns basic API information and status.
    """
    return {
        "message": "Welcome to IAP Connect API",
        "version": "1.0.0",
        "status": "active",
        "documentation": "/docs"
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring.
    
    Returns API health status.
    """
    return {
        "status": "healthy",
        "service": "IAP Connect API"
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for unhandled errors.
    
    Args:
        request: FastAPI request object
        exc: Exception that occurred
        
    Returns:
        JSONResponse: Error response
    """
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": "An unexpected error occurred"
        }
    )