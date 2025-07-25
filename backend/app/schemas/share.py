"""
Share schemas for IAP Connect application.
Handles request/response validation for share endpoints.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .user import UserSearchResponse


class ShareCreate(BaseModel):
    """
    Share creation schema.
    
    Attributes:
        share_type: Type of share (external, internal, copy_link)
    """
    share_type: Optional[str] = "external"


class ShareResponse(BaseModel):
    """
    Share response schema.
    
    Attributes:
        success: Whether share was successful
        shared: Share status
        shares_count: Updated shares count
        share_type: Type of share performed
    """
    success: bool
    shared: bool
    shares_count: int
    share_type: str


class ShareDetailResponse(BaseModel):
    """
    Share detail response schema.
    
    Attributes:
        id: Share ID
        share_type: Type of share
        created_at: Share timestamp
        user: User who shared
    """
    id: int
    share_type: str
    created_at: datetime
    user: UserSearchResponse
    
    class Config:
        from_attributes = True