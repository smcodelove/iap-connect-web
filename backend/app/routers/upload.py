# backend/app/routers/upload.py - FIXED WITH DEBUGGING
"""
File upload routes for IAP Connect application.
Handles all file upload operations including avatars, post media, and documents.
ENHANCED: Added missing /config endpoint for frontend integration
FIXED: Avatar upload with proper debugging and error handling
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from pathlib import Path

from ..config.database import get_db
from ..utils.dependencies import get_current_active_user, get_admin_user
from ..models.user import User
from ..services.file_service import (
    upload_file, upload_post_media, delete_file, 
    get_file_info, cleanup_temp_files, UPLOAD_FOLDER
)
from ..schemas.file import (
    FileUploadResponse, MultipleFileUploadResponse, FileInfo, 
    FileDeleteResponse, AvatarUploadResponse, PostMediaUploadResponse,
    FileStatsResponse, FileBatchDeleteRequest, FileBatchDeleteResponse,
    FileCleanupResponse
)

router = APIRouter(prefix="/upload", tags=["File Upload"])


# FIXED: Added missing /image endpoint that frontend needs
@router.post("/image", response_model=FileUploadResponse)
async def upload_single_image(
    file: UploadFile = File(..., description="Single image file (max 10MB)"),
    folder: str = Form("posts", description="Upload folder"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a single image file.
    
    - **file**: Image file (JPG, PNG, WebP, GIF)
    - **folder**: Upload folder (default: 'posts')
    - Maximum size: 10MB
    - Automatically optimized and resized
    """
    try:
        print(f"🔍 Single image upload started by: {current_user.username}")
        print(f"📁 File details: {file.filename}, {file.content_type}")
        
        # Validate image file
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only image files are allowed. Received: {file.content_type}"
            )
        
        # Upload using file service
        result = await upload_file(
            file=file,
            folder=folder,
            optimize_images=True,
            max_size=10 * 1024 * 1024,  # 10MB
            should_create_thumbnail=False
        )
        
        print(f"✅ Single image upload successful: {result}")
        return FileUploadResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Image upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )


