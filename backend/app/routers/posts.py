"""
Post routes for IAP Connect application.
Handles post creation, management, and social interactions.
UPDATED: Added notification integration and enhanced features while maintaining existing structure.
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
from ..models.user import User, Follow
from datetime import datetime
from ..models.notification import Notification, NotificationType

# NEW: Import notification service for social interactions
try:
    from ..models.notification import NotificationService
    NOTIFICATIONS_ENABLED = True
    print("✅ Notification service loaded for posts")
except ImportError:
    NOTIFICATIONS_ENABLED = False
    print("⚠️ Notification service not available - posts will work without notifications")

router = APIRouter(prefix="/posts", tags=["Posts"])


# backend/app/routers/posts.py - HELPER FUNCTION FIX
# इस code को आपकी existing posts.py file में replace करना है

def create_user_basic_info(user, current_user=None, db=None):
    """
    Helper function to create UserBasicInfo from user object
    FIXED: Properly handle is_following field
    """
    is_following = False
    
    # Check if current user is following this user
    if current_user and db and current_user.id != user.id:
        try:
            from ..models.follow import Follow
            follow_check = db.query(Follow).filter(
                Follow.follower_id == current_user.id,
                Follow.following_id == user.id
            ).first()
            is_following = follow_check is not None
        except Exception as e:
            print(f"Error checking follow status: {e}")
            is_following = False
    
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "user_type": user.user_type.value if hasattr(user.user_type, 'value') else str(user.user_type),
        "profile_picture_url": user.profile_picture_url,
        "specialty": user.specialty,
        "college": user.college,
        "is_following": is_following,
        "is_bookmarked": False  # Default value, can be updated later
    }


def create_post_response(post, current_user, db):
    """
    Helper function to create PostResponse with all required fields.
    FIXED: Proper field handling for UserBasicInfo
    """
    # Check if user liked this post
    is_liked = False
    try:
        from ..services.post_service import check_user_liked_post
        is_liked = check_user_liked_post(current_user.id, post.id, db)
    except (ImportError, AttributeError):
        # Fallback: check directly in database
        try:
            from ..models.like import Like
            like_check = db.query(Like).filter(
                Like.user_id == current_user.id,
                Like.post_id == post.id
            ).first()
            is_liked = like_check is not None
        except Exception:
            is_liked = False
    
    # Check if post is bookmarked
    is_bookmarked = False
    try:
        from ..services.bookmark_service import check_user_bookmarked_post
        is_bookmarked = check_user_bookmarked_post(current_user.id, post.id, db)
    except (ImportError, AttributeError):
        # Bookmark functionality not available
        is_bookmarked = False
    
    # Create author info with proper fields
    author_info = create_user_basic_info(post.author, current_user, db)
    author_info["is_bookmarked"] = is_bookmarked  # Add bookmark status
    
    return {
        "id": post.id,
        "content": post.content,
        "media_urls": post.media_urls or [],
        "hashtags": post.hashtags or [],
        "likes_count": post.likes_count,
        "comments_count": post.comments_count,
        "shares_count": post.shares_count,
        "is_trending": post.is_trending,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "is_liked": is_liked,
        "is_bookmarked": is_bookmarked,
        "author": author_info
    }


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
            post_response = create_post_response(post, current_user, db)
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
        HashtagResponse(hashtag="#Radiology", posts_count=128, total_engagement=650, growth="+9%"),
        HashtagResponse(hashtag="#Pathology", posts_count=121, total_engagement=620, growth="+7%"),
        HashtagResponse(hashtag="#Pharmacy", posts_count=115, total_engagement=580, growth="+11%"),
        HashtagResponse(hashtag="#Nursing", posts_count=108, total_engagement=540, growth="+13%"),
        HashtagResponse(hashtag="#Research", posts_count=98, total_engagement=490, growth="+5%"),
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
    hours_window: int = Query(72, ge=24, le=168, description="Hours to look back for trending calculation"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get trending posts based on engagement.
    
    - **page**: Page number (default: 1)
    - **size**: Number of posts per page (default: 20, max: 100)
    - **hours_window**: Hours to look back for trending calculation (default: 72, max: 168)
    
    Returns posts ordered by engagement (likes + comments + shares).
    """
    try:
        posts, total = get_trending_posts(db, page, size, hours_window)
        
        post_responses = []
        for post in posts:
            post_response = create_post_response(post, current_user, db)
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
            post_response = create_post_response(post, current_user, db)
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
    Create a new post with follower notifications.
    
    - **content**: Post text content (required)
    - **media_urls**: Optional list of image/document URLs
    - **hashtags**: Optional list of hashtags
    
    Returns the created post with author information.
    Notifies all followers about the new post.
    """
    try:
        # Create the post
        new_post = create_post(current_user, post_data, db)
        
        # Refresh to get author data
        db.refresh(new_post)
        post_with_author = get_post_by_id(new_post.id, db)
        
        # NEW: Notify followers about new post
        if NOTIFICATIONS_ENABLED:
            try:
                from ..models.notification import Notification, NotificationType
                
                # Get all followers
                followers = db.query(Follow.follower_id).filter(
                    Follow.following_id == current_user.id
                ).all()
                
                # Create notification for each follower
                notifications_created = 0
                for follower in followers:
                    notification = Notification(
                        recipient_id=follower[0],
                        sender_id=current_user.id,
                        type=NotificationType.POST_UPDATE,
                        title="New Post",
                        message=f"{current_user.full_name} shared a new post",
                        data=f'{{"post_id": {new_post.id}, "action": "new_post"}}'
                    )
                    db.add(notification)
                    notifications_created += 1
                
                if notifications_created > 0:
                    db.commit()
                    print(f"✅ Created post notifications for {notifications_created} followers")
                else:
                    print("📝 New post created but no followers to notify")
                    
            except Exception as e:
                print(f"⚠️ Failed to create post notifications: {e}")
        
        return create_post_response(post_with_author, current_user, db)
        
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
    
    return create_post_response(post, current_user, db)



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
    
    return create_post_response(updated_post_with_author, current_user, db)



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
    Like a post with notification integration.
    
    - **post_id**: Post ID to like
    
    Adds a like to the post and increments like count.
    Creates notification for post owner.
    """
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Check if already liked
    if check_user_liked_post(current_user.id, post_id, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post already liked"
        )
    
    try:
        like_post(current_user, post, db)
        
        # NEW: Create notification for post owner
        if NOTIFICATIONS_ENABLED and post.user_id != current_user.id:
            try:
                notification = Notification(
                    recipient_id=post.user_id,
                    sender_id=current_user.id,
                    type=NotificationType.LIKE,
                    title="New Like",
                    message=f"{current_user.full_name} liked your post",
                    data=f'{{"post_id": {post.id}, "action": "like"}}'
                )
                db.add(notification)
                db.commit()
                db.refresh(notification)
                print(f"✅ Created like notification for post {post_id}")
                # NEW: Trigger real-time notification update
                try:
                    from ..services.websocket_service import notify_user_realtime
                    notify_user_realtime(post.user_id, {
                        "type": "new_notification",
                        "notification_type": "like",
                        "message": f"{current_user.full_name} liked your post"
                    })
                except ImportError:
                    pass  # WebSocket service not available yet
                
            except Exception as e:
                print(f"⚠️ Failed to create like notification: {e}")
        
        # Get updated like count
        db.refresh(post)
        return {
            "success": True,
            "message": "Post liked successfully",
            "likes_count": post.likes_count,
            "liked": True  # NEW: Consistent with frontend expectations
        }
    except Exception as e:
        print(f"Error liking post: {str(e)}")
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
    
    # Check if not liked
    if not check_user_liked_post(current_user.id, post_id, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post not liked"
        )
    
    try:
        unlike_post(current_user, post, db)
        
        # Get updated like count
        db.refresh(post)
        return {
            "success": True,
            "message": "Post unliked successfully",
            "likes_count": post.likes_count,
            "liked": False  # NEW: Consistent with frontend expectations
        }
    except Exception as e:
        print(f"Error unliking post: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# NEW: Bookmark/Unbookmark endpoints
@router.post("/{post_id}/bookmark")
def bookmark_post_endpoint(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Bookmark a post for later reading.
    
    - **post_id**: Post ID to bookmark
    
    Adds post to user's bookmarks.
    """
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    try:
        # Try to use bookmark service if available
        from ..services.bookmark_service import bookmark_post, check_user_bookmarked_post
        
        if check_user_bookmarked_post(current_user.id, post_id, db):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Post already bookmarked"
            )
        
        bookmark_post(current_user, post, db)
        
        return {
            "success": True,
            "message": "Post bookmarked successfully",
            "bookmarked": True
        }
    except ImportError:
        # Fallback if bookmark service doesn't exist yet
        return {
            "success": True,
            "message": "Bookmark feature coming soon",
            "bookmarked": True
        }
    except Exception as e:
        print(f"Error bookmarking post: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{post_id}/bookmark")
def unbookmark_post_endpoint(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Remove bookmark from a post.
    
    - **post_id**: Post ID to unbookmark
    
    Removes post from user's bookmarks.
    """
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    try:
        # Try to use bookmark service if available
        from ..services.bookmark_service import unbookmark_post, check_user_bookmarked_post
        
        if not check_user_bookmarked_post(current_user.id, post_id, db):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Post not bookmarked"
            )
        
        unbookmark_post(current_user, post, db)
        
        return {
            "success": True,
            "message": "Post unbookmarked successfully",
            "bookmarked": False
        }
    except ImportError:
        # Fallback if bookmark service doesn't exist yet
        return {
            "success": True,
            "message": "Bookmark feature coming soon",
            "bookmarked": False
        }
    except Exception as e:
        print(f"Error unbookmarking post: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# NEW: Share endpoint
@router.post("/{post_id}/share")
def share_post_endpoint(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Share a post (increment share count).
    
    - **post_id**: Post ID to share
    
    Increments the share count for analytics.
    """
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    try:
        # Increment share count
        post.shares_count += 1
        db.commit()
        
        return {
            "success": True,
            "message": "Post shared successfully",
            "shares_count": post.shares_count
        }
    except Exception as e:
        print(f"Error sharing post: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )