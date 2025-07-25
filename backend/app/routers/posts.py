"""
Post routes for IAP Connect application.
Handles post creation, management, and social interactions.
UPDATED: Fixed search endpoint route order to prevent 422 errors.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from ..config.database import get_db
from ..schemas.post import (
    PostCreate, PostUpdate, PostResponse, PostListResponse, 
    UserBasicInfo, TrendingHashtagsResponse, HashtagResponse
)
from ..services.post_service import (
    create_post, get_post_by_id, update_post, delete_post,
    get_user_feed, get_trending_posts, search_posts,
    like_post, unlike_post, check_user_liked_post
)
from ..utils.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/posts", tags=["Posts"])


def create_user_basic_info(user):
    """Helper function to create UserBasicInfo from user object"""
    return UserBasicInfo(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        user_type=user.user_type.value if hasattr(user.user_type, 'value') else str(user.user_type),
        profile_picture_url=user.profile_picture_url,
        specialty=user.specialty,
        college=user.college
    )


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
    try:
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
                author=create_user_basic_info(post.author)
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
    except Exception as e:
        print(f"Error in get_feed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch feed: {str(e)}"
        )


@router.get("/trending/hashtags", response_model=TrendingHashtagsResponse)
def get_trending_hashtags(
    limit: int = Query(10, ge=5, le=20),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get trending hashtags."""
    trending_hashtags = [
        HashtagResponse(hashtag="#MedicalEducation", posts_count=245, total_engagement=1200, growth="+12%"),
        HashtagResponse(hashtag="#Surgery", posts_count=189, total_engagement=950, growth="+8%"),
        HashtagResponse(hashtag="#Cardiology", posts_count=167, total_engagement=890, growth="+15%"),
        HashtagResponse(hashtag="#Neurology", posts_count=143, total_engagement=720, growth="+6%"),
        HashtagResponse(hashtag="#Pediatrics", posts_count=134, total_engagement=680, growth="+10%"),
    ]
    
    return TrendingHashtagsResponse(
        success=True,
        trending_hashtags=trending_hashtags[:limit],
        total=len(trending_hashtags)
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
    try:
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
                author=create_user_basic_info(post.author)
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
    except Exception as e:
        print(f"Error in get_trending: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch trending posts: {str(e)}"
        )


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
    try:
        print(f"🔍 Searching for: '{q}' (page {page}, size {size})")
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
                author=create_user_basic_info(post.author)
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
    except Exception as e:
        print(f"❌ Error in search_posts: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search posts: {str(e)}"
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
    try:
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
            author=create_user_basic_info(post_with_author.author)
        )
    except Exception as e:
        print(f"Error creating post: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create post: {str(e)}"
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
        author=create_user_basic_info(post.author)
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
        author=create_user_basic_info(updated_post_with_author.author)
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
    
    try:
        like_post(current_user, post, db)
        # Get updated like count
        db.refresh(post)
        return {
            "message": "Post liked successfully",
            "likes_count": post.likes_count,
            "is_liked": True
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


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
    
    try:
        unlike_post(current_user, post, db)
        # Get updated like count
        db.refresh(post)
        return {
            "message": "Post unliked successfully",
            "likes_count": post.likes_count,
            "is_liked": False
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )