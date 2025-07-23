"""
User schemas for IAP Connect application.
Handles request/response validation for user endpoints.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from ..models.user import UserType


class UserBase(BaseModel):
    """Base user schema with common fields."""
    username: str
    email: EmailStr
    full_name: str
    user_type: UserType
    bio: Optional[str] = None
    specialty: Optional[str] = None  # For doctors
    college: Optional[str] = None    # For students


class UserCreate(UserBase):
    """User creation schema."""
    password: str


class UserUpdate(BaseModel):
    """
    User profile update schema.
    
    Attributes:
        full_name: Updated full name
        bio: Updated biography
        specialty: Updated specialty (for doctors)
        college: Updated college (for students)
    """
    full_name: Optional[str] = None
    bio: Optional[str] = None
    specialty: Optional[str] = None
    college: Optional[str] = None


class UserResponse(UserBase):
    """
    User response schema for API responses.
    
    Attributes:
        id: User ID
        profile_picture_url: URL to profile picture
        is_active: Account status
        created_at: Account creation timestamp
        followers_count: Number of followers
        following_count: Number of users being followed
        posts_count: Number of posts created
    """
    id: int
    profile_picture_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    followers_count: Optional[int] = 0
    following_count: Optional[int] = 0
    posts_count: Optional[int] = 0
    
    class Config:
        from_attributes = True


class UserSearchResponse(BaseModel):
    """
    User search result schema.
    
    Attributes:
        id: User ID
        username: Username
        full_name: Full name
        user_type: User type
        profile_picture_url: Profile picture URL
        specialty: Specialty (for doctors)
        college: College (for students)
    """
    id: int
    username: str
    full_name: str
    user_type: UserType
    profile_picture_url: Optional[str] = None
    specialty: Optional[str] = None
    college: Optional[str] = None
    
    class Config:
        from_attributes = True