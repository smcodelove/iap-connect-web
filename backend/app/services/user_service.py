"""
User service for IAP Connect application.
Handles user-related business logic.
UPDATED: Enhanced with additional helper functions while keeping all existing code intact.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
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


# NEW: Additional helper functions for enhanced functionality
def check_user_following(follower_id: int, following_id: int, db: Session) -> bool:
    """
    Check if a user is following another user (helper function for posts router).
    
    Args:
        follower_id: ID of the user who might be following
        following_id: ID of the user being followed
        db: Database session
        
    Returns:
        bool: True if following, False otherwise
    """
    if follower_id == following_id:
        return False  # User cannot follow themselves
    
    follow = db.query(Follow).filter(
        and_(
            Follow.follower_id == follower_id,
            Follow.following_id == following_id
        )
    ).first()
    
    return follow is not None


def get_mutual_followers(user1_id: int, user2_id: int, db: Session) -> List[User]:
    """
    Get mutual followers between two users.
    
    Args:
        user1_id: First user ID
        user2_id: Second user ID
        db: Database session
        
    Returns:
        List[User]: List of mutual follower user objects
    """
    # Get followers of user1
    user1_followers = db.query(Follow.follower_id).filter(
        Follow.following_id == user1_id
    ).subquery()
    
    # Get followers of user2
    user2_followers = db.query(Follow.follower_id).filter(
        Follow.following_id == user2_id
    ).subquery()
    
    # Find mutual followers
    mutual_follower_ids = db.query(user1_followers.c.follower_id).intersect(
        db.query(user2_followers.c.follower_id)
    ).all()
    
    # Get user objects for mutual followers
    mutual_users = []
    for (follower_id,) in mutual_follower_ids:
        user = db.query(User).filter(User.id == follower_id).first()
        if user:
            mutual_users.append(user)
    
    return mutual_users


def get_follow_suggestions(user: User, db: Session, limit: int = 10) -> List[User]:
    """
    Get follow suggestions for a user based on mutual connections.
    
    Args:
        user: User to get suggestions for
        db: Database session
        limit: Maximum number of suggestions
        
    Returns:
        List[User]: List of suggested users to follow
    """
    # Get users that current user is following
    following_ids = db.query(Follow.following_id).filter(
        Follow.follower_id == user.id
    ).subquery()
    
    # Get users followed by people the current user follows
    # (second-degree connections)
    suggested_follows = db.query(Follow.following_id).filter(
        and_(
            Follow.follower_id.in_(following_ids),
            Follow.following_id != user.id,  # Don't suggest self
            ~Follow.following_id.in_(following_ids)  # Don't suggest already following
        )
    ).group_by(Follow.following_id).limit(limit).all()
    
    # Get user objects for suggestions
    suggestions = []
    for (user_id,) in suggested_follows:
        suggested_user = db.query(User).filter(User.id == user_id).first()
        if suggested_user:
            suggestions.append(suggested_user)
    
    return suggestions


def get_user_activity_stats(user: User, db: Session) -> dict:
    """
    Get comprehensive activity statistics for a user.
    
    Args:
        user: User to get stats for
        db: Database session
        
    Returns:
        dict: Activity statistics
    """
    from ..models.like import Like
    from ..models.comment import Comment
    from datetime import datetime, timedelta
    
    # Basic stats (using existing function)
    basic_stats = get_user_stats(user, db)
    
    # Engagement stats
    total_likes_received = db.query(Like).join(Post).filter(
        Post.user_id == user.id
    ).count()
    
    total_comments_made = db.query(Comment).filter(
        Comment.user_id == user.id
    ).count()
    
    # Recent activity (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    recent_posts = db.query(Post).filter(
        and_(
            Post.user_id == user.id,
            Post.created_at >= thirty_days_ago
        )
    ).count()
    
    recent_comments = db.query(Comment).filter(
        and_(
            Comment.user_id == user.id,
            Comment.created_at >= thirty_days_ago
        )
    ).count()
    
    # Combine all stats
    activity_stats = {
        **basic_stats,  # Include existing stats
        "total_likes_received": total_likes_received,
        "total_comments_made": total_comments_made,
        "recent_posts": recent_posts,
        "recent_comments": recent_comments,
        "engagement_rate": round(
            (total_likes_received + total_comments_made) / max(basic_stats["posts_count"], 1), 2
        )
    }
    
    return activity_stats


def update_user_last_active(user: User, db: Session) -> None:
    """
    Update user's last active timestamp.
    
    Args:
        user: User to update
        db: Database session
    """
    from datetime import datetime
    
    user.last_active = datetime.utcnow()
    db.commit()


def get_popular_users(db: Session, limit: int = 10, user_type: str = None) -> List[User]:
    """
    Get popular users based on follower count and engagement.
    
    Args:
        db: Database session
        limit: Number of users to return
        user_type: Filter by user type (doctor/student)
        
    Returns:
        List[User]: List of popular users
    """
    from sqlalchemy import desc
    from ..models.user import UserType
    
    query = db.query(User).join(Follow, Follow.following_id == User.id, isouter=True)
    
    if user_type:
        if user_type == "doctor":
            query = query.filter(User.user_type == UserType.DOCTOR)
        elif user_type == "student":
            query = query.filter(User.user_type == UserType.STUDENT)
    
    popular_users = query.group_by(User.id).order_by(
        desc(func.count(Follow.follower_id))
    ).limit(limit).all()
    
    return popular_users


def search_users_advanced(
    query: str, 
    db: Session, 
    current_user: User = None,
    user_type: str = None,
    page: int = 1, 
    size: int = 20
) -> tuple:
    """
    Advanced user search with filters and ranking.
    
    Args:
        query: Search query
        db: Database session
        current_user: Current user for personalization
        user_type: Filter by user type
        page: Page number
        size: Page size
        
    Returns:
        tuple: (users, total_count)
    """
    from sqlalchemy import case, desc
    from ..models.user import UserType
    
    # Base query (using existing search logic but enhanced)
    search_filter = or_(
        User.username.ilike(f"%{query}%"),
        User.full_name.ilike(f"%{query}%"),
        User.specialty.ilike(f"%{query}%"),
        User.college.ilike(f"%{query}%")
    )
    
    search_query = db.query(User).filter(
        search_filter,
        User.is_active == True
    )
    
    # Add user type filter
    if user_type:
        if user_type == "doctor":
            search_query = search_query.filter(User.user_type == UserType.DOCTOR)
        elif user_type == "student":
            search_query = search_query.filter(User.user_type == UserType.STUDENT)
    
    # Exclude current user from results
    if current_user:
        search_query = search_query.filter(User.id != current_user.id)
    
    # Add ranking based on relevance and popularity
    search_query = search_query.outerjoin(Follow, Follow.following_id == User.id)
    
    # Calculate relevance score
    relevance_score = case(
        (User.full_name.ilike(f"{query}%"), 10),  # Name starts with query
        (User.username.ilike(f"{query}%"), 8),    # Username starts with query
        (User.specialty.ilike(f"%{query}%"), 5),  # Specialty contains query
        (User.college.ilike(f"%{query}%"), 3),    # College contains query
        else_=1
    )
    
    # Order by relevance and follower count
    search_query = search_query.group_by(User.id).order_by(
        desc(relevance_score),
        desc(func.count(Follow.follower_id)),
        desc(User.created_at)
    )
    
    # Get total count
    total_count = search_query.count()
    
    # Apply pagination
    users = search_query.offset((page - 1) * size).limit(size).all()
    
    return users, total_count


def get_user_followers(user_id: int, db: Session, page: int = 1, size: int = 20) -> tuple:
    """
    Get followers of a user with pagination.
    
    Args:
        user_id: User ID to get followers for
        db: Database session
        page: Page number
        size: Page size
        
    Returns:
        tuple: (followers, total_count)
    """
    followers_query = db.query(User).join(
        Follow, Follow.follower_id == User.id
    ).filter(Follow.following_id == user_id)
    
    total_count = followers_query.count()
    followers = followers_query.offset((page - 1) * size).limit(size).all()
    
    return followers, total_count


def get_user_following(user_id: int, db: Session, page: int = 1, size: int = 20) -> tuple:
    """
    Get users that a user is following with pagination.
    
    Args:
        user_id: User ID to get following for
        db: Database session
        page: Page number
        size: Page size
        
    Returns:
        tuple: (following, total_count)
    """
    following_query = db.query(User).join(
        Follow, Follow.following_id == User.id
    ).filter(Follow.follower_id == user_id)
    
    total_count = following_query.count()
    following = following_query.offset((page - 1) * size).limit(size).all()
    
    return following, total_count