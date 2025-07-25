# backend/app/routers/admin.py
"""
Admin routes for IAP Connect application.
Handles administrative functions for user and content management.
FIXED: Using proper UserType enum values instead of strings
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List
from ..config.database import get_db
from ..schemas.user import UserSearchResponse
from ..models.user import User, UserType  # IMPORTANT: Import UserType enum
from ..models.post import Post
from ..models.comment import Comment
from ..models.like import Like
from ..models.follow import Follow
from ..services.post_service import get_post_by_id
from ..utils.dependencies import get_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
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
    
    # FIXED: Return simple list instead of UserSearchResponse objects
    return [
        {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "user_type": user.user_type.value,  # Convert enum to string
            "profile_picture_url": user.profile_picture_url,
            "specialty": user.specialty,
            "college": user.college,
            "is_active": user.is_active,
            "created_at": user.created_at
        }
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
    # User statistics - FIXED: Using enum values properly
    total_users = db.query(User).count()
    total_doctors = db.query(User).filter(User.user_type == UserType.DOCTOR).count()  # FIXED: Use enum
    total_students = db.query(User).filter(User.user_type == UserType.STUDENT).count()  # FIXED: Use enum
    total_admins = db.query(User).filter(User.user_type == UserType.ADMIN).count()  # FIXED: Use enum
    active_users = db.query(User).filter(User.is_active == True).count()
    
    # Content statistics
    total_posts = db.query(Post).count()
    total_comments = db.query(Comment).count()
    total_likes = db.query(Like).count()
    total_follows = db.query(Follow).count()
    
    # Engagement metrics - Handle division by zero
    avg_likes_per_post = 0
    avg_comments_per_post = 0
    
    if total_posts > 0:
        likes_result = db.query(func.avg(Post.likes_count)).scalar()
        comments_result = db.query(func.avg(Post.comments_count)).scalar()
        
        avg_likes_per_post = float(likes_result) if likes_result else 0
        avg_comments_per_post = float(comments_result) if comments_result else 0
    
    # Top engaging posts (last 30 days) - Simple version
    top_posts = db.query(Post).order_by(
        desc(Post.likes_count + Post.comments_count)
    ).limit(5).all()
    
    # Most followed users - Simplified
    most_followed = db.query(User).order_by(desc(User.followers_count)).limit(5).all()
    
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
            "avg_likes_per_post": round(avg_likes_per_post, 2),
            "avg_comments_per_post": round(avg_comments_per_post, 2)
        },
        "top_posts": [
            {
                "id": post.id,
                "content": post.content[:100] + "..." if len(post.content) > 100 else post.content,
                "likes_count": post.likes_count or 0,
                "comments_count": post.comments_count or 0,
                "author": post.author.username if post.author else "Unknown"
            }
            for post in top_posts
        ],
        "most_followed_users": [
            {
                "id": user.id,
                "username": user.username,
                "full_name": user.full_name,
                "followers_count": user.followers_count or 0
            }
            for user in most_followed
        ]
    }