"""
Bookmark schemas for IAP Connect application.
Handles request/response validation for bookmark endpoints.
"""

from pydantic import BaseModel
from typing import List
from datetime import datetime
from .post import PostResponse


class BookmarkResponse(BaseModel):
    """
    Bookmark response schema.
    
    Attributes:
        success: Whether bookmark action was successful
        bookmarked: Current bookmark status
        message: Success message
    """
    success: bool
    bookmarked: bool
    message: str


class BookmarkedPostResponse(BaseModel):
    """
    Bookmarked post response schema.
    
    Attributes:
        id: Bookmark ID
        created_at: Bookmark timestamp
        post: Post details
    """
    id: int
    created_at: datetime
    post: PostResponse
    
    class Config:
        from_attributes = True


class BookmarkListResponse(BaseModel):
    """
    Bookmark list response schema.
    
    Attributes:
        bookmarks: List of bookmarked posts
        total: Total number of bookmarks
        page: Current page number
        size: Page size
        has_next: Whether there are more bookmarks
    """
    bookmarks: List[BookmarkedPostResponse]
    total: int
    page: int
    size: int
    has_next: bool