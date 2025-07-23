"""
Post service for IAP Connect application.
Handles post-related business logic.
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, or_, func
from fastapi import HTTPException, status
from typing import List, Optional, Tuple
from ..models.user import User
from ..models.post import Post
from ..models.like import Like
from ..models.comment import Comment
from ..models.follow import Follow
from ..schemas.post import PostCreate, PostUpdate


def create_post(user: User, post_data: PostCreate, db: Session) -> Post:
    """
    Create a new post.
    
    Args:
        user: User creating the post
        post_data: Post creation data
        db: Database session
        
    Returns:
        Post: Newly created post
    """
    new_post = Post(
        user_id=user.id,
        content=post_data.content,
        media_urls=post_data.media_urls or [],
        hashtags=post_data.hashtags or []
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return new_post


def get_post_by_id(post_id: int, db: Session) -> Optional[Post]:
    """
    Get post by ID with author information.
    
    Args:
        post_id: Post ID
        db: Database session
        
    Returns:
        Post or None: Post if found, None otherwise
    """
    return db.query(Post).options(joinedload(Post.author)).filter(Post.id == post_id).first()


def update_post(post: Post, user: User, post_data: PostUpdate, db: Session) -> Post:
    """
    Update an existing post.
    
    Args:
        post: Post to update
        user: User requesting the update
        post_data: Updated post data
        db: Database session
        
    Returns:
        Post: Updated post
        
    Raises:
        HTTPException: If user doesn't own the post
    """
    if post.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this post"
        )
    
    update_data = post_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(post, field, value)
    
    db.commit()
    db.refresh(post)
    return post


def delete_post(post: Post, user: User, db: Session) -> bool:
    """
    Delete a post.
    
    Args:
        post: Post to delete
        user: User requesting deletion
        db: Database session
        
    Returns:
        bool: True if successful
        
    Raises:
        HTTPException: If user doesn't own the post
    """
    if post.user_id != user.id and user.user_type.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post"
        )
    
    db.delete(post)
    db.commit()
    return True


def get_user_feed(user: User, db: Session, page: int = 1, size: int = 20) -> Tuple[List[Post], int]:
    """
    Get personalized feed for user (posts from followed users + own posts).
    
    Args:
        user: Current user
        db: Database session
        page: Page number (1-indexed)
        size: Page size
        
    Returns:
        Tuple[List[Post], int]: List of posts and total count
    """
    # Get IDs of users that the current user follows
    following_ids = db.query(Follow.following_id).filter(Follow.follower_id == user.id).subquery()
    
    # Get posts from followed users + own posts
    posts_query = db.query(Post).options(joinedload(Post.author)).filter(
        or_(
            Post.user_id.in_(following_ids),
            Post.user_id == user.id
        )
    ).order_by(desc(Post.created_at))
    
    total = posts_query.count()
    posts = posts_query.offset((page - 1) * size).limit(size).all()
    
    return posts, total


def get_trending_posts(db: Session, page: int = 1, size: int = 20) -> Tuple[List[Post], int]:
    """
    Get trending posts (posts with high engagement).
    
    Args:
        db: Database session
        page: Page number (1-indexed)
        size: Page size
        
    Returns:
        Tuple[List[Post], int]: List of posts and total count
    """
    # Calculate engagement score and order by it
    posts_query = db.query(Post).options(joinedload(Post.author)).order_by(
        desc(Post.likes_count + Post.comments_count + Post.shares_count),
        desc(Post.created_at)
    )
    
    total = posts_query.count()
    posts = posts_query.offset((page - 1) * size).limit(size).all()
    
    return posts, total


def search_posts(query: str, db: Session, page: int = 1, size: int = 20) -> Tuple[List[Post], int]:
    """
    Search posts by content or hashtags.
    
    Args:
        query: Search query
        db: Database session
        page: Page number (1-indexed)
        size: Page size
        
    Returns:
        Tuple[List[Post], int]: List of posts and total count
    """
    posts_query = db.query(Post).options(joinedload(Post.author)).filter(
        or_(
            Post.content.ilike(f"%{query}%"),
            Post.hashtags.op("@>")(f'["{query}"]')  # Check if hashtag array contains query
        )
    ).order_by(desc(Post.created_at))
    
    total = posts_query.count()
    posts = posts_query.offset((page - 1) * size).limit(size).all()
    
    return posts, total


def like_post(user: User, post: Post, db: Session) -> bool:
    """
    Like a post.
    
    Args:
        user: User liking the post
        post: Post to like
        db: Database session
        
    Returns:
        bool: True if successful
        
    Raises:
        HTTPException: If already liked
    """
    existing_like = db.query(Like).filter(
        Like.user_id == user.id,
        Like.post_id == post.id
    ).first()
    
    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post already liked"
        )
    
    # Create like
    new_like = Like(user_id=user.id, post_id=post.id)
    db.add(new_like)
    
    # Update post likes count
    post.likes_count += 1
    
    db.commit()
    return True


def unlike_post(user: User, post: Post, db: Session) -> bool:
    """
    Unlike a post.
    
    Args:
        user: User unliking the post
        post: Post to unlike
        db: Database session
        
    Returns:
        bool: True if successful
        
    Raises:
        HTTPException: If not liked
    """
    like = db.query(Like).filter(
        Like.user_id == user.id,
        Like.post_id == post.id
    ).first()
    
    if not like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post not liked"
        )
    
    # Delete like
    db.delete(like)
    
    # Update post likes count
    post.likes_count = max(0, post.likes_count - 1)
    
    db.commit()
    return True


def check_user_liked_post(user_id: int, post_id: int, db: Session) -> bool:
    """
    Check if user has liked a specific post.
    
    Args:
        user_id: User ID
        post_id: Post ID
        db: Database session
        
    Returns:
        bool: True if user liked the post
    """
    like = db.query(Like).filter(
        Like.user_id == user_id,
        Like.post_id == post_id
    ).first()
    
    return like is not None