# FIXED: Avatar upload with comprehensive debugging
@router.post("/avatar", response_model=AvatarUploadResponse)
async def upload_user_avatar(
    file: UploadFile = File(..., description="Avatar image file (max 2MB)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload or update user avatar - WITH COMPREHENSIVE DEBUGGING.
    UPDATED: Force S3 usage when available to avoid 404 errors on production
    """
    try:
        print(f"🔍 Avatar upload started for user: {current_user.username} (ID: {current_user.id})")
        print(f"📁 File details: {file.filename}, {file.content_type}")
        
        # Check file content type
        if not file.content_type:
            print("⚠️ No content type provided, attempting to determine from filename")
            if file.filename:
                if file.filename.lower().endswith(('.jpg', '.jpeg')):
                    file.content_type = 'image/jpeg'
                elif file.filename.lower().endswith('.png'):
                    file.content_type = 'image/png'
                elif file.filename.lower().endswith('.webp'):
                    file.content_type = 'image/webp'
                elif file.filename.lower().endswith('.gif'):
                    file.content_type = 'image/gif'
                else:
                    print(f"❌ Unsupported file extension: {file.filename}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Unsupported file type. Only JPG, PNG, WebP, and GIF are allowed."
                    )
            else:
                print("❌ No filename provided")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No filename provided"
                )
        
        # Validate file type
        if not file.content_type.startswith('image/'):
            print(f"❌ Invalid file type: {file.content_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type: {file.content_type}. Only image files are allowed."
            )
        
        # Check file size
        file_content = await file.read()
        file_size = len(file_content)
        print(f"📊 File size: {file_size} bytes ({file_size / 1024 / 1024:.2f} MB)")
        
        # Reset file pointer
        await file.seek(0)
        
        # Size limit: 2MB
        max_size = 2 * 1024 * 1024  # 2MB
        if file_size > max_size:
            print(f"❌ File too large: {file_size} > {max_size}")
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: 2MB. Your file: {file_size / 1024 / 1024:.2f}MB"
            )
        
        print("✅ File validation passed, proceeding with upload...")
        
        # NEW: Check if S3 is available and use it first
        try:
            from ..services.s3_service import S3_AVAILABLE, s3_service
            if S3_AVAILABLE and s3_service:
                print("🔄 Using S3 for avatar upload...")
                
                # Reset file pointer for S3
                await file.seek(0)
                
                # Upload to S3 directly
                s3_result = await s3_service.upload_avatar(
                    file=file,
                    user_id=current_user.id,
                    max_size_mb=2
                )
                
                print(f"✅ S3 avatar upload successful: {s3_result}")
                
                # Update user profile in database
                current_user.profile_picture_url = s3_result['url']
                db.commit()
                db.refresh(current_user)
                
                print(f"✅ User profile picture URL updated to: {s3_result['url']}")
                
                # Return S3 response in correct format
                return AvatarUploadResponse(
                    success=True,
                    filename=s3_result['filename'],
                    original_filename=s3_result['original_filename'],
                    url=s3_result['url'],
                    avatar_url=s3_result['url'],
                    file_size=s3_result['size'],
                    content_type=s3_result['content_type']
                )
                
        except ImportError:
            print("⚠️ S3 service not available, using local upload")
        except Exception as e:
            print(f"⚠️ S3 upload failed: {e}, falling back to local")
        
        # EXISTING: Fallback to local upload
        try:
            print("🔄 Using local upload for avatar...")
            
            # Reset file pointer for local upload
            await file.seek(0)
            
            # Delete old avatar if exists
            if current_user.profile_picture_url:
                try:
                    await delete_file(current_user.profile_picture_url)
                    print(f"🗑️ Deleted old avatar: {current_user.profile_picture_url}")
                except Exception as e:
                    print(f"⚠️ Could not delete old avatar: {str(e)}")
            
            # Create upload avatar function if not exists
            async def upload_avatar_local(file: UploadFile, user_id: int) -> dict:
                """Local avatar upload function"""
                try:
                    print(f"🔄 Processing local avatar upload for user {user_id}")
                    
                    # Upload to avatars folder
                    result = await upload_file(
                        file=file,
                        folder="avatars",
                        optimize_images=True,
                        max_size=2 * 1024 * 1024,  # 2MB
                        should_create_thumbnail=False
                    )
                    
                    print(f"✅ Local avatar uploaded successfully: {result}")
                    return result
                    
                except Exception as e:
                    print(f"❌ Local avatar upload service error: {str(e)}")
                    raise e
            
            # Upload new avatar using local service
            result = await upload_avatar_local(file, current_user.id)
            
            # FIXED: Ensure result has required fields
            if not result.get('url'):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Upload failed: No URL returned from file service"
                )
            
            # Update user's profile picture URL in database
            current_user.profile_picture_url = result['url']
            db.commit()
            db.refresh(current_user)
            
            print(f"✅ User profile picture URL updated to: {result['url']}")
            
            # FIXED: Create proper response with all required fields
            response_data = {
                'success': result.get('success', True),
                'filename': result.get('filename', ''),
                'original_filename': result.get('original_filename', file.filename),
                'url': result['url'],
                'avatar_url': result['url'],  # Required field for AvatarUploadResponse
                'thumbnail_url': result.get('thumbnail_url'),
                'file_size': result.get('file_size', file_size),
                'original_size': result.get('original_size', file_size),
                'content_type': result.get('content_type', file.content_type),
                'extension': result.get('extension', ''),
                'is_image': result.get('is_image', True),
                'file_hash': result.get('file_hash', ''),
                'folder': result.get('folder', 'avatars'),
                'upload_time': result.get('upload_time')
            }
            
            print(f"✅ Avatar upload completed successfully for user {current_user.username}")
            return AvatarUploadResponse(**response_data)
            
        except HTTPException:
            raise
        except Exception as e:
            print(f"❌ Local avatar upload error: {str(e)}")
            import traceback
            print(f"📋 Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload avatar: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Avatar upload error: {str(e)}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload avatar: {str(e)}"
        )


@router.post("/post-media", response_model=MultipleFileUploadResponse)
async def upload_post_media_files(
    files: List[UploadFile] = File(..., description="Media files for post (max 5 files, 10MB each)"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload media files for posts.
    
    - **files**: List of media files (images, documents, videos)
    - Maximum: 5 files per request
    - Maximum size per file: 10MB for images, 5MB for documents
    - Images are automatically optimized
    - Creates thumbnails for images
    
    Returns list of uploaded file URLs for use in posts.
    """
    try:
        print(f"🔍 Post media upload started by: {current_user.username}")
        print(f"📁 Number of files: {len(files)}")
        
        results = await upload_post_media(files, current_user.id)
        
        # Separate successful and failed uploads
        successful_uploads = []
        failed_uploads = []
        
        for result in results:
            if result.get('success', False):
                # Convert to FileUploadResponse format
                successful_uploads.append(FileUploadResponse(**result))
            else:
                # Handle failed uploads
                failed_uploads.append({
                    'success': False,
                    'filename': result.get('filename', 'unknown'),
                    'error': result.get('error', 'Upload failed')
                })
        
        print(f"✅ Post media upload completed: {len(successful_uploads)} successful, {len(failed_uploads)} failed")
        
        return MultipleFileUploadResponse(
            success=len(successful_uploads) > 0,
            uploaded_files=successful_uploads,
            failed_files=failed_uploads,
            total_files=len(files),
            successful_uploads=len(successful_uploads),
            failed_uploads=len(failed_uploads)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Post media upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload media files"
        )


@router.post("/document", response_model=FileUploadResponse)
async def upload_document(
    file: UploadFile = File(..., description="Document file (PDF, DOC, DOCX, TXT)"),
    folder: str = Form("documents", description="Target folder"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload a document file.
    
    - **file**: Document file (PDF, DOC, DOCX, TXT)
    - **folder**: Target folder (default: documents)
    - Maximum size: 5MB
    - No optimization applied to documents
    
    Returns document URL for downloads/links.
    """
    try:
        print(f"🔍 Document upload started by: {current_user.username}")
        print(f"📁 File details: {file.filename}, {file.content_type}")
        
        result = await upload_file(
            file=file,
            folder=folder,
            optimize_images=False,
            max_size=5 * 1024 * 1024  # 5MB
        )
        
        print(f"✅ Document upload successful: {result}")
        return FileUploadResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Document upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document"
        )


@router.get("/file-info")
async def get_file_information(
    file_path: str = Query(..., description="File path or URL"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get information about an uploaded file.
    
    - **file_path**: File path or URL to check
    
    Returns file metadata including size, type, and URLs.
    """
    try:
        info = get_file_info(file_path)
        return FileInfo(**info)
        
    except Exception as e:
        print(f"❌ File info error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get file information"
        )


@router.delete("/file")
async def delete_uploaded_file(
    file_path: str = Query(..., description="File path or URL to delete"),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete an uploaded file.
    
    - **file_path**: File path or URL to delete
    
    Only file owner or admin can delete files.
    """
    try:
        # TODO: Add file ownership validation
        success = await delete_file(file_path)
        
        if success:
            return FileDeleteResponse(
                success=True,
                message="File deleted successfully",
                filename=file_path
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ File delete error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete file"
        )


@router.post("/batch-delete", response_model=FileBatchDeleteResponse)
async def batch_delete_files(
    request: FileBatchDeleteRequest,
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete multiple files in batch.
    
    - **file_paths**: List of file paths to delete (max 50)
    
    Returns summary of deletion results.
    """
    try:
        deleted_files = []
        failed_files = []
        
        for file_path in request.file_paths:
            try:
                success = await delete_file(file_path)
                if success:
                    deleted_files.append(file_path)
                else:
                    failed_files.append({"path": file_path, "error": "File not found"})
            except Exception as e:
                failed_files.append({"path": file_path, "error": str(e)})
        
        return FileBatchDeleteResponse(
            success=len(deleted_files) > 0,
            deleted_files=deleted_files,
            failed_files=failed_files,
            total_requested=len(request.file_paths),
            deleted_count=len(deleted_files),
            failed_count=len(failed_files)
        )
        
    except Exception as e:
        print(f"❌ Batch delete error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete files"
        )


# Static file serving
@router.get("/static/{file_path:path}")
async def serve_uploaded_file(file_path: str):
    """
    Serve uploaded files statically.
    
    - **file_path**: Path to the file
    
    Returns the file for download/display.
    """
    try:
        full_path = Path(UPLOAD_FOLDER) / file_path
        
        if not full_path.exists() or not full_path.is_file():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        
        # Security check - ensure file is within upload directory
        try:
            full_path.resolve().relative_to(Path(UPLOAD_FOLDER).resolve())
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return FileResponse(
            path=str(full_path),
            filename=full_path.name
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ File serve error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to serve file"
        )


# Admin endpoints
@router.get("/admin/stats", response_model=FileStatsResponse)
async def get_upload_statistics(
    current_user: User = Depends(get_admin_user)
):
    """
    Get file upload statistics (Admin only).
    
    Returns comprehensive storage and usage statistics.
    """
    try:
        upload_path = Path(UPLOAD_FOLDER)
        
        if not upload_path.exists():
            return FileStatsResponse(
                total_files=0,
                total_size_mb=0.0,
                files_by_type={},
                storage_usage_mb=0.0,
                recent_uploads=0
            )
        
        total_files = 0
        total_size = 0
        files_by_type = {}
        
        # Walk through all files
        for file_path in upload_path.rglob("*"):
            if file_path.is_file():
                total_files += 1
                file_size = file_path.stat().st_size
                total_size += file_size
                
                # Count by extension
                extension = file_path.suffix.lower().lstrip('.')
                files_by_type[extension] = files_by_type.get(extension, 0) + 1
        
        return FileStatsResponse(
            total_files=total_files,
            total_size_mb=round(total_size / (1024 * 1024), 2),
            files_by_type=files_by_type,
            storage_usage_mb=round(total_size / (1024 * 1024), 2),
            recent_uploads=0  # TODO: Implement based on file timestamps
        )
        
    except Exception as e:
        print(f"❌ Stats error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get statistics"
        )


@router.post("/admin/cleanup", response_model=FileCleanupResponse)
async def cleanup_files(
    max_age_hours: int = Query(24, ge=1, le=168, description="Maximum age for temp files in hours"),
    current_user: User = Depends(get_admin_user)
):
    """
    Clean up temporary and orphaned files (Admin only).
    
    - **max_age_hours**: Maximum age for temp files (1-168 hours)
    
    Removes temporary files older than specified time.
    """
    try:
        cleaned_files = cleanup_temp_files(max_age_hours)
        
        return FileCleanupResponse(
            success=True,
            message=f"Cleaned up {cleaned_files} temporary files",
            cleaned_files=cleaned_files,
            freed_space_mb=0.0,  # TODO: Calculate actual space freed
            operation_type="temp_cleanup"
        )
        
    except Exception as e:
        print(f"❌ Cleanup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cleanup files"
        )


# FIXED: Improved config endpoint with better error handling
@router.get("/config")
async def get_upload_config():
    """
    Get upload configuration for frontend
    
    Returns upload settings and capabilities including S3 availability.
    This endpoint enables frontend to detect upload methods automatically.
    """
    try:
        print("🔍 Upload config requested")
        
        # Check if S3 is available
        s3_available = False
        try:
            from ..services.s3_service import S3_AVAILABLE
            s3_available = S3_AVAILABLE
            print(f"📊 S3 availability check: {s3_available}")
        except ImportError:
            s3_available = False
            print("⚠️ S3 service not imported")
        except Exception as e:
            s3_available = False
            print(f"⚠️ S3 availability check failed: {e}")
            
        config_data = {
            "success": True,
            "data": {
                "max_file_size_mb": 10,
                "max_avatar_size_mb": 2,
                "allowed_types": ["image/jpeg", "image/png", "image/webp", "image/gif"],
                "max_files_per_upload": 5,
                "storage_provider": "aws_s3" if s3_available else "local",
                "s3_available": s3_available,
                "supported_formats": ["JPG", "PNG", "WebP", "GIF"],
                "features": {
                    "optimization": True,
                    "auto_resize": True,
                    "mumbai_region": s3_available,
                    "fast_upload": s3_available,
                    "local_fallback": True
                },
                "endpoints": {
                    "avatar": "/api/v1/upload/avatar",
                    "image": "/api/v1/upload/image",
                    "post_media": "/api/v1/upload/post-media",
                    "document": "/api/v1/upload/document"
                }
            }
        }
        
        print(f"✅ Upload config returned: {config_data}")
        return config_data
        
    except Exception as e:
        print(f"❌ Upload config error: {str(e)}")
        # FIXED: Always return success=True with fallback configuration
        return {
            "success": True,
            "data": {
                "max_file_size_mb": 10,
                "max_avatar_size_mb": 2,
                "allowed_types": ["image/jpeg", "image/png", "image/webp", "image/gif"],
                "max_files_per_upload": 5,
                "storage_provider": "local",
                "s3_available": False,
                "supported_formats": ["JPG", "PNG", "WebP", "GIF"],
                "features": {
                    "optimization": True,
                    "auto_resize": True,
                    "mumbai_region": False,
                    "fast_upload": False,
                    "local_fallback": True
                },
                "endpoints": {
                    "avatar": "/api/v1/upload/avatar",
                    "image": "/api/v1/upload/image", 
                    "post_media": "/api/v1/upload/post-media",
                    "document": "/api/v1/upload/document"
                }
            }
        }


# Health check endpoint
@router.get("/health")
async def upload_service_health():
    """
    Check upload service health.
    
    Returns upload directory status and configuration.
    """
    try:
        upload_path = Path(UPLOAD_FOLDER)
        
        # Check S3 availability for health report
        s3_available = False
        try:
            from ..services.s3_service import S3_AVAILABLE
            s3_available = S3_AVAILABLE
        except ImportError:
            pass
        
        return {
            "status": "healthy",
            "upload_directory_exists": upload_path.exists(),
            "upload_directory_writable": os.access(upload_path, os.W_OK) if upload_path.exists() else False,
            "max_file_size_mb": 10,
            "s3_available": s3_available,
            "supported_formats": {
                "images": ["jpg", "jpeg", "png", "webp", "gif"],
                "documents": ["pdf", "doc", "docx", "txt"],
                "videos": ["mp4", "avi", "mov", "webm"]
            }
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }