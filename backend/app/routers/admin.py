"""
Admin routes for IAP Connect application.
Handles administrative functions for user and content management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List
from ..config.database import get_db
from ..schemas.user import UserSearchResponse
from ..models.user import User
from ..models.post import Post
from ..models.comment import Comment
from ..models.like import Like
from ..models.follow import Follow
from ..services.post_service import get_post_by_id
from ..utils.dependencies import get_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserSearchResponse])
def get_all_users(
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    search: str = Query(None, description="Search users by name or email"),
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all users (admin only).
    
    - **page**: Page number (default: 1)
    - **size**: Number of users per page (default: 50, max: 100)
    - **search**: Optional search query for filtering users
    
    Returns paginated list of all users in the system.
    """
    query = db.query(User)
    
    if search:
        query = query.filter(
            (User.full_name.ilike(f"%{search}%")) |
            (User.email.ilike(f"%{search}%")) |
            (User.username.ilike(f"%{search}%"))
        )
    
    users = query.order_by(desc(User.created_at)).offset((page - 1) * size).limit(size).all()
    
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


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a user account (admin only).
    
    - **user_id**: User ID to delete
    
    Permanently removes user and all associated data (posts, comments, likes, follows).
    """
    user_to_delete = db.query(User).filter(User.id == user_id).first()
    if not user_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from deleting themselves
    if user_to_delete.id == admin_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own admin account"
        )
    
    db.delete(user_to_delete)
    db.commit()
    
    return {"message": f"User {user_to_delete.username} deleted successfully"}


@router.delete("/posts/{post_id}")
def delete_post_admin(
    post_id: int,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a post (admin only).
    
    - **post_id**: Post ID to delete
    
    Removes post and all associated data (comments, likes).
    """
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    db.delete(post)
    db.commit()
    
    return {"message": f"Post {post_id} deleted successfully"}


@router.get("/dashboard")
def get_admin_dashboard(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get admin dashboard statistics.
    
    Returns comprehensive platform statistics including:
    - Total users by type
    - Total posts and engagement metrics
    - Recent activity summary
    """
    # User statistics
    total_users = db.query(User).count()
    total_doctors = db.query(User).filter(User.user_type == "doctor").count()
    total_students = db.query(User).filter(User.user_type == "student").count()
    total_admins = db.query(User).filter(User.user_type == "admin").count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Content statistics
    total_posts = db.query(Post).count()
    total_comments = db.query(Comment).count()
    total_likes = db.query(Like).count()
    total_follows = db.query(Follow).count()
    
    # Engagement metrics
    avg_likes_per_post = db.query(func.avg(Post.likes_count)).scalar() or 0
    avg_comments_per_post = db.query(func.avg(Post.comments_count)).scalar() or 0
    
    # Top engaging posts (last 30 days)
    top_posts = db.query(Post).order_by(
        desc(Post.likes_count + Post.comments_count)
    ).limit(5).all()
    
    # Most followed users
    most_followed = db.query(
        User.id,
        User.username,
        User.full_name,
        func.count(Follow.follower_id).label('followers_count')
    ).join(
        Follow, User.id == Follow.following_id
    ).group_by(
        User.id, User.username, User.full_name
    ).order_by(
        desc('followers_count')
    ).limit(5).all()
    
    return {
        "user_stats": {
            "total_users": total_users,
            "total_doctors": total_doctors,
            "total_students": total_students,
            "total_admins": total_admins,
            "active_users": active_users
        },
        "content_stats": {
            "total_posts": total_posts,
            "total_comments": total_comments,
            "total_likes": total_likes,
            "total_follows": total_follows
        },
        "engagement_metrics": {
            "avg_likes_per_post": round(float(avg_likes_per_post), 2),
            "avg_comments_per_post": round(float(avg_comments_per_post), 2)
        },
        "top_posts": [
            {
                "id": post.id,
                "content": post.content[:100] + "..." if len(post.content) > 100 else post.content,
                "likes_count": post.likes_count,
                "comments_count": post.comments_count,
                "author": post.author.username if post.author else "Unknown"
            }
            for post in top_posts
        ],
        "most_followed_users": [
            {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "followers_count": user.followers_count
            }
            for user in most_followed
        ]
    }