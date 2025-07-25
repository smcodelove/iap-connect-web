"""
Bookmark routes for IAP Connect application.
Handles post bookmarking functionality.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..config.database import get_db
from ..schemas.bookmark import BookmarkResponse, BookmarkListResponse
from ..services.bookmark_service import bookmark_post, unbookmark_post, get_user_bookmarks
from ..services.post_service import get_post_by_id
from ..utils.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/posts", tags=["Bookmarks"])


@router.post("/{post_id}/bookmark", response_model=BookmarkResponse, status_code=status.HTTP_201_CREATED)
def bookmark_post_endpoint(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Bookmark a post.
    
    - **post_id**: Post ID to bookmark
    
    Returns success status and message.
    """
    # Verify post exists
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    result = bookmark_post(current_user, post, db)
    
    return BookmarkResponse(
        success=True,
        bookmarked=result['bookmarked'],
        message=result['message']
    )


@router.delete("/{post_id}/bookmark", response_model=BookmarkResponse)
def unbookmark_post_endpoint(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Remove bookmark from a post.
    
    - **post_id**: Post ID to unbookmark
    
    Returns success status and message.
    """
    # Verify post exists
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    result = unbookmark_post(current_user, post, db)
    
    return BookmarkResponse(
        success=True,
        bookmarked=result['bookmarked'],
        message=result['message']
    )


@router.get("/bookmarks", response_model=BookmarkListResponse)
def get_bookmarks(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user's bookmarked posts.
    
    - **page**: Page number (default: 1)
    - **size**: Number of bookmarks per page (default: 20, max: 50)
    
    Returns list of bookmarked posts.
    """
    bookmarks, total = get_user_bookmarks(current_user, db, page, size)
    
    return BookmarkListResponse(
        bookmarks=bookmarks,
        total=total,
        page=page,
        size=size,
        has_next=(page * size) < total
    )