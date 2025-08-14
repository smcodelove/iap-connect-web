# backend/app/routers/users.py - FIXED VERSION
"""
User management routes for IAP Connect application.
FIXED: Real-time calculation of followers/following counts from database.
ADDED: Missing /{user_id} route for frontend compatibility.
FIXED: Added missing /profile endpoint that was causing 422 errors.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
import os
import uuid
from datetime import datetime

from ..config.database import get_db
from ..models.user import User, Follow
from ..models.post import Post
from ..schemas.user import (
    UserResponse, UserUpdate, UserPublic, UserSearchResponse, 
    CompleteProfile, FileUploadResponse, FollowResponse
)
from ..utils.dependencies import get_current_user
from ..services.file_service import upload_file, allowed_file

router = APIRouter(prefix="/users", tags=["users"])


def calculate_user_stats(user_id: int, db: Session) -> dict:
    """
    Calculate real-time user statistics from database.
    
    Args:
        user_id: User ID to calculate stats for
        db: Database session
        
    Returns:
        dict: Real statistics
    """
    # Calculate followers count (users who follow this user)
    followers_count = db.query(Follow).filter(Follow.following_id == user_id).count()
    
    # Calculate following count (users this user follows)
    following_count = db.query(Follow).filter(Follow.follower_id == user_id).count()
    
    # Calculate posts count
    posts_count = db.query(Post).filter(Post.user_id == user_id).count()
    
    return {
        "followers_count": followers_count,
        "following_count": following_count,
        "posts_count": posts_count
    }


def sync_user_stats(user: User, db: Session) -> User:
    """
    Sync user statistics with real database counts.
    
    Args:
        user: User object to sync
        db: Database session
        
    Returns:
        User: Updated user object
    """
    stats = calculate_user_stats(user.id, db)
    
    # Update user object with real counts
    user.followers_count = stats["followers_count"]
    user.following_count = stats["following_count"]
    user.posts_count = stats["posts_count"]
    
    # Save to database
    db.commit()
    db.refresh(user)
    
    return user


# ==============================================
# FIXED: MISSING /profile ENDPOINT ADDED
# ==============================================

@router.get("/profile")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's own profile with REAL statistics.
    
    This endpoint was MISSING and causing 422 errors.
    Frontend expects: GET /api/v1/users/profile
    """
    try:
        print(f"📊 Getting profile for user: {current_user.username} (ID: {current_user.id})")
        
        # FIXED: Sync current user stats with real database counts
        current_user = sync_user_stats(current_user, db)
        
        # Get user's own posts count for verification
        posts_count = db.query(Post).filter(Post.user_id == current_user.id).count()
        followers_count = db.query(Follow).filter(Follow.following_id == current_user.id).count()
        following_count = db.query(Follow).filter(Follow.follower_id == current_user.id).count()
        
        print(f"📊 Real stats: {followers_count} followers, {following_count} following, {posts_count} posts")
        
        # Create response with all required fields
        profile_data = {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "user_type": current_user.user_type.value,
            "bio": current_user.bio,
            "specialty": current_user.specialty,
            "college": current_user.college,
            "profile_picture_url": current_user.profile_picture_url,
            "is_active": current_user.is_active,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else None,
            
            # Real-time statistics
            "followers_count": followers_count,
            "following_count": following_count,
            "posts_count": posts_count,
            
            # Additional fields
            "display_info": current_user.specialty or current_user.college or f"{current_user.user_type.value.title()}",
            "is_verified": getattr(current_user, 'is_verified', False),
            "badge": getattr(current_user, 'badge', None),
            
            # Self profile indicators
            "is_own_profile": True,
            "is_following": False,  # Can't follow yourself
            "is_follower": False,   # Can't be follower of yourself
        }
        
        print(f"✅ Profile data prepared for user {current_user.username}")
        return profile_data
        
    except Exception as e:
        print(f"❌ Error in get_my_profile: {str(e)}")
        import traceback
        print(f"📋 Traceback: {traceback.format_exc()}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user profile: {str(e)}"
        )


# ==============================================
# NEW: MISSING ROUTE ADDED FOR FRONTEND
# ==============================================

