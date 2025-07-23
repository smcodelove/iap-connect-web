"""
Authentication schemas for IAP Connect application.
Handles request/response validation for auth endpoints.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from ..models.user import UserType


class UserRegister(BaseModel):
    """
    User registration request schema.
    
    Attributes:
        username: Unique username for the user
        email: User's email address
        password: Plain text password (will be hashed)
        full_name: User's full name
        user_type: Type of user (doctor, student)
        bio: Optional user biography
        specialty: Medical specialty (for doctors only)
        college: Educational institution (for students only)
    """
    username: str
    email: EmailStr
    password: str
    full_name: str
    user_type: UserType
    bio: Optional[str] = None
    specialty: Optional[str] = None  # For doctors
    college: Optional[str] = None    # For students


class UserLogin(BaseModel):
    """
    User login request schema.
    
    Attributes:
        email: User's email address
        password: Plain text password
    """
    email: EmailStr
    password: str


class Token(BaseModel):
    """
    JWT token response schema.
    
    Attributes:
        access_token: JWT access token string
        token_type: Token type (always "bearer")
    """
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    JWT token payload schema.
    
    Attributes:
        user_id: User ID from token payload
        email: User email from token payload
    """
    user_id: Optional[int] = None
    email: Optional[str] = None