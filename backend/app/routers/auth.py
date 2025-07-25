# backend/app/routers/auth.py
"""
Authentication routes for IAP Connect application.
Handles user registration, login, and authentication endpoints.
FIXED: UserResponse schema with proper field handling
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..config.database import get_db
from ..schemas.auth import UserRegister, UserLogin, Token
from ..schemas.user import UserResponse
from ..services.auth_service import register_user, authenticate_user, generate_access_token
from ..services.user_service import get_user_stats
from ..utils.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    - **username**: Unique username (required)
    - **email**: Valid email address (required)
    - **password**: Password (required)
    - **full_name**: User's full name (required)
    - **user_type**: Either "doctor" or "student" (required)
    - **bio**: Optional biography
    - **specialty**: Required for doctors
    - **college**: Required for students
    
    Returns user profile with account details.
    """
    new_user = register_user(user_data, db)
    
    # Get user stats for response
    stats = get_user_stats(new_user, db)
    
    # FIXED: Create response with proper fields
    user_response = UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        full_name=new_user.full_name,
        user_type=new_user.user_type,
        bio=new_user.bio,
        specialty=new_user.specialty,
        college=new_user.college,
        profile_picture_url=new_user.profile_picture_url,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at or new_user.created_at,  # FIXED: Handle None updated_at
        display_info=new_user.specialty or new_user.college or f"{new_user.user_type.value.title()}",  # FIXED: Add display_info
        **stats
    )
    
    return user_response


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password.
    
    - **email**: Registered email address
    - **password**: Account password
    
    Returns JWT access token for API authentication.
    """
    user = authenticate_user(login_data, db)
    access_token = generate_access_token(user)
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
def logout():
    """
    Logout user (client-side token removal).
    
    Since JWT tokens are stateless, logout is handled on the client side
    by removing the token from storage.
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Get current authenticated user's profile.
    
    Returns complete user profile with statistics.
    FIXED: Proper field handling for UserResponse
    """
    # Get user stats for response
    stats = get_user_stats(current_user, db)
    
    # FIXED: Create response with all required fields
    user_response = UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        user_type=current_user.user_type,
        bio=current_user.bio,
        specialty=current_user.specialty,
        college=current_user.college,
        profile_picture_url=current_user.profile_picture_url,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at or current_user.created_at,  # FIXED: Handle None updated_at
        display_info=current_user.specialty or current_user.college or f"{current_user.user_type.value.title()}",  # FIXED: Add display_info
        **stats
    )
    
    return user_response