@router.get("/{user_id}", response_model=CompleteProfile)
async def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user profile by user ID (simplified route for frontend compatibility).
    
    This is the route that the frontend expects: GET /api/v1/users/{user_id}
    Maps to the same functionality as /users/profile/{user_id} but with simpler path.
    """
    print(f"🎯 Frontend requested user profile for ID: {user_id}")
    
    # Get user profile
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        print(f"❌ User {user_id} not found in database")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    print(f"✅ Found user: {user.full_name} (@{user.username})")
    
    # FIXED: Sync user stats with real database counts
    user = sync_user_stats(user, db)
    
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
    
    # Convert to response format with REAL stats
    profile_data = user.to_dict()
    profile_data['is_following'] = is_following
    profile_data['is_follower'] = is_follower
    
    # FIXED: Convert posts manually instead of using to_dict()
    profile_data['recent_posts'] = []
    for post in recent_posts:
        post_data = {
            "id": post.id,
            "content": post.content,
            "media_urls": post.media_urls or [],
            "hashtags": post.hashtags or [],
            "likes_count": post.likes_count,
            "comments_count": post.comments_count,
            "shares_count": post.shares_count,
            "is_trending": post.is_trending,
            "created_at": post.created_at.isoformat() if post.created_at else None,
            "updated_at": post.updated_at.isoformat() if post.updated_at else None
        }
        profile_data['recent_posts'].append(post_data)
    
    print(f"📊 User {user_id} profile served: {user.followers_count} followers, {user.following_count} following, {user.posts_count} posts")
    
    return profile_data


# ==============================================
# EXISTING ROUTES (UNCHANGED)
# ==============================================

@router.get("/profile/{user_id}", response_model=CompleteProfile)
async def get_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get complete user profile by user ID with REAL statistics.
    Returns user info with follow status and recent posts.
    """
    # Get user profile
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # FIXED: Sync user stats with real database counts
    user = sync_user_stats(user, db)
    
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
    
    # Convert to response format with REAL stats
    profile_data = user.to_dict()
    profile_data['is_following'] = is_following
    profile_data['is_follower'] = is_follower
    profile_data['recent_posts'] = [post.to_dict() for post in recent_posts]
    
    print(f"📊 User {user_id} stats: {user.followers_count} followers, {user.following_count} following, {user.posts_count} posts")
    
    return profile_data


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
    
    # FIXED: Sync stats after update
    current_user = sync_user_stats(current_user, db)
    
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
    
    # FIXED: Sync stats for all search results
    for user in users:
        sync_user_stats(user, db)
    
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
    FIXED: Real-time count calculation.
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
    db.commit()

    # NEW: Create follow notification
    try:
        from ..models.notification import Notification, NotificationType
        
        notification = Notification(
            recipient_id=user_id,
            sender_id=current_user.id,
            type=NotificationType.FOLLOW,
            title="New Follower",
            message=f"{current_user.full_name} started following you",
            data=f'{{"user_id": {current_user.id}, "action": "follow"}}'
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        print(f"✅ Created follow notification for user {user_id}")
    except Exception as e:
        print(f"⚠️ Failed to create follow notification: {e}")
    
    # FIXED: Calculate real counts after follow
    current_user = sync_user_stats(current_user, db)
    target_user = sync_user_stats(target_user, db)
    
    print(f"✅ {current_user.username} followed {target_user.username}. Target user now has {target_user.followers_count} followers")
    
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
    FIXED: Real-time count calculation.
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
    db.commit()
    
    # FIXED: Calculate real counts after unfollow
    current_user = sync_user_stats(current_user, db)
    target_user = sync_user_stats(target_user, db)
    
    print(f"✅ {current_user.username} unfollowed {target_user.username}. Target user now has {target_user.followers_count} followers")
    
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
    
    # FIXED: Sync stats for all followers
    for follower in followers:
        sync_user_stats(follower, db)
    
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
    
    # FIXED: Sync stats for all following users
    for followed_user in following:
        sync_user_stats(followed_user, db)
    
    return [UserPublic(**user.to_dict()) for user in following]


@router.get("/stats/{user_id}", response_model=dict)
async def get_user_stats_endpoint(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    NEW: Get real-time user statistics endpoint.
    Returns current followers, following, and posts counts.
    """
    # Check if user exists
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Calculate and return real stats
    stats = calculate_user_stats(user_id, db)
    
    # Also sync the user object
    sync_user_stats(user, db)
    
    print(f"📊 Stats for user {user_id}: {stats}")
    
    return {
        "user_id": user_id,
        "username": user.username,
        "full_name": user.full_name,
        **stats,
        "last_updated": datetime.utcnow().isoformat()
    }


@router.get("/trending")
async def get_trending_users(
    limit: int = 15,
    db: Session = Depends(get_db)
):
    """Get trending users based on followers and posts"""
    # Get users sorted by followers + posts
    users = db.query(User).order_by(
        (User.followers_count + User.posts_count).desc()
    ).limit(limit).all()
    
    return {
        "success": True,
        "users": [user.to_dict() for user in users]
    }