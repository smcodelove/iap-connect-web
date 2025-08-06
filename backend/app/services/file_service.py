# backend/app/services/file_service.py
"""
File upload service for IAP Connect application.
Handles profile picture uploads and other media files.
COMPLETE: All file operations with security and optimization
"""

import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException, status
from typing import List, Optional, Dict, Any
from pathlib import Path
import hashlib
from PIL import Image, ImageOps, ExifTags
import io
import mimetypes
import asyncio
from datetime import datetime
import shutil


# Configuration
UPLOAD_FOLDER = "uploads"
STATIC_URL_PREFIX = "/static"  # URL prefix for serving files
ALLOWED_EXTENSIONS = {
    'images': ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    'documents': ['pdf', 'doc', 'docx', 'txt'],
    'videos': ['mp4', 'avi', 'mov', 'webm'],
    'all': ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx', 'txt', 'mp4', 'avi', 'mov', 'webm']
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB default

# MIME type mappings for security
ALLOWED_MIME_TYPES = {
    'image/jpeg': 'jpg',
    'image/png': 'png', 
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'video/mp4': 'mp4',
    'video/webm': 'webm'
}


def ensure_upload_directory():
    """Ensure upload directory exists with proper permissions"""
    upload_path = Path(UPLOAD_FOLDER)
    upload_path.mkdir(parents=True, exist_ok=True)
    
    # Create subdirectories
    subdirs = ['avatars', 'posts', 'documents', 'temp']
    for subdir in subdirs:
        (upload_path / subdir).mkdir(exist_ok=True)


def allowed_file(filename: str, allowed_types: List[str]) -> bool:
    """
    Check if the uploaded file has an allowed extension.
    
    Args:
        filename: Name of the uploaded file
        allowed_types: List of allowed file extensions
    
    Returns:
        bool: True if file type is allowed
    """
    if not filename:
        return False
    
    extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    return extension in allowed_types


def validate_mime_type(content_type: str) -> bool:
    """Validate MIME type for security"""
    return content_type in ALLOWED_MIME_TYPES


def generate_unique_filename(original_filename: str, folder: str = "", prefix: str = "") -> str:
    """
    Generate a unique filename to prevent conflicts.
    
    Args:
        original_filename: Original name of the uploaded file
        folder: Subfolder for organization
        prefix: Optional prefix for filename
    
    Returns:
        str: Unique filename with path
    """
    # Get file extension
    extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
    
    # Generate unique ID with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    
    # Create filename
    if prefix:
        filename = f"{prefix}_{timestamp}_{unique_id}.{extension}"
    else:
        filename = f"{timestamp}_{unique_id}.{extension}"
    
    if folder:
        return f"{folder}/{filename}"
    return filename


def optimize_image(image_data: bytes, max_width: int = 1200, max_height: int = 1200, quality: int = 85) -> bytes:
    """
    Optimize image for web usage by resizing and compressing.
    
    Args:
        image_data: Raw image bytes
        max_width: Maximum width for the image
        max_height: Maximum height for the image  
        quality: JPEG quality (1-100)
    
    Returns:
        bytes: Optimized image data
    """
    try:
        # Open image
        image = Image.open(io.BytesIO(image_data))
        
        # Fix image orientation based on EXIF data
        try:
            for orientation in ExifTags.TAGS.keys():
                if ExifTags.TAGS[orientation] == 'Orientation':
                    break
            
            exif = image._getexif()
            if exif is not None:
                orientation_value = exif.get(orientation)
                if orientation_value == 3:
                    image = image.rotate(180, expand=True)
                elif orientation_value == 6:
                    image = image.rotate(270, expand=True)
                elif orientation_value == 8:
                    image = image.rotate(90, expand=True)
        except (AttributeError, KeyError, TypeError):
            pass
        
        # Convert to RGB if needed (for JPEG compatibility)
        if image.mode in ('RGBA', 'LA', 'P'):
            # Create white background for transparency
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            if 'A' in image.mode:
                background.paste(image, mask=image.split()[-1])
            else:
                background.paste(image)
            image = background
        
        # Resize if needed (maintain aspect ratio)
        if image.width > max_width or image.height > max_height:
            image.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
        
        # Save optimized image
        output = io.BytesIO()
        
        # Use original format if it's PNG/GIF, otherwise JPEG
        original_format = Image.open(io.BytesIO(image_data)).format
        if original_format in ['PNG', 'GIF']:
            if original_format == 'PNG':
                image.save(output, format='PNG', optimize=True)
            else:
                image.save(output, format='GIF', optimize=True)
        else:
            image.save(output, format='JPEG', quality=quality, optimize=True)
        
        return output.getvalue()
    
    except Exception as e:
        print(f"Image optimization failed: {str(e)}")
        # If optimization fails, return original data
        return image_data


def create_thumbnail(image_data: bytes, size: tuple = (150, 150)) -> bytes:
    """Create thumbnail version of image"""
    try:
        image = Image.open(io.BytesIO(image_data))
        
        # Create thumbnail maintaining aspect ratio
        image.thumbnail(size, Image.Resampling.LANCZOS)
        
        # Convert to RGB if needed
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            if 'A' in image.mode:
                background.paste(image, mask=image.split()[-1])
            else:
                background.paste(image)
            image = background
        
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=80, optimize=True)
        return output.getvalue()
    
    except Exception as e:
        print(f"Thumbnail creation failed: {str(e)}")
        return image_data


