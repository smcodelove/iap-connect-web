"""
Comment schemas for IAP Connect application.
Handles request/response validation for comment endpoints.
"""

from pydantic import BaseModel
from typing import List
from datetime import datetime
from .user import UserSearchResponse


class CommentCreate(BaseModel):
    """
    Comment creation schema.
    
    Attributes:
        content: Comment text content
    """
    content: str


class CommentResponse(BaseModel):
    """
    Comment response schema for API responses.
    
    Attributes:
        id: Comment ID
        content: Comment content
        created_at: Creation timestamp
        author: Comment author information
    """
    id: int
    content: str
    created_at: datetime
    author: UserSearchResponse
    
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