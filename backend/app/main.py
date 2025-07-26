# backend/app/main.py
"""
Main FastAPI application for IAP Connect.
Entry point for the backend API server.
UPDATED: Added optional notification system with fallbacks
"""

from fastapi import FastAPI, Depends, APIRouter
from fastapi.responses import JSONResponse
from .config.database import engine, Base
from .middleware.cors import add_cors_middleware
from .routers import auth, users, posts, comments, admin, bookmarks
from .utils.dependencies import get_current_active_user
from .models.user import User

# Try to import notification routes (optional)
try:
    from .routers import notifications
    NOTIFICATIONS_AVAILABLE = True
    print("✅ Notification system loaded successfully")
except ImportError:
    NOTIFICATIONS_AVAILABLE = False
    print("⚠️ Notification system not available - creating fallback endpoints")

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

# Include core routers with API versioning
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(posts.router, prefix="/api/v1")
app.include_router(comments.router, prefix="/api/v1")
app.include_router(bookmarks.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")

# Include notification routes (optional)
if NOTIFICATIONS_AVAILABLE:
    app.include_router(notifications.router, prefix="/api/v1")
else:
    # Create fallback notification endpoints
    fallback_router = APIRouter(prefix="/notifications", tags=["Notifications (Fallback)"])
    
    @fallback_router.get("/unread-count")
    def get_unread_count_fallback(current_user: User = Depends(get_current_active_user)):
        """Fallback endpoint - returns 0 notifications"""
        return {"unread_count": 0, "count": 0}
    
    @fallback_router.get("")
    def get_notifications_fallback(current_user: User = Depends(get_current_active_user)):
        """Fallback endpoint - returns empty notifications"""
        return {
            "notifications": [],
            "total": 0,
            "unread_count": 0,
            "page": 1,
            "has_next": False
        }
    
    @fallback_router.put("/{notification_id}/read")
    def mark_read_fallback(notification_id: int, current_user: User = Depends(get_current_active_user)):
        """Fallback endpoint - silent success"""
        return {"success": True, "message": "Notification marked as read"}
    
    @fallback_router.put("/mark-all-read")
    def mark_all_read_fallback(current_user: User = Depends(get_current_active_user)):
        """Fallback endpoint - silent success"""
        return {"success": True, "message": "All notifications marked as read", "updated_count": 0}
    
    app.include_router(fallback_router, prefix="/api/v1")


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
        "documentation": "/docs",
        "features": {
            "notifications": NOTIFICATIONS_AVAILABLE,
            "posts": True,
            "users": True,
            "comments": True,
            "bookmarks": True,
            "admin": True
        }
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring.
    
    Returns API health status.
    """
    return {
        "status": "healthy",
        "service": "IAP Connect API",
        "features": {
            "notifications": NOTIFICATIONS_AVAILABLE,
            "core_features": ["auth", "posts", "users", "comments", "bookmarks", "admin"]
        }
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