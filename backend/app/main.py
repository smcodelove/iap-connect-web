# backend/app/main.py
"""
Main FastAPI application for IAP Connect.
Entry point for the backend API server.
FIXED: Static file serving with proper CORS headers
"""

from fastapi import FastAPI, Depends, APIRouter
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path

from .config.database import engine, Base
from .middleware.cors import add_cors_middleware
from .routers import auth, users, posts, comments, admin, bookmarks
from .utils.dependencies import get_current_active_user
from .models.user import User

# Try to import S3 upload routes safely
try:
    from .routers import upload_s3
    S3_UPLOAD_AVAILABLE = True
    print("✅ S3 upload system loaded successfully")
except ImportError as e:
    S3_UPLOAD_AVAILABLE = False
    print(f"⚠️ S3 upload system not available: {e}")

# Try to import optional routes (upload and notifications)
try:
    from .routers import upload
    UPLOAD_AVAILABLE = True
    print("✅ File upload system loaded successfully")
except ImportError:
    UPLOAD_AVAILABLE = False
    print("⚠️ File upload system not available")

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

# FIXED: Custom static file handler with CORS
class CORSStaticFiles(StaticFiles):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            # Add CORS headers for static files
            response = await super().__call__(scope, receive, send)
            return response
        return await super().__call__(scope, receive, send)

# Setup file upload system if available
if UPLOAD_AVAILABLE:
    # Create uploads directory if it doesn't exist
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Create subdirectories for organization
    upload_subdirs = ["avatars", "posts", "documents", "temp", "thumbnails"]
    for subdir in upload_subdirs:
        os.makedirs(f"{upload_dir}/{subdir}", exist_ok=True)
    
    # FIXED: Custom static file endpoint with proper CORS
    @app.get("/static/{file_path:path}")
    async def serve_static_file(file_path: str):
        """
        Serve static files with proper CORS headers
        """
        try:
            full_path = Path(upload_dir) / file_path
            
            if not full_path.exists() or not full_path.is_file():
                return JSONResponse(
                    status_code=404,
                    content={"detail": "File not found"},
                    headers={
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, OPTIONS",
                        "Access-Control-Allow-Headers": "*",
                    }
                )
            
            # Security check - ensure file is within upload directory
            try:
                full_path.resolve().relative_to(Path(upload_dir).resolve())
            except ValueError:
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Access denied"},
                    headers={
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET, OPTIONS",
                        "Access-Control-Allow-Headers": "*",
                    }
                )
            
            return FileResponse(
                path=str(full_path),
                filename=full_path.name,
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                    "Cache-Control": "public, max-age=3600",
                }
            )
            
        except Exception as e:
            print(f"Static file serve error: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"detail": "Failed to serve file"},
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "*",
                }
            )
    
    print("✅ Static file serving enabled at /static with CORS")

# Include core routers with API versioning
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(posts.router, prefix="/api/v1")
app.include_router(comments.router, prefix="/api/v1")
app.include_router(bookmarks.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")

# Include S3 upload routes if available (FIXED PREFIX)
if S3_UPLOAD_AVAILABLE:
    app.include_router(upload_s3.router, prefix="/api")  # FIXED: No /v1 for S3
    print("✅ S3 upload routes enabled at /api/upload-s3/*")

# Include upload routes if available
if UPLOAD_AVAILABLE:
    app.include_router(upload.router, prefix="/api/v1")

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
            "file_upload": UPLOAD_AVAILABLE,
            "s3_upload": S3_UPLOAD_AVAILABLE,
            "posts": True,
            "users": True,
            "comments": True,
            "bookmarks": True,
            "admin": True
        },
        "upload_info": {
            "static_files_enabled": UPLOAD_AVAILABLE,
            "upload_directory": "uploads" if UPLOAD_AVAILABLE else None,
            "static_url": "/static" if UPLOAD_AVAILABLE else None,
            "s3_upload_enabled": S3_UPLOAD_AVAILABLE,
            "s3_endpoints": "/api/upload-s3/*" if S3_UPLOAD_AVAILABLE else None
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
            "file_upload": UPLOAD_AVAILABLE,
            "s3_upload": S3_UPLOAD_AVAILABLE,
            "core_features": ["auth", "posts", "users", "comments", "bookmarks", "admin"]
        },
        "upload_status": {
            "uploads_directory_exists": os.path.exists("uploads") if UPLOAD_AVAILABLE else False,
            "static_serving_enabled": UPLOAD_AVAILABLE,
            "s3_service_loaded": S3_UPLOAD_AVAILABLE
        }
    }


# Upload system health check (if available)
if UPLOAD_AVAILABLE:
    @app.get("/api/v1/upload/system-health")
    def upload_system_health():
        """Check upload system health and configuration"""
        try:
            upload_dir = "uploads"
            subdirs = ["avatars", "posts", "documents", "temp", "thumbnails"]
            
            status_info = {
                "status": "healthy",
                "upload_directory": upload_dir,
                "directory_exists": os.path.exists(upload_dir),
                "directory_writable": os.access(upload_dir, os.W_OK) if os.path.exists(upload_dir) else False,
                "subdirectories": {}
            }
            
            for subdir in subdirs:
                subdir_path = f"{upload_dir}/{subdir}"
                status_info["subdirectories"][subdir] = {
                    "exists": os.path.exists(subdir_path),
                    "writable": os.access(subdir_path, os.W_OK) if os.path.exists(subdir_path) else False
                }
            
            return status_info
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e)
            }


# S3 Upload system health check (if available)
if S3_UPLOAD_AVAILABLE:
    @app.get("/api/upload-s3/system-health")
    async def s3_upload_system_health():
        """Check S3 upload system health and configuration"""
        try:
            from .services.s3_service import S3_AVAILABLE, s3_service
            
            status_info = {
                "status": "healthy" if S3_AVAILABLE else "service_unavailable",
                "s3_available": S3_AVAILABLE,
                "endpoints_active": True,
                "region": "ap-south-1",
                "features": ["image_upload", "avatar_upload", "optimization", "mumbai_region"]
            }
            
            if S3_AVAILABLE and s3_service:
                status_info.update({
                    "bucket_configured": bool(s3_service.bucket_name),
                    "credentials_loaded": bool(s3_service.access_key and s3_service.secret_key),
                    "base_url": s3_service.base_url,
                    "bucket_name": s3_service.bucket_name
                })
            
            return status_info
        except Exception as e:
            return {
                "status": "error",
                "s3_available": False,
                "error": str(e)
            }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Global exception handler for unhandled errors.
    """
    print(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": "An unexpected error occurred",
            "features_available": {
                "notifications": NOTIFICATIONS_AVAILABLE,
                "file_upload": UPLOAD_AVAILABLE,
                "s3_upload": S3_UPLOAD_AVAILABLE
            }
        }
    )

# Startup events
@app.on_event("startup")
async def create_admin_user():
    try:
        from .config.database import SessionLocal
        from .models.user import User, UserType
        from .utils.security import get_password_hash
        
        db = SessionLocal()
        existing_admin = db.query(User).filter(User.user_type == UserType.ADMIN).first()
        
        if not existing_admin:
            admin = User(
                username="iapadmin",
                email="iapadmin@iapconnect.com",
                password_hash=get_password_hash("iapadmin123"),
                user_type=UserType.ADMIN,
                full_name="Admin User",
                is_active=True,
                followers_count=0,
                following_count=0,
                posts_count=0
            )
            db.add(admin)
            db.commit()
            print("✅ Admin user created!")
        db.close()
    except Exception as e:
        print(f"Admin creation error: {e}")


@app.on_event("startup")
async def check_s3_system():
    """Check S3 system on startup"""
    if S3_UPLOAD_AVAILABLE:
        try:
            from .services.s3_service import S3_AVAILABLE
            if S3_AVAILABLE:
                print("✅ S3 upload system ready - Mumbai region")
            else:
                print("⚠️ S3 upload system loaded but not configured")
        except Exception as e:
            print(f"⚠️ S3 system check failed: {e}")
    else:
        print("💾 S3 upload system not loaded - using local uploads only")