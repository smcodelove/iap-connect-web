"""
User service for IAP Connect application.
Handles user-related business logic.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from fastapi import HTTPException, status
from typing import List, Optional
from ..models.user import User
from ..models.post import Post
from ..models.follow import Follow
from ..schemas.user import UserUpdate, UserResponse, UserSearchResponse


def get_user_by_id(user_id: int, db: Session) -> Optional[User]:
    """
    Get user by ID.
    
    Args:
        user_id: User ID
        db: Database session
        
    Returns:
        User or None: User if found, None otherwise
    """
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()


def update_user_profile(user: User, user_data: UserUpdate, db: Session) -> User:
    """
    Update user profile information.
    
    Args:
        user: Current user
        user_data: Updated user data
        db: Database session
        
    Returns:
        User: Updated user
    """
    update_data = user_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


def search_users(query: str, db: Session, limit: int = 20) -> List[User]:
    """
    Search users by username, full name, or specialty/college.
    
    Args:
        query: Search query string
        db: Database session
        limit: Maximum number of results
        
    Returns:
        List[User]: List of matching users
    """
    search_filter = or_(
        User.username.ilike(f"%{query}%"),
        User.full_name.ilike(f"%{query}%"),
        User.specialty.ilike(f"%{query}%"),
        User.college.ilike(f"%{query}%")
    )
    
    return db.query(User).filter(
        search_filter,
        User.is_active == True
    ).limit(limit).all()


def follow_user(follower: User, following_id: int, db: Session) -> bool:
    """
    Follow another user.
    
    Args:
        follower: User who wants to follow
        following_id: ID of user to follow
        db: Database session
        
    Returns:
        bool: True if successful
        
    Raises:
        HTTPException: If user not found or already following
    """
    if follower.id == following_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself"
        )
    
    # Check if target user exists
    target_user = get_user_by_id(following_id, db)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already following
    existing_follow = db.query(Follow).filter(
        Follow.follower_id == follower.id,
        Follow.following_id == following_id
    ).first()
    
    if existing_follow:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already following this user"
        )
    
    # Create follow relationship
    new_follow = Follow(follower_id=follower.id, following_id=following_id)
    db.add(new_follow)
    db.commit()
    
    return True


def unfollow_user(follower: User, following_id: int, db: Session) -> bool:
    """
    Unfollow a user.
    
    Args:
        follower: User who wants to unfollow
        following_id: ID of user to unfollow
        db: Database session
        
    Returns:
        bool: True if successful
        
    Raises:
        HTTPException: If not following the user
    """
    follow_relationship = db.query(Follow).filter(
        Follow.follower_id == follower.id,
        Follow.following_id == following_id
    ).first()
    
    if not follow_relationship:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not following this user"
        )
    
    db.delete(follow_relationship)
    db.commit()
    
    return True


def get_user_stats(user: User, db: Session) -> dict:
    """
    Get user statistics (followers, following, posts count).
    
    Args:
        user: User to get stats for
        db: Database session
        
    Returns:
        dict: User statistics
    """
    followers_count = db.query(Follow).filter(Follow.following_id == user.id).count()
    following_count = db.query(Follow).filter(Follow.follower_id == user.id).count()
    posts_count = db.query(Post).filter(Post.user_id == user.id).count()
    
    return {
        "followers_count": followers_count,
        "following_count": following_count,
        "posts_count": posts_count
    }