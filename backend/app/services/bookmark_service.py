"""
Bookmark service for IAP Connect application.
Handles bookmark-related business logic.
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_
from fastapi import HTTPException, status
from typing import List, Dict, Tuple
from ..models.user import User
from ..models.post import Post
from ..models.bookmark import Bookmark
from ..schemas.bookmark import BookmarkedPostResponse
from ..schemas.post import PostResponse
from ..schemas.user import UserPublic


def bookmark_post(user: User, post: Post, db: Session) -> Dict:
    """
    Bookmark a post.
    
    Args:
        user: User bookmarking the post
        post: Post being bookmarked
        db: Database session
        
    Returns:
        Dict: Bookmark information
    """
    # Check if already bookmarked
    existing_bookmark = db.query(Bookmark).filter(
        and_(Bookmark.post_id == post.id, Bookmark.user_id == user.id)
    ).first()
    
    if existing_bookmark:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post already bookmarked"
        )
    
    # Create new bookmark
    new_bookmark = Bookmark(
        post_id=post.id,
        user_id=user.id
    )
    
    db.add(new_bookmark)
    db.commit()
    
    return {
        'bookmarked': True,
        'message': 'Post bookmarked successfully'
    }


def unbookmark_post(user: User, post: Post, db: Session) -> Dict:
    """
    Remove bookmark from a post.
    
    Args:
        user: User removing bookmark
        post: Post being unbookmarked
        db: Database session
        
    Returns:
        Dict: Unbookmark information
    """
    # Check if bookmarked
    existing_bookmark = db.query(Bookmark).filter(
        and_(Bookmark.post_id == post.id, Bookmark.user_id == user.id)
    ).first()
    
    if not existing_bookmark:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post not bookmarked"
        )
    
    # Remove bookmark
    db.delete(existing_bookmark)
    db.commit()
    
    return {
        'bookmarked': False,
        'message': 'Bookmark removed successfully'
    }


def get_user_bookmarks(user: User, db: Session, page: int = 1, size: int = 20) -> Tuple[List[BookmarkedPostResponse], int]:
    """
    Get user's bookmarked posts.
    
    Args:
        user: User whose bookmarks to fetch
        db: Database session
        page: Page number (1-indexed)
        size: Page size
        
    Returns:
        Tuple[List[BookmarkedPostResponse], int]: List of bookmarked posts and total count
    """
    bookmarks_query = db.query(Bookmark).options(
        joinedload(Bookmark.post).joinedload(Post.author)
    ).filter(
        Bookmark.user_id == user.id
    ).order_by(desc(Bookmark.created_at))
    
    total = bookmarks_query.count()
    bookmarks = bookmarks_query.offset((page - 1) * size).limit(size).all()
    
    bookmark_responses = []
    for bookmark in bookmarks:
        # Check if user liked this post
        is_liked = db.query(Bookmark).filter(
            and_(Bookmark.post_id == bookmark.post.id, Bookmark.user_id == user.id)
        ).first() is not None
        
        post_response = PostResponse(
            id=bookmark.post.id,
            content=bookmark.post.content,
            media_urls=bookmark.post.media_urls or [],
            hashtags=bookmark.post.hashtags or [],
            likes_count=bookmark.post.likes_count,
            comments_count=bookmark.post.comments_count,
            shares_count=bookmark.post.shares_count,
            is_trending=bookmark.post.is_trending,
            created_at=bookmark.post.created_at,
            updated_at=bookmark.post.updated_at,
            author=UserPublic(
                id=bookmark.post.author.id,
                username=bookmark.post.author.username,
                full_name=bookmark.post.author.full_name,
                bio=bookmark.post.author.bio,
                profile_picture_url=bookmark.post.author.profile_picture_url,
                user_type=bookmark.post.author.user_type,
                display_info=bookmark.post.author.display_info,
                followers_count=bookmark.post.author.followers_count,
                following_count=bookmark.post.author.following_count,
                posts_count=bookmark.post.author.posts_count,
                is_following=False
            ),
            is_liked=is_liked
        )
        
        bookmark_response = BookmarkedPostResponse(
            id=bookmark.id,
            created_at=bookmark.created_at,
            post=post_response
        )
        bookmark_responses.append(bookmark_response)
    
    return bookmark_responses, total


def is_post_bookmarked(user: User, post_id: int, db: Session) -> bool:
    """
    Check if a post is bookmarked by user.
    
    Args:
        user: User to check
        post_id: Post ID to check
        db: Database session
        
    Returns:
        bool: True if bookmarked, False otherwise
    """
    return db.query(Bookmark).filter(
        and_(Bookmark.post_id == post_id, Bookmark.user_id == user.id)
    ).first() is not None