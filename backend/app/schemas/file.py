# backend/app/schemas/file.py
"""
File upload schemas for IAP Connect application.
Pydantic models for file upload requests and responses.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class FileType(str, Enum):
    """File type enumeration"""
    IMAGE = "image"
    DOCUMENT = "document"
    VIDEO = "video"
    OTHER = "other"


class UploadType(str, Enum):
    """Upload type enumeration"""
    AVATAR = "avatar"
    POST_MEDIA = "post_media"
    DOCUMENT = "document"
    GENERAL = "general"


class FileUploadResponse(BaseModel):
    """Response schema for successful file upload"""
    success: bool = True
    filename: str
    original_filename: str
    url: str
    thumbnail_url: Optional[str] = None
    file_size: int
    original_size: int
    content_type: str
    extension: str
    is_image: bool
    file_hash: str
    folder: str
    upload_time: datetime
    
    class Config:
        from_attributes = True


class FileUploadError(BaseModel):
    """Response schema for failed file upload"""
    success: bool = False
    filename: str
    error: str
    error_code: Optional[str] = None


class MultipleFileUploadResponse(BaseModel):
    """Response schema for multiple file uploads"""
    success: bool
    uploaded_files: List[FileUploadResponse]
    failed_files: List[FileUploadError]
    total_files: int
    successful_uploads: int
    failed_uploads: int


class FileInfo(BaseModel):
    """Schema for file information"""
    exists: bool
    filename: Optional[str] = None
    size: Optional[int] = None
    size_mb: Optional[float] = None
    created: Optional[datetime] = None
    modified: Optional[datetime] = None
    extension: Optional[str] = None
    mime_type: Optional[str] = None
    is_image: Optional[bool] = None
    url: Optional[str] = None
    error: Optional[str] = None


class FileDeleteResponse(BaseModel):
    """Response schema for file deletion"""
    success: bool
    message: str
    filename: Optional[str] = None


class AvatarUploadResponse(FileUploadResponse):
    """Specialized response for avatar uploads"""
    avatar_url: str
    thumbnail_url: str
    
    @validator('avatar_url', pre=True, always=True)
    def set_avatar_url(cls, v, values):
        return values.get('url', v)


class PostMediaUploadRequest(BaseModel):
    """Request schema for post media upload"""
    post_id: Optional[int] = None
    caption: Optional[str] = None
    alt_text: Optional[str] = None


class PostMediaUploadResponse(BaseModel):
    """Response schema for post media upload"""
    success: bool
    media_files: List[FileUploadResponse]
    total_uploaded: int
    total_size_mb: float


class FileValidationError(BaseModel):
    """Schema for file validation errors"""
    field: str
    error: str
    code: str


class FileUploadConfig(BaseModel):
    """Schema for file upload configuration"""
    max_file_size_mb: int
    allowed_extensions: List[str]
    allowed_mime_types: List[str]
    optimize_images: bool = True
    create_thumbnails: bool = False
    max_files_per_upload: int = 5


class FileStatsResponse(BaseModel):
    """Response schema for file statistics"""
    total_files: int
    total_size_mb: float
    files_by_type: Dict[str, int]
    storage_usage_mb: float
    recent_uploads: int  # Last 24 hours


class FileSearchRequest(BaseModel):
    """Request schema for file search"""
    query: Optional[str] = None
    file_type: Optional[FileType] = None
    extension: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_size_mb: Optional[float] = None
    max_size_mb: Optional[float] = None
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=100)


class FileSearchResponse(BaseModel):
    """Response schema for file search"""
    files: List[FileInfo]
    total: int
    page: int
    size: int
    has_next: bool
    total_size_mb: float


class FileBatchDeleteRequest(BaseModel):
    """Request schema for batch file deletion"""
    file_paths: List[str] = Field(..., min_items=1, max_items=50)
    
    @validator('file_paths')
    def validate_file_paths(cls, v):
        if not v:
            raise ValueError('At least one file path is required')
        if len(v) > 50:
            raise ValueError('Maximum 50 files can be deleted at once')
        return v


class FileBatchDeleteResponse(BaseModel):
    """Response schema for batch file deletion"""
    success: bool
    deleted_files: List[str]
    failed_files: List[Dict[str, str]]  # [{path: str, error: str}]
    total_requested: int
    deleted_count: int
    failed_count: int


class FileCleanupResponse(BaseModel):
    """Response schema for file cleanup operations"""
    success: bool
    message: str
    cleaned_files: int
    freed_space_mb: float
    operation_type: str  # 'temp_cleanup', 'orphaned_cleanup', etc.


class ImageOptimizationRequest(BaseModel):
    """Request schema for image optimization"""
    file_path: str
    max_width: Optional[int] = Field(1200, ge=100, le=4000)
    max_height: Optional[int] = Field(1200, ge=100, le=4000)
    quality: Optional[int] = Field(85, ge=1, le=100)
    create_thumbnail: bool = False
    thumbnail_size: Optional[int] = Field(150, ge=50, le=500)


class ImageOptimizationResponse(BaseModel):
    """Response schema for image optimization"""
    success: bool
    original_size_mb: float
    optimized_size_mb: float
    compression_ratio: float
    optimized_url: str
    thumbnail_url: Optional[str] = None
    savings_mb: float


class FileMetadata(BaseModel):
    """Schema for extended file metadata"""
    filename: str
    original_filename: str
    file_size: int
    content_type: str
    extension: str
    file_hash: str
    upload_time: datetime
    last_accessed: Optional[datetime] = None
    download_count: int = 0
    is_public: bool = True
    uploaded_by: int  # User ID
    folder: str
    tags: List[str] = []
    description: Optional[str] = None


class FileAccessLog(BaseModel):
    """Schema for file access logging"""
    file_path: str
    accessed_by: int  # User ID
    access_time: datetime
    access_type: str  # 'view', 'download', 'delete'
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class FileSecurityScanResult(BaseModel):
    """Schema for file security scan results"""
    file_path: str
    is_safe: bool
    threats_detected: List[str] = []
    scan_time: datetime
    scanner_version: str
    file_hash: str


class DuplicateFileResult(BaseModel):
    """Schema for duplicate file detection"""
    original_file: str
    duplicate_files: List[str]
    file_hash: str
    total_size_mb: float
    potential_savings_mb: float


class StorageQuotaInfo(BaseModel):
    """Schema for storage quota information"""
    user_id: int
    used_space_mb: float
    total_quota_mb: float
    remaining_space_mb: float
    usage_percentage: float
    files_count: int
    is_quota_exceeded: bool