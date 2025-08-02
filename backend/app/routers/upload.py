# backend/app/routers/upload.py
"""
File upload routes for IAP Connect application.
Handles all file upload operations including avatars, post media, and documents.
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
    upload_file, upload_avatar, upload_post_media, delete_file, 
    get_file_info, cleanup_temp_files, UPLOAD_FOLDER,
    validate_image_file, validate_document_file  # Updated imports
)
from ..schemas.file import (
    FileUploadResponse, MultipleFileUploadResponse, FileInfo, 
    FileDeleteResponse, AvatarUploadResponse, PostMediaUploadResponse,
    FileStatsResponse, FileBatchDeleteRequest, FileBatchDeleteResponse,
    FileCleanupResponse
)

router = APIRouter(prefix="/upload", tags=["File Upload"])


@router.post("/avatar", response_model=AvatarUploadResponse)
async def upload_user_avatar(
    file: UploadFile = File(..., description="Avatar image file (max 2MB)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload or update user avatar.
    
    - **file**: Image file (JPG, PNG, WebP, GIF)
    - Maximum size: 2MB
    - Automatically optimized to 400x400px
    - Creates thumbnail version
    
    Updates user's profile_picture_url in database.
    """
    try:
        # Delete old avatar if exists
        if current_user.profile_picture_url:
            await delete_file(current_user.profile_picture_url)
        
        # Upload new avatar using file service
        result = await upload_avatar(file, current_user.id)
        
        # Update user's profile picture URL in database
        current_user.profile_picture_url = result['url']
        db.commit()
        db.refresh(current_user)
        
        return AvatarUploadResponse(
            **result,
            avatar_url=result['url'],
            thumbnail_url=result.get('thumbnail_url')  # Handle optional thumbnail
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Avatar upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload avatar"
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
        results = await upload_post_media(files, current_user.id)
        
        # Separate successful and failed uploads
        successful_uploads = [r for r in results if r.get('success', False)]
        failed_uploads = [r for r in results if not r.get('success', False)]
        
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
        print(f"Post media upload error: {str(e)}")
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
        result = await upload_file(
            file=file,
            folder=folder,
            optimize_images=False,
            max_size=5 * 1024 * 1024  # 5MB
        )
        
        return FileUploadResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Document upload error: {str(e)}")
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
        print(f"File info error: {str(e)}")
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
        print(f"File delete error: {str(e)}")
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
        print(f"Batch delete error: {str(e)}")
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
        print(f"File serve error: {str(e)}")
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
        print(f"Stats error: {str(e)}")
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
        print(f"Cleanup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cleanup files"
        )


# Health check endpoint
@router.get("/health")
async def upload_service_health():
    """
    Check upload service health.
    
    Returns upload directory status and configuration.
    """
    try:
        upload_path = Path(UPLOAD_FOLDER)
        
        return {
            "status": "healthy",
            "upload_directory_exists": upload_path.exists(),
            "upload_directory_writable": os.access(upload_path, os.W_OK) if upload_path.exists() else False,
            "max_file_size_mb": 10,
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