"""
Post schemas for IAP Connect application.
Handles request/response validation for post endpoints.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .user import UserSearchResponse


class PostCreate(BaseModel):
    """
    Post creation schema.
    
    Attributes:
        content: Post text content
        media_urls: Optional list of image/document URLs
        hashtags: Optional list of hashtags
    """
    content: str
    media_urls: Optional[List[str]] = []
    hashtags: Optional[List[str]] = []


class PostUpdate(BaseModel):
    """
    Post update schema.
    
    Attributes:
        content: Updated post content
        media_urls: Updated media URLs
        hashtags: Updated hashtags
    """
    content: Optional[str] = None
    media_urls: Optional[List[str]] = None
    hashtags: Optional[List[str]] = None


class PostResponse(BaseModel):
    """
    Post response schema for API responses.
    
    Attributes:
        id: Post ID
        content: Post content
        media_urls: List of media URLs
        hashtags: List of hashtags
        likes_count: Number of likes
        comments_count: Number of comments
        shares_count: Number of shares
        is_trending: Trending status
        created_at: Creation timestamp
        updated_at: Last update timestamp
        author: Post author information
        is_liked: Whether current user liked this post
    """
    id: int
    content: str
    media_urls: Optional[List[str]] = []
    hashtags: Optional[List[str]] = []
    likes_count: int
    comments_count: int
    shares_count: int
    is_trending: bool
    created_at: datetime
    updated_at: datetime
    author: UserSearchResponse
    is_liked: Optional[bool] = False
    
    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    """
    Post list response schema.
    
    Attributes:
        posts: List of posts
        total: Total number of posts
        page: Current page number
        size: Page size
        has_next: Whether there are more posts
    """
    posts: List[PostResponse]
    total: int
    page: int
    size: int
    has_next: bool