# services/file_service.py
"""
File upload service for IAP Connect application.
Handles profile picture uploads and other media files.
"""

import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException, status
from typing import List, Optional
from pathlib import Path
import hashlib
from PIL import Image
import io


# Configuration
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {
    'images': ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    'documents': ['pdf', 'doc', 'docx'],
    'all': ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'doc', 'docx']
}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


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


def generate_unique_filename(original_filename: str, folder: str = "") -> str:
    """
    Generate a unique filename to prevent conflicts.
    
    Args:
        original_filename: Original name of the uploaded file
        folder: Subfolder for organization
    
    Returns:
        str: Unique filename with path
    """
    # Get file extension
    extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
    
    # Generate unique ID
    unique_id = str(uuid.uuid4())
    
    # Create filename
    if folder:
        return f"{folder}/{unique_id}.{extension}"
    return f"{unique_id}.{extension}"


def optimize_image(image_data: bytes, max_width: int = 800, quality: int = 85) -> bytes:
    """
    Optimize image for web usage by resizing and compressing.
    
    Args:
        image_data: Raw image bytes
        max_width: Maximum width for the image
        quality: JPEG quality (1-100)
    
    Returns:
        bytes: Optimized image data
    """
    try:
        # Open image
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed (for JPEG compatibility)
        if image.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if 'A' in image.mode else None)
            image = background
        
        # Resize if needed
        if image.width > max_width:
            ratio = max_width / image.width
            new_height = int(image.height * ratio)
            image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Save optimized image
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=quality, optimize=True)
        return output.getvalue()
    
    except Exception as e:
        # If optimization fails, return original data
        return image_data


async def save_uploaded_file(file: UploadFile, filename: str) -> str:
    """
    Save uploaded file to disk.
    
    Args:
        file: FastAPI UploadFile object
        filename: Target filename with path
    
    Returns:
        str: Full path to saved file
    """
    # Ensure upload directory exists
    upload_path = Path(UPLOAD_FOLDER)
    upload_path.mkdir(parents=True, exist_ok=True)
    
    # Create subdirectory if needed
    file_path = upload_path / filename
    file_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        content = await file.read()
        await f.write(content)
    
    return str(file_path)


async def upload_file(
    file: UploadFile, 
    folder: str = "general",
    optimize_images: bool = True,
    max_size: int = MAX_FILE_SIZE
) -> str:
    """
    Complete file upload workflow with validation and optimization.
    
    Args:
        file: FastAPI UploadFile object
        folder: Subfolder for organization
        optimize_images: Whether to optimize image files
        max_size: Maximum allowed file size in bytes
    
    Returns:
        str: Public URL to the uploaded file
    
    Raises:
        HTTPException: If upload fails or file is invalid
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
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
    
    # Reset file pointer for further operations
    await file.seek(0)
    
    try:
        # Generate unique filename
        unique_filename = generate_unique_filename(file.filename, folder)
        
        # Optimize image if it's an image file
        if optimize_images and any(file.filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS['images']):
            content = optimize_image(content)
        
        # Create a temporary UploadFile-like object for saving
        class TempFile:
            async def read(self):
                return content
        
        temp_file = TempFile()
        
        # Save file
        file_path = await save_uploaded_file(temp_file, unique_filename)
        
        # Return public URL (adjust based on your static file serving setup)
        public_url = f"/static/{unique_filename}"
        
        return public_url
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )


async def delete_file(file_path: str) -> bool:
    """
    Delete a file from the upload directory.
    
    Args:
        file_path: Path to the file (relative to upload directory)
    
    Returns:
        bool: True if file was deleted successfully
    """
    try:
        full_path = Path(UPLOAD_FOLDER) / file_path.lstrip('/')
        if full_path.exists():
            full_path.unlink()
            return True
        return False
    except Exception:
        return False


def get_file_info(file_path: str) -> dict:
    """
    Get information about an uploaded file.
    
    Args:
        file_path: Path to the file
    
    Returns:
        dict: File information including size, type, etc.
    """
    try:
        full_path = Path(UPLOAD_FOLDER) / file_path.lstrip('/')
        if not full_path.exists():
            return {}
        
        stat = full_path.stat()
        return {
            'filename': full_path.name,
            'size': stat.st_size,
            'created': stat.st_ctime,
            'modified': stat.st_mtime,
            'extension': full_path.suffix.lower().lstrip('.'),
            'exists': True
        }
    except Exception:
        return {'exists': False}


# Validation helpers
def validate_image_file(file: UploadFile) -> bool:
    """Validate that uploaded file is a valid image"""
    return allowed_file(file.filename, ALLOWED_EXTENSIONS['images'])


def validate_document_file(file: UploadFile) -> bool:
    """Validate that uploaded file is a valid document"""
    return allowed_file(file.filename, ALLOWED_EXTENSIONS['documents'])


def get_file_hash(content: bytes) -> str:
    """Generate MD5 hash of file content for duplicate detection"""
    return hashlib.md5(content).hexdigest()


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