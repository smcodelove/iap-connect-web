# schemas/user.py
"""
User Pydantic schemas for IAP Connect application.
Handles all user-related request/response models for profile management.
"""

from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserType(str, Enum):
    """User type enumeration"""
    DOCTOR = "doctor"
    STUDENT = "student"
    ADMIN = "admin"


# Base user schema
class UserBase(BaseModel):
    """Base user schema with common fields"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    user_type: UserType
    full_name: str = Field(..., min_length=2, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    specialty: Optional[str] = Field(None, max_length=100)  # For doctors
    college: Optional[str] = Field(None, max_length=100)    # For students


# User creation schema
class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=6, max_length=100)
    
    @validator('specialty')
    def specialty_only_for_doctors(cls, v, values):
        if values.get('user_type') == UserType.DOCTOR and not v:
            raise ValueError('Specialty is required for doctors')
        if values.get('user_type') != UserType.DOCTOR and v:
            raise ValueError('Specialty can only be set for doctors')
        return v
    
    @validator('college')
    def college_only_for_students(cls, v, values):
        if values.get('user_type') == UserType.STUDENT and not v:
            raise ValueError('College is required for students')
        if values.get('user_type') != UserType.STUDENT and v:
            raise ValueError('College can only be set for students')
        return v


# User update schema
class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    specialty: Optional[str] = Field(None, max_length=100)  # For doctors
    college: Optional[str] = Field(None, max_length=100)    # For students
    profile_picture_url: Optional[str] = Field(None, max_length=500)


# User response schema
class UserResponse(BaseModel):
    """Schema for user profile responses"""
    id: int
    username: str
    email: str
    user_type: UserType
    full_name: str
    bio: Optional[str]
    profile_picture_url: Optional[str]
    specialty: Optional[str]
    college: Optional[str]
    followers_count: int
    following_count: int
    posts_count: int
    display_info: str
    is_active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Public user profile schema (limited info)
class UserPublic(BaseModel):
    """Schema for public user profiles (search results, etc.)"""
    id: int
    username: str
    full_name: str
    bio: Optional[str]
    profile_picture_url: Optional[str]
    user_type: UserType
    display_info: str
    followers_count: int
    following_count: int
    posts_count: int
    is_following: Optional[bool] = False  # Will be set based on current user

    class Config:
        from_attributes = True


# User search response schema
class UserSearchResponse(BaseModel):
    """Schema for user search results"""
    users: List[UserPublic]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool


# Follow schemas
class FollowResponse(BaseModel):
    """Schema for follow action responses"""
    id: int
    follower_id: int
    following_id: int
    created_at: datetime
    follower: UserPublic
    following: UserPublic

    class Config:
        from_attributes = True


# Profile stats schema
class ProfileStats(BaseModel):
    """Schema for user profile statistics"""
    posts_count: int
    followers_count: int
    following_count: int
    likes_received: int
    comments_made: int


# Complete profile schema with stats
class CompleteProfile(UserResponse):
    """Complete user profile with additional statistics"""
    is_following: Optional[bool] = False
    is_follower: Optional[bool] = False
    recent_posts: Optional[List] = []  # Will be populated with post data
    
    class Config:
        from_attributes = True


# File upload response schema
class FileUploadResponse(BaseModel):
    """Schema for file upload responses (profile pictures)"""
    filename: str
    file_url: str
    file_size: int
    uploaded_at: datetime