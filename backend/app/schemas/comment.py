"""
Comment schemas for IAP Connect application.
Handles request/response validation for comment endpoints with replies and likes.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .user import UserPublic  # FIXED: Use UserPublic instead of UserSearchResponse


class CommentCreate(BaseModel):
    """
    Comment creation schema.
    
    Attributes:
        content: Comment text content
        parent_id: Optional parent comment ID for replies
    """
    content: str
    parent_id: Optional[int] = None


class CommentResponse(BaseModel):
    """
    Comment response schema for API responses.
    
    Attributes:
        id: Comment ID
        content: Comment content
        parent_id: Parent comment ID (if this is a reply)
        likes_count: Number of likes on this comment
        replies_count: Number of replies to this comment
        created_at: Creation timestamp
        author: Comment author information
        is_liked: Whether current user liked this comment
        replies: List of reply comments (limited to first few)
    """
    id: int
    content: str
    parent_id: Optional[int] = None
    likes_count: int = 0
    replies_count: int = 0
    created_at: datetime
    author: UserPublic  # FIXED: Use UserPublic
    is_liked: Optional[bool] = False
    replies: Optional[List['CommentResponse']] = []
    
    class Config:
        from_attributes = True


class CommentListResponse(BaseModel):
    """
    Comment list response schema.
    
    Attributes:
        comments: List of comments
        total: Total number of comments
    """
    comments: List[CommentResponse]
    total: int


class CommentLikeResponse(BaseModel):
    """
    Comment like response schema.
    
    Attributes:
        success: Whether like action was successful
        liked: Current like status
        likes_count: Updated likes count
    """
    success: bool
    liked: bool
    likes_count: int


# Enable forward references
CommentResponse.model_rebuild()