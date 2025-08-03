# backend/app/schemas/auth.py - FIXED VERSION
"""
Authentication schemas for IAP Connect application.
UPDATED: Made user_type optional with default to doctor
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from ..models.user import UserType


class UserRegister(BaseModel):
    """
    User registration request schema.
    UPDATED: user_type defaults to doctor, admin blocked
    
    Attributes:
        username: Unique username for the user
        email: User's email address
        password: Plain text password (will be hashed)
        full_name: User's full name
        user_type: Type of user (defaults to doctor)
        bio: Optional user biography
        specialty: Medical specialty (optional)
        college: Educational institution (optional)
    """
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=100)
    user_type: Optional[UserType] = UserType.DOCTOR  # DEFAULT TO DOCTOR
    bio: Optional[str] = Field(None, max_length=500)
    specialty: Optional[str] = Field(None, max_length=100)  # Optional for doctors
    college: Optional[str] = Field(None, max_length=100)    # Optional for students
    
    @validator('user_type', pre=True)
    def validate_user_type(cls, v):
        """Validate and normalize user_type"""
        # If no user_type provided, default to doctor
        if v is None:
            return UserType.DOCTOR
            
        # Handle string input
        if isinstance(v, str):
            v = v.lower()
            if v == 'doctor':
                return UserType.DOCTOR
            elif v == 'student':
                return UserType.STUDENT
            elif v == 'admin':
                # BLOCK admin registration through public endpoint
                raise ValueError("Admin accounts can only be created by system administrators")
            else:
                raise ValueError("user_type must be 'doctor' or 'student'")
        
        # Handle enum input
        if isinstance(v, UserType):
            if v == UserType.ADMIN:
                raise ValueError("Admin accounts can only be created by system administrators")
            return v
            
        raise ValueError("Invalid user_type format")
    
    @validator('specialty')
    def validate_specialty(cls, v, values):
        """Specialty validation - optional for all users"""
        # No strict validation - users can add specialty later
        return v
    
    @validator('college') 
    def validate_college(cls, v, values):
        """College validation - optional for all users"""
        # No strict validation - users can add college later
        return v


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