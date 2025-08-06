# backend/app/routers/upload_s3.py
"""
AWS S3 upload routes - Safe integration alongside existing upload system
NEW ROUTES: Does not interfere with existing upload functionality
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from typing import List, Optional
from sqlalchemy.orm import Session

from ..config.database import get_db
from app.utils.auth import get_current_user

# Safe import with fallback
try:
    from app.services.s3_service import s3_service, S3_AVAILABLE
except ImportError:
    s3_service = None
    S3_AVAILABLE = False

router = APIRouter(prefix="/upload-s3", tags=["S3 Image Upload"])

def check_s3_available():
    """Check if S3 service is available"""
    if not S3_AVAILABLE or s3_service is None:
        raise HTTPException(
            status_code=503, 
            detail="S3 upload service not available. Please check AWS configuration."
        )


@router.get("/status")
async def s3_status():
    """Check S3 service status"""
    return {
        "success": True,
        "s3_available": S3_AVAILABLE,
        "message": "S3 service is ready" if S3_AVAILABLE else "S3 service not configured"
    }


@router.post("/image")
async def upload_image_s3(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload single image to S3 (Mumbai region)
    NEW ENDPOINT: /api/upload-s3/image
    """
    check_s3_available()
    
    try:
        result = await s3_service.upload_image(
            file=file,
            folder="images",
            optimize=True,
            max_size_mb=10
        )
        
        return {
            "success": True,
            "message": "Image uploaded successfully to S3",
            "data": result
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")


@router.post("/images")
async def upload_multiple_images_s3(
    files: List[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload multiple images to S3
    NEW ENDPOINT: /api/upload-s3/images
    """
    check_s3_available()
    
    try:
        result = await s3_service.upload_multiple_images(
            files=files,
            folder="images",
            max_files=5
        )
        
        return {
            "success": True,
            "message": f"Uploaded {result['successful_uploads']} of {result['total_files']} images to S3",
            "data": result
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 multiple upload failed: {str(e)}")


@router.post("/avatar")
async def upload_avatar_s3(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload user avatar to S3
    NEW ENDPOINT: /api/upload-s3/avatar
    """
    check_s3_available()
    
    try:
        result = await s3_service.upload_image(
            file=file,
            folder="avatars",
            optimize=True,
            max_size_mb=2,
            max_width=400,
            max_height=400
        )
        
        # Here you can update user's avatar URL in database if needed
        # user = db.query(User).filter(User.id == current_user["user_id"]).first()
        # user.avatar_url = result['url']
        # db.commit()
        
        return {
            "success": True,
            "message": "Avatar uploaded successfully to S3",
            "data": result
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 avatar upload failed: {str(e)}")


@router.post("/post-images")
async def upload_post_images_s3(
    files: List[UploadFile] = File(...),
    post_id: Optional[int] = Form(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload images for a post to S3
    NEW ENDPOINT: /api/upload-s3/post-images
    """
    check_s3_available()
    
    try:
        result = await s3_service.upload_multiple_images(
            files=files,
            folder="posts",
            max_files=5
        )
        
        # If post_id provided, you can associate images with post here
        if post_id and result['uploaded_files']:
            # Add your post-image association logic here
            pass
        
        return {
            "success": True,
            "message": f"Uploaded {result['successful_uploads']} post images to S3",
            "data": result
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 post images upload failed: {str(e)}")


@router.delete("/file/{s3_key:path}")
async def delete_image_s3(
    s3_key: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete image from S3"""
    check_s3_available()
    
    try:
        # Add permission check here if needed
        success = s3_service.delete_file(s3_key)
        
        if success:
            return {
                "success": True,
                "message": "Image deleted successfully from S3"
            }
        else:
            raise HTTPException(status_code=404, detail="Image not found or delete failed")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 delete failed: {str(e)}")


@router.get("/file-info/{s3_key:path}")
async def get_image_info_s3(
    s3_key: str,
    current_user: dict = Depends(get_current_user)
):
    """Get image information from S3"""
    check_s3_available()
    
    try:
        info = s3_service.get_file_info(s3_key)
        return {
            "success": True,
            "data": info
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get S3 image info: {str(e)}")


@router.get("/config")
async def get_s3_upload_config():
    """Get S3 upload configuration for frontend"""
    return {
        "success": True,
        "data": {
            "max_file_size_mb": 10,
            "max_avatar_size_mb": 2,
            "allowed_types": ["image/jpeg", "image/png", "image/webp", "image/gif"],
            "max_files_per_upload": 5,
            "storage_provider": "aws_s3",
            "region": "ap-south-1",
            "supported_formats": ["JPG", "PNG", "WebP", "GIF"],
            "s3_available": S3_AVAILABLE,
            "features": {
                "optimization": True,
                "auto_resize": True,
                "mumbai_region": True,
                "fast_upload": True
            }
        }
    }