async def save_uploaded_file(content: bytes, filename: str) -> str:
    """
    Save file content to disk asynchronously.
    
    Args:
        content: File content as bytes
        filename: Target filename with path
    
    Returns:
        str: Full path to saved file
    """
    # Ensure upload directory exists
    ensure_upload_directory()
    
    # Create full file path
    file_path = Path(UPLOAD_FOLDER) / filename
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save file asynchronously
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    return str(file_path)


async def upload_file(
    file: UploadFile, 
    folder: str = "general",
    optimize_images: bool = True,
    max_size: int = MAX_FILE_SIZE,
    should_create_thumbnail: bool = False
) -> Dict[str, Any]:
    """
    Complete file upload workflow with validation and optimization.
    
    Args:
        file: FastAPI UploadFile object
        folder: Subfolder for organization
        optimize_images: Whether to optimize image files
        max_size: Maximum allowed file size in bytes
        should_create_thumbnail: Whether to create thumbnail for images
    
    Returns:
        dict: Upload result with file info and URLs
    
    Raises:
        HTTPException: If upload fails or file is invalid
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Validate MIME type
    if not validate_mime_type(file.content_type):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type: {file.content_type}"
        )
    
    # Read file content
    content = await file.read()
    file_size = len(content)
    
    # Check file size
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {max_size // (1024*1024)}MB"
        )
    
    # Check if file is empty
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty file not allowed"
        )
    
    try:
        # Generate unique filename
        unique_filename = generate_unique_filename(file.filename, folder)
        
        # Get file extension and type
        extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        is_image = extension in ALLOWED_EXTENSIONS['images']
        
        # Process image if needed
        processed_content = content
        thumbnail_url = None
        
        if is_image and optimize_images:
            # Optimize main image
            if folder == 'avatars':
                processed_content = optimize_image(image_data=content, max_width=400, max_height=400, quality=90)
            else:
                processed_content = optimize_image(image_data=content, max_width=1200, max_height=1200, quality=85)
            
        
            # Create thumbnail if requested
            if should_create_thumbnail:
                thumbnail_content = create_thumbnail(image_data=content)
                thumbnail_filename = f"thumb_{unique_filename}"
                await save_uploaded_file(thumbnail_content, thumbnail_filename)
                thumbnail_url = f"{STATIC_URL_PREFIX}/{thumbnail_filename}"
        
        # Save main file
        file_path = await save_uploaded_file(processed_content, unique_filename)
        
        # Generate public URL
        public_url = f"{STATIC_URL_PREFIX}/{unique_filename}"
        
        # Calculate file hash for duplicate detection
        file_hash = hashlib.md5(processed_content).hexdigest()
        
        # Return comprehensive file info
        return {
            'success': True,
            'filename': unique_filename,
            'original_filename': file.filename,
            'url': public_url,
            'thumbnail_url': thumbnail_url,
            'file_path': file_path,
            'file_size': len(processed_content),
            'original_size': file_size,
            'content_type': file.content_type,
            'extension': extension,
            'is_image': is_image,
            'file_hash': file_hash,
            'folder': folder,
            'upload_time': datetime.now().isoformat()
        }
    
    except Exception as e:
        print(f"File upload error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )


async def upload_avatar(file: UploadFile, user_id: int) -> Dict[str, Any]:
    """
    Upload user avatar with specific optimizations.
    
    Args:
        file: FastAPI UploadFile object
        user_id: User ID for filename prefix
    
    Returns:
        dict: Upload result with avatar URLs
    """
    # FIXED: Direct validation instead of function call
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    # Check if it's a valid image file
    if not (file.content_type in ALLOWED_MIME_TYPES and 
            ALLOWED_MIME_TYPES[file.content_type] in ALLOWED_EXTENSIONS['images']):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed for avatars"
        )
    
    # Upload with avatar-specific settings
    result = await upload_file(
        file=file,
        folder="avatars",
        optimize_images=True,
        max_size=AVATAR_CONFIG['max_size'],
        should_create_thumbnail=True
    )
    
    return result


async def upload_post_media(files: List[UploadFile], user_id: int) -> List[Dict[str, Any]]:
    """
    Upload multiple media files for a post.
    
    Args:
        files: List of FastAPI UploadFile objects
        user_id: User ID for filename prefix
    
    Returns:
        list: List of upload results
    """
    if len(files) > 5:  # Limit to 5 files per post
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 files allowed per post"
        )
    
    results = []
    
    for file in files:
        try:
            # Determine if it's an image or document
            extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
            is_image = extension in ALLOWED_EXTENSIONS['images']
            
            if is_image:
                max_size = POST_MEDIA_CONFIG['max_size']
            else:
                max_size = 5 * 1024 * 1024  # 5MB for documents
            
            result = await upload_file(
                file=file,
                folder="posts",
                optimize_images=is_image,
                max_size=max_size,
                should_create_thumbnail=is_image
            )
            
            results.append(result)
            
        except Exception as e:
            # Log error but continue with other files
            print(f"Failed to upload {file.filename}: {str(e)}")
            results.append({
                'success': False,
                'filename': file.filename,
                'error': str(e)
            })
    
    return results


async def delete_file(file_path: str) -> bool:
    """
    Delete a file from the upload directory.
    
    Args:
        file_path: Path to the file (relative to upload directory or full URL)
    
    Returns:
        bool: True if file was deleted successfully
    """
    try:
        # Handle both relative paths and full URLs
        if file_path.startswith(STATIC_URL_PREFIX):
            file_path = file_path[len(STATIC_URL_PREFIX):].lstrip('/')
        
        full_path = Path(UPLOAD_FOLDER) / file_path
        
        if full_path.exists() and full_path.is_file():
            full_path.unlink()
            
            # Also try to delete thumbnail if it exists
            thumbnail_path = full_path.parent / f"thumb_{full_path.name}"
            if thumbnail_path.exists():
                thumbnail_path.unlink()
            
            return True
        return False
    except Exception as e:
        print(f"Error deleting file {file_path}: {str(e)}")
        return False


def get_file_info(file_path: str) -> Dict[str, Any]:
    """
    Get information about an uploaded file.
    
    Args:
        file_path: Path to the file
    
    Returns:
        dict: File information including size, type, etc.
    """
    try:
        # Handle both relative paths and full URLs
        if file_path.startswith(STATIC_URL_PREFIX):
            file_path = file_path[len(STATIC_URL_PREFIX):].lstrip('/')
        
        full_path = Path(UPLOAD_FOLDER) / file_path
        
        if not full_path.exists():
            return {'exists': False}
        
        stat = full_path.stat()
        
        # Get MIME type
        mime_type, _ = mimetypes.guess_type(str(full_path))
        
        return {
            'exists': True,
            'filename': full_path.name,
            'size': stat.st_size,
            'size_mb': round(stat.st_size / (1024 * 1024), 2),
            'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
            'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
            'extension': full_path.suffix.lower().lstrip('.'),
            'mime_type': mime_type,
            'is_image': full_path.suffix.lower().lstrip('.') in ALLOWED_EXTENSIONS['images'],
            'url': f"{STATIC_URL_PREFIX}/{file_path}"
        }
    except Exception as e:
        print(f"Error getting file info for {file_path}: {str(e)}")
        return {'exists': False, 'error': str(e)}


# Validation helpers - Helper functions for file validation
def validate_image_file(file: UploadFile) -> bool:
    """Validate that uploaded file is a valid image"""
    if not file.filename:
        return False
    return (file.content_type in ALLOWED_MIME_TYPES and 
            ALLOWED_MIME_TYPES[file.content_type] in ALLOWED_EXTENSIONS['images'])


def validate_document_file(file: UploadFile) -> bool:
    """Validate that uploaded file is a valid document"""
    if not file.filename:
        return False
    return (file.content_type in ALLOWED_MIME_TYPES and 
            ALLOWED_MIME_TYPES[file.content_type] in ALLOWED_EXTENSIONS['documents'])


def get_file_hash(content: bytes) -> str:
    """Generate MD5 hash of file content for duplicate detection"""
    return hashlib.md5(content).hexdigest()


def cleanup_temp_files(max_age_hours: int = 24) -> int:
    """
    Clean up temporary files older than specified hours.
    
    Args:
        max_age_hours: Maximum age in hours for temp files
    
    Returns:
        int: Number of files cleaned up
    """
    try:
        temp_dir = Path(UPLOAD_FOLDER) / "temp"
        if not temp_dir.exists():
            return 0
        
        cutoff_time = datetime.now().timestamp() - (max_age_hours * 3600)
        cleaned_count = 0
        
        for file_path in temp_dir.iterdir():
            if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                try:
                    file_path.unlink()
                    cleaned_count += 1
                except Exception as e:
                    print(f"Failed to delete temp file {file_path}: {str(e)}")
        
        return cleaned_count
    except Exception as e:
        print(f"Error during temp file cleanup: {str(e)}")
        return 0


# Configuration for different file types
AVATAR_CONFIG = {
    'folder': 'avatars',
    'max_size': 2 * 1024 * 1024,  # 2MB
    'allowed_types': ALLOWED_EXTENSIONS['images'],
    'optimize': True,
    'max_width': 400
}

POST_MEDIA_CONFIG = {
    'folder': 'posts',
    'max_size': 10 * 1024 * 1024,  # 10MB
    'allowed_types': ALLOWED_EXTENSIONS['all'],
    'optimize': True,
    'max_width': 1200
}

DOCUMENT_CONFIG = {
    'folder': 'documents',
    'max_size': 5 * 1024 * 1024,  # 5MB
    'allowed_types': ALLOWED_EXTENSIONS['documents'],
    'optimize': False
}

# Initialize upload directory on import
ensure_upload_directory()