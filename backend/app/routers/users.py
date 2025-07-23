"""
User routes for IAP Connect application.
Handles user profile management and social features.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from ..config.database import get_db
from ..schemas.user import UserUpdate, UserResponse, UserSearchResponse
from ..services.user_service import (
    get_user_by_id, update_user_profile, search_users, 
    follow_user, unfollow_user, get_user_stats
)
from ..utils.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile/{user_id}", response_model=UserResponse)
def get_user_profile(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get user profile by user ID.
    
    - **user_id**: ID of the user to retrieve
    
    Returns complete user profile with statistics.
    """
    user = get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user stats
    stats = get_user_stats(user, db)
    
    # Create response
    user_response = UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        user_type=user.user_type,
        bio=user.bio,
        specialty=user.specialty,
        college=user.college,
        profile_picture_url=user.profile_picture_url,
        is_active=user.is_active,
        created_at=user.created_at,
        **stats
    )
    
    return user_response


@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile.
    
    - **full_name**: Updated full name (optional)
    - **bio**: Updated biography (optional)
    - **specialty**: Updated specialty for doctors (optional)
    - **college**: Updated college for students (optional)
    
    Returns updated user profile.
    """
    updated_user = update_user_profile(current_user, user_data, db)
    
    # Get user stats
    stats = get_user_stats(updated_user, db)
    
    # Create response
    user_response = UserResponse(
        id=updated_user.id,
        username=updated_user.username,
        email=updated_user.email,
        full_name=updated_user.full_name,
        user_type=updated_user.user_type,
        bio=updated_user.bio,
        specialty=updated_user.specialty,
        college=updated_user.college,
        profile_picture_url=updated_user.profile_picture_url,
        is_active=updated_user.is_active,
        created_at=updated_user.created_at,
        **stats
    )
    
    return user_response


@router.get("/search", response_model=List[UserSearchResponse])
def search_users_endpoint(
    q: str = Query(..., description="Search query"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Search users by username, full name, specialty, or college.
    
    - **q**: Search query string
    
    Returns list of matching users.
    """
    users = search_users(q, db)
    
    return [
        UserSearchResponse(
            id=user.id,
            username=user.username,
            full_name=user.full_name,
            user_type=user.user_type,
            profile_picture_url=user.profile_picture_url,
            specialty=user.specialty,
            college=user.college
        )
        for user in users
    ]


@router.post("/follow/{user_id}")
def follow_user_endpoint(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Follow another user.
    
    - **user_id**: ID of user to follow
    
    Creates a follow relationship between current user and target user.
    """
    follow_user(current_user, user_id, db)
    return {"message": "User followed successfully"}


@router.delete("/follow/{user_id}")
def unfollow_user_endpoint(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Unfollow a user.
    
    - **user_id**: ID of user to unfollow
    
    Removes follow relationship between current user and target user.
    """
    unfollow_user(current_user, user_id, db)
    return {"message": "User unfollowed successfully"}