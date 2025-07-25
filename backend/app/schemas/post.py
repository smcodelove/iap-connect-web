"""
Post schemas for IAP Connect application.
Updated to fix validation errors with proper user info schema.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class UserBasicInfo(BaseModel):
    """Basic user info for post responses - FIXED VERSION"""
    id: int
    username: str
    full_name: str
    user_type: str  # Keep as string to avoid enum issues
    profile_picture_url: Optional[str] = None
    specialty: Optional[str] = None
    college: Optional[str] = None
    
    class Config:
        from_attributes = True


class PostBase(BaseModel):
    """Base post schema"""
    content: str = Field(..., min_length=1, max_length=2000)
    media_urls: Optional[List[str]] = []
    hashtags: Optional[List[str]] = []


class PostCreate(PostBase):
    """Post creation schema"""
    pass


class PostUpdate(BaseModel):
    """Post update schema"""
    content: Optional[str] = Field(None, min_length=1, max_length=2000)
    media_urls: Optional[List[str]] = None
    hashtags: Optional[List[str]] = None


class PostResponse(BaseModel):
    """Post response schema with author info"""
    id: int
    content: str
    media_urls: Optional[List[str]] = []
    hashtags: Optional[List[str]] = []
    likes_count: int = 0
    comments_count: int = 0
    shares_count: int = 0
    is_trending: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_liked: bool = False
    author: UserBasicInfo  # FIXED: Use correct user schema
    
    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    """Posts list response with pagination"""
    posts: List[PostResponse]
    total: int
    page: int
    size: int
    has_next: bool


class PostLikeResponse(BaseModel):
    """Post like/unlike response"""
    success: bool
    message: str
    is_liked: bool
    likes_count: int


class HashtagResponse(BaseModel):
    """Hashtag response schema"""
    hashtag: str
    posts_count: int
    total_engagement: int
    growth: str


class TrendingHashtagsResponse(BaseModel):
    """Trending hashtags response"""
    success: bool
    trending_hashtags: List[HashtagResponse]
    total: int