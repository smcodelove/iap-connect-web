# backend/app/config/settings.py
"""
Settings configuration for IAP Connect application.
Loads environment variables and application settings.
UPDATED: Added file upload settings
"""

from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Attributes:
        database_url: PostgreSQL database connection string
        secret_key: Secret key for JWT token generation
        algorithm: JWT algorithm (default: HS256)
        access_token_expire_minutes: JWT token expiration time
        cors_origins: Allowed CORS origins for API access
        upload_folder: Directory for file uploads
        max_file_size_mb: Maximum file size in MB
        allowed_image_types: Allowed image MIME types
        allowed_document_types: Allowed document MIME types
    """
    
    # Database settings
    database_url: str
    
    # Security settings
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS settings
    cors_origins: str
    
    # File upload settings
    upload_folder: str = "uploads"
    max_file_size_mb: int = 10
    max_avatar_size_mb: int = 2
    max_files_per_upload: int = 5
    
    # Image settings
    image_optimization_quality: int = 85
    avatar_max_width: int = 400
    avatar_max_height: int = 400
    post_image_max_width: int = 1200
    post_image_max_height: int = 1200
    thumbnail_size: int = 150
    
    # Storage settings
    static_url_prefix: str = "/static"
    temp_file_cleanup_hours: int = 24
    
    # Security settings
    allowed_image_extensions: str = "jpg,jpeg,png,webp,gif"
    allowed_document_extensions: str = "pdf,doc,docx,txt"
    allowed_video_extensions: str = "mp4,avi,mov,webm"
    
    # Performance settings
    enable_image_optimization: bool = True
    enable_thumbnail_generation: bool = True
    enable_duplicate_detection: bool = True
    
    class Config:
        env_file = ".env"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    @property
    def allowed_image_extensions_list(self) -> List[str]:
        """Convert comma-separated image extensions to list."""
        return [ext.strip().lower() for ext in self.allowed_image_extensions.split(",")]
    
    @property
    def allowed_document_extensions_list(self) -> List[str]:
        """Convert comma-separated document extensions to list."""
        return [ext.strip().lower() for ext in self.allowed_document_extensions.split(",")]
    
    @property
    def allowed_video_extensions_list(self) -> List[str]:
        """Convert comma-separated video extensions to list."""
        return [ext.strip().lower() for ext in self.allowed_video_extensions.split(",")]
    
    @property
    def all_allowed_extensions_list(self) -> List[str]:
        """Get all allowed file extensions."""
        return (self.allowed_image_extensions_list + 
                self.allowed_document_extensions_list + 
                self.allowed_video_extensions_list)
    
    @property
    def upload_folder_path(self) -> Path:
        """Get upload folder as Path object."""
        return Path(self.upload_folder)
    
    @property
    def max_file_size_bytes(self) -> int:
        """Get max file size in bytes."""
        return self.max_file_size_mb * 1024 * 1024
    
    @property
    def max_avatar_size_bytes(self) -> int:
        """Get max avatar size in bytes."""
        return self.max_avatar_size_mb * 1024 * 1024
    
    def ensure_upload_directories(self):
        """Ensure all upload directories exist."""
        base_path = self.upload_folder_path
        base_path.mkdir(exist_ok=True)
        
        # Create subdirectories
        subdirs = ['avatars', 'posts', 'documents', 'temp', 'thumbnails']
        for subdir in subdirs:
            (base_path / subdir).mkdir(exist_ok=True)
    
    def get_file_url(self, file_path: str) -> str:
        """Generate public URL for a file."""
        return f"{self.static_url_prefix}/{file_path.lstrip('/')}"
    
    def validate_file_extension(self, filename: str) -> bool:
        """Validate if file extension is allowed."""
        if not filename or '.' not in filename:
            return False
        
        extension = filename.rsplit('.', 1)[1].lower()
        return extension in self.all_allowed_extensions_list
    
    def get_file_type(self, filename: str) -> str:
        """Get file type based on extension."""
        if not filename or '.' not in filename:
            return "unknown"
        
        extension = filename.rsplit('.', 1)[1].lower()
        
        if extension in self.allowed_image_extensions_list:
            return "image"
        elif extension in self.allowed_document_extensions_list:
            return "document"
        elif extension in self.allowed_video_extensions_list:
            return "video"
        else:
            return "unknown"


# Global settings instance
settings = Settings()

# Ensure upload directories exist on startup
settings.ensure_upload_directories()