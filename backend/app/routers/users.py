# routers/users.py
"""
User management routes for IAP Connect application.
Handles all user profile related endpoints including follow/unfollow functionality.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
import os
import uuid
from datetime import datetime

from app.config.database import get_db
from app.models.user import User, Follow
from app.models.post import Post
from app.schemas.user import (
    UserResponse, UserUpdate, UserPublic, UserSearchResponse, 
    CompleteProfile, FileUploadResponse, FollowResponse
)
from app.utils.dependencies import get_current_user
from app.services.file_service import upload_file, allowed_file

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/profile/{user_id}", response_model=CompleteProfile)
async def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get complete user profile by user ID.
    Returns user info with follow status and recent posts.
    """
    # Get user profile
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check follow relationships
    is_following = False
    is_follower = False
    
    if current_user.id != user_id:
        # Check if current user follows this user
        follow_check = db.query(Follow).filter(
            Follow.follower_id == current_user.id,
            Follow.following_id == user_id
        ).first()
        is_following = follow_check is not None
        
        # Check if this user follows current user
        follower_check = db.query(Follow).filter(
            Follow.follower_id == user_id,
            Follow.following_id == current_user.id
        ).first()
        is_follower = follower_check is not None
    
    # Get recent posts (last 5)
    recent_posts = db.query(Post).filter(
        Post.user_id == user_id
    ).order_by(Post.created_at.desc()).limit(5).all()
    
    # Convert to response format
    profile_data = user.to_dict()
    profile_data['is_following'] = is_following
    profile_data['is_follower'] = is_follower
    profile_data['recent_posts'] = [post.to_dict() for post in recent_posts]
    
    return profile_data


@router.get("/profile", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get current user's own profile"""
    return current_user.to_dict()


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile information.
    Users can update name, bio, specialty/college, and profile picture.
    """
    # Validate specialty/college based on user type
    if current_user.user_type == "doctor" and user_update.specialty is not None:
        current_user.specialty = user_update.specialty
    elif current_user.user_type == "student" and user_update.college is not None:
        current_user.college = user_update.college
    
    # Update other fields
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.profile_picture_url is not None:
        current_user.profile_picture_url = user_update.profile_picture_url
    
    # Save changes
    db.commit()
    db.refresh(current_user)
    
    return current_user.to_dict()


@router.post("/upload-avatar", response_model=FileUploadResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload profile picture for current user.
    Accepts image files (jpg, jpeg, png, webp) up to 5MB.
    """
    # Validate file
    if not allowed_file(file.filename, ['jpg', 'jpeg', 'png', 'webp']):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPG, PNG, and WebP images are allowed."
        )
    
    # Check file size (5MB limit)
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 5MB."
        )
    
    # Reset file pointer
    await file.seek(0)
    
    try:
        # Upload file
        file_url = await upload_file(file, folder="avatars")
        
        # Update user profile picture
        current_user.profile_picture_url = file_url
        db.commit()
        
        return FileUploadResponse(
            filename=file.filename,
            file_url=file_url,
            file_size=file_size,
            uploaded_at=datetime.utcnow()
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        )


@router.get("/search", response_model=UserSearchResponse)
async def search_users(
    q: str = Query(..., min_length=2, description="Search query"),
    user_type: Optional[str] = Query(None, description="Filter by user type"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search users by name, username, or professional info.
    Supports filtering by user type and pagination.
    """
    # Build search query
    search_query = db.query(User).filter(User.is_active == True)
    
    # Add search conditions
    search_terms = or_(
        User.full_name.ilike(f"%{q}%"),
        User.username.ilike(f"%{q}%"),
        User.bio.ilike(f"%{q}%"),
        User.specialty.ilike(f"%{q}%"),
        User.college.ilike(f"%{q}%")
    )
    search_query = search_query.filter(search_terms)
    
    # Filter by user type if specified
    if user_type and user_type in ["doctor", "student"]:
        search_query = search_query.filter(User.user_type == user_type)
    
    # Exclude current user from results
    search_query = search_query.filter(User.id != current_user.id)
    
    # Get total count
    total = search_query.count()
    
    # Apply pagination
    offset = (page - 1) * per_page
    users = search_query.order_by(
        User.followers_count.desc(),  # Popular users first
        User.created_at.desc()
    ).offset(offset).limit(per_page).all()
    
    # Check follow status for each user
    user_ids = [user.id for user in users]
    following_ids = set()
    
    if user_ids:
        follows = db.query(Follow.following_id).filter(
            Follow.follower_id == current_user.id,
            Follow.following_id.in_(user_ids)
        ).all()
        following_ids = {follow[0] for follow in follows}
    
    # Convert to response format
    user_results = []
    for user in users:
        user_data = user.to_dict()
        user_data['is_following'] = user.id in following_ids
        user_results.append(UserPublic(**user_data))
    
    return UserSearchResponse(
        users=user_results,
        total=total,
        page=page,
        per_page=per_page,
        has_next=total > page * per_page,
        has_prev=page > 1
    )


@router.post("/follow/{user_id}", response_model=dict)
async def follow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Follow a user. Creates follow relationship and updates counters.
    """
    # Check if user exists
    target_user = db.query(User).filter(
        User.id == user_id, 
        User.is_active == True
    ).first()
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Can't follow yourself
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself"
        )
    
    # Check if already following
    existing_follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()
    
    if existing_follow:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already following this user"
        )
    
    # Create follow relationship
    follow = Follow(follower_id=current_user.id, following_id=user_id)
    db.add(follow)
    
    # Update counters
    current_user.following_count += 1
    target_user.followers_count += 1
    
    db.commit()
    
    return {
        "message": f"Successfully followed {target_user.full_name}",
        "following": True,
        "followers_count": target_user.followers_count
    }


@router.delete("/follow/{user_id}", response_model=dict)
async def unfollow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Unfollow a user. Removes follow relationship and updates counters.
    """
    # Check if user exists
    target_user = db.query(User).filter(
        User.id == user_id, 
        User.is_active == True
    ).first()
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Find follow relationship
    follow = db.query(Follow).filter(
        Follow.follower_id == current_user.id,
        Follow.following_id == user_id
    ).first()
    
    if not follow:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not following this user"
        )
    
    # Remove follow relationship
    db.delete(follow)
    
    # Update counters
    current_user.following_count = max(0, current_user.following_count - 1)
    target_user.followers_count = max(0, target_user.followers_count - 1)
    
    db.commit()
    
    return {
        "message": f"Successfully unfollowed {target_user.full_name}",
        "following": False,
        "followers_count": target_user.followers_count
    }


@router.get("/followers/{user_id}", response_model=List[UserPublic])
async def get_user_followers(
    user_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of users who follow the specified user"""
    # Check if user exists
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get followers with pagination
    offset = (page - 1) * per_page
    followers = db.query(User).join(
        Follow, Follow.follower_id == User.id
    ).filter(
        Follow.following_id == user_id,
        User.is_active == True
    ).offset(offset).limit(per_page).all()
    
    return [UserPublic(**user.to_dict()) for user in followers]


@router.get("/following/{user_id}", response_model=List[UserPublic])
async def get_user_following(
    user_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of users that the specified user follows"""
    # Check if user exists
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get following with pagination
    offset = (page - 1) * per_page
    following = db.query(User).join(
        Follow, Follow.following_id == User.id
    ).filter(
        Follow.follower_id == user_id,
        User.is_active == True
    ).offset(offset).limit(per_page).all()
    
    return [UserPublic(**user.to_dict()) for user in following]