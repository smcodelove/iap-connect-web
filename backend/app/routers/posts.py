"""
Post routes for IAP Connect application.
Handles post creation, management, and social interactions.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..config.database import get_db
from ..schemas.post import PostCreate, PostUpdate, PostResponse, PostListResponse
from ..schemas.user import UserSearchResponse
from ..services.post_service import (
    create_post, get_post_by_id, update_post, delete_post,
    get_user_feed, get_trending_posts, search_posts,
    like_post, unlike_post, check_user_liked_post
)
from ..utils.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.get("/feed", response_model=PostListResponse)
def get_feed(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized feed for current user.
    
    - **page**: Page number (default: 1)
    - **size**: Number of posts per page (default: 20, max: 100)
    
    Returns posts from followed users and own posts.
    """
    posts, total = get_user_feed(current_user, db, page, size)
    
    post_responses = []
    for post in posts:
        is_liked = check_user_liked_post(current_user.id, post.id, db)
        
        post_response = PostResponse(
            id=post.id,
            content=post.content,
            media_urls=post.media_urls or [],
            hashtags=post.hashtags or [],
            likes_count=post.likes_count,
            comments_count=post.comments_count,
            shares_count=post.shares_count,
            is_trending=post.is_trending,
            created_at=post.created_at,
            updated_at=post.updated_at,
            is_liked=is_liked,
            author=UserSearchResponse(
                id=post.author.id,
                username=post.author.username,
                full_name=post.author.full_name,
                user_type=post.author.user_type,
                profile_picture_url=post.author.profile_picture_url,
                specialty=post.author.specialty,
                college=post.author.college
            )
        )
        post_responses.append(post_response)
    
    has_next = (page * size) < total
    
    return PostListResponse(
        posts=post_responses,
        total=total,
        page=page,
        size=size,
        has_next=has_next
    )


@router.get("/trending", response_model=PostListResponse)
def get_trending(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get trending posts based on engagement.
    
    - **page**: Page number (default: 1)
    - **size**: Number of posts per page (default: 20, max: 100)
    
    Returns posts ordered by engagement (likes + comments + shares).
    """
    posts, total = get_trending_posts(db, page, size)
    
    post_responses = []
    for post in posts:
        is_liked = check_user_liked_post(current_user.id, post.id, db)
        
        post_response = PostResponse(
            id=post.id,
            content=post.content,
            media_urls=post.media_urls or [],
            hashtags=post.hashtags or [],
            likes_count=post.likes_count,
            comments_count=post.comments_count,
            shares_count=post.shares_count,
            is_trending=post.is_trending,
            created_at=post.created_at,
            updated_at=post.updated_at,
            is_liked=is_liked,
            author=UserSearchResponse(
                id=post.author.id,
                username=post.author.username,
                full_name=post.author.full_name,
                user_type=post.author.user_type,
                profile_picture_url=post.author.profile_picture_url,
                specialty=post.author.specialty,
                college=post.author.college
            )
        )
        post_responses.append(post_response)
    
    has_next = (page * size) < total
    
    return PostListResponse(
        posts=post_responses,
        total=total,
        page=page,
        size=size,
        has_next=has_next
    )


@router.post("", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_new_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new post.
    
    - **content**: Post text content (required)
    - **media_urls**: Optional list of image/document URLs
    - **hashtags**: Optional list of hashtags
    
    Returns the created post with author information.
    """
    new_post = create_post(current_user, post_data, db)
    
    # Refresh to get author data
    db.refresh(new_post)
    post_with_author = get_post_by_id(new_post.id, db)
    
    return PostResponse(
        id=post_with_author.id,
        content=post_with_author.content,
        media_urls=post_with_author.media_urls or [],
        hashtags=post_with_author.hashtags or [],
        likes_count=post_with_author.likes_count,
        comments_count=post_with_author.comments_count,
        shares_count=post_with_author.shares_count,
        is_trending=post_with_author.is_trending,
        created_at=post_with_author.created_at,
        updated_at=post_with_author.updated_at,
        is_liked=False,
        author=UserSearchResponse(
            id=post_with_author.author.id,
            username=post_with_author.author.username,
            full_name=post_with_author.author.full_name,
            user_type=post_with_author.author.user_type,
            profile_picture_url=post_with_author.author.profile_picture_url,
            specialty=post_with_author.author.specialty,
            college=post_with_author.author.college
        )
    )


@router.get("/{post_id}", response_model=PostResponse)
def get_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific post by ID.
    
    - **post_id**: Post ID to retrieve
    
    Returns post details with author information.
    """
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    is_liked = check_user_liked_post(current_user.id, post.id, db)
    
    return PostResponse(
        id=post.id,
        content=post.content,
        media_urls=post.media_urls or [],
        hashtags=post.hashtags or [],
        likes_count=post.likes_count,
        comments_count=post.comments_count,
        shares_count=post.shares_count,
        is_trending=post.is_trending,
        created_at=post.created_at,
        updated_at=post.updated_at,
        is_liked=is_liked,
        author=UserSearchResponse(
            id=post.author.id,
            username=post.author.username,
            full_name=post.author.full_name,
            user_type=post.author.user_type,
            profile_picture_url=post.author.profile_picture_url,
            specialty=post.author.specialty,
            college=post.author.college
        )
    )


@router.put("/{post_id}", response_model=PostResponse)
def update_existing_post(
    post_id: int,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing post (only by post owner).
    
    - **post_id**: Post ID to update
    - **content**: Updated content (optional)
    - **media_urls**: Updated media URLs (optional)
    - **hashtags**: Updated hashtags (optional)
    
    Returns updated post.
    """
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    updated_post = update_post(post, current_user, post_data, db)
    
    # Get updated post with author
    updated_post_with_author = get_post_by_id(updated_post.id, db)
    is_liked = check_user_liked_post(current_user.id, updated_post.id, db)
    
    return PostResponse(
        id=updated_post_with_author.id,
        content=updated_post_with_author.content,
        media_urls=updated_post_with_author.media_urls or [],
        hashtags=updated_post_with_author.hashtags or [],
        likes_count=updated_post_with_author.likes_count,
        comments_count=updated_post_with_author.comments_count,
        shares_count=updated_post_with_author.shares_count,
        is_trending=updated_post_with_author.is_trending,
        created_at=updated_post_with_author.created_at,
        updated_at=updated_post_with_author.updated_at,
        is_liked=is_liked,
        author=UserSearchResponse(
            id=updated_post_with_author.author.id,
            username=updated_post_with_author.author.username,
            full_name=updated_post_with_author.author.full_name,
            user_type=updated_post_with_author.author.user_type,
            profile_picture_url=updated_post_with_author.author.profile_picture_url,
            specialty=updated_post_with_author.author.specialty,
            college=updated_post_with_author.author.college
        )
    )


@router.delete("/{post_id}")
def delete_existing_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a post (only by post owner or admin).
    
    - **post_id**: Post ID to delete
    
    Removes the post and all associated data.
    """
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    delete_post(post, current_user, db)
    return {"message": "Post deleted successfully"}


@router.post("/{post_id}/like")
def like_post_endpoint(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Like a post.
    
    - **post_id**: Post ID to like
    
    Adds a like to the post and increments like count.
    """
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    like_post(current_user, post, db)
    return {"message": "Post liked successfully"}


@router.delete("/{post_id}/like")
def unlike_post_endpoint(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Unlike a post.
    
    - **post_id**: Post ID to unlike
    
    Removes like from the post and decrements like count.
    """
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    unlike_post(current_user, post, db)
    return {"message": "Post unliked successfully"}


@router.get("/search", response_model=PostListResponse)
def search_posts_endpoint(
    q: str = Query(..., description="Search query"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Search posts by content or hashtags.
    
    - **q**: Search query string
    - **page**: Page number (default: 1)
    - **size**: Number of posts per page (default: 20, max: 100)
    
    Returns matching posts ordered by creation date.
    """
    posts, total = search_posts(q, db, page, size)
    
    post_responses = []
    for post in posts:
        is_liked = check_user_liked_post(current_user.id, post.id, db)
        
        post_response = PostResponse(
            id=post.id,
            content=post.content,
            media_urls=post.media_urls or [],
            hashtags=post.hashtags or [],
            likes_count=post.likes_count,
            comments_count=post.comments_count,
            shares_count=post.shares_count,
            is_trending=post.is_trending,
            created_at=post.created_at,
            updated_at=post.updated_at,
            is_liked=is_liked,
            author=UserSearchResponse(
                id=post.author.id,
                username=post.author.username,
                full_name=post.author.full_name,
                user_type=post.author.user_type,
                profile_picture_url=post.author.profile_picture_url,
                specialty=post.author.specialty,
                college=post.author.college
            )
        )
        post_responses.append(post_response)
    
    has_next = (page * size) < total
    
    return PostListResponse(
        posts=post_responses,
        total=total,
        page=page,
        size=size,
        has_next=has_next
    )