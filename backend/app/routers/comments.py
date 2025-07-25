"""
Comment routes for IAP Connect application.
Handles comment creation, replies, likes and management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..config.database import get_db
from ..schemas.comment import CommentCreate, CommentResponse, CommentListResponse, CommentLikeResponse
from ..schemas.user import UserSearchResponse
from ..services.comment_service import (
    create_comment, get_post_comments, delete_comment, get_comment_by_id,
    like_comment, unlike_comment, get_comment_replies
)
from ..services.post_service import get_post_by_id
from ..utils.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/posts", tags=["Comments"])


@router.get("/{post_id}/comments", response_model=CommentListResponse)
def get_comments(
    post_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get comments for a specific post with nested replies.
    
    - **post_id**: Post ID to get comments for
    - **page**: Page number (default: 1)
    - **size**: Number of comments per page (default: 50, max: 100)
    
    Returns list of top-level comments with their replies ordered by creation date.
    """
    # Verify post exists
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    comments, total = get_post_comments(post_id, db, page, size, current_user.id)
    
    return CommentListResponse(
        comments=comments,
        total=total
    )


@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_new_comment(
    post_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Create a new comment or reply on a post.
    
    - **post_id**: Post ID to comment on
    - **content**: Comment text content (required)
    - **parent_id**: Parent comment ID for replies (optional)
    
    Returns the created comment with author information.
    """
    # Verify post exists
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # If parent_id provided, verify parent comment exists and belongs to same post
    if comment_data.parent_id:
        parent_comment = get_comment_by_id(comment_data.parent_id, db)
        if parent_comment.post_id != post_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent comment does not belong to this post"
            )
    
    new_comment = create_comment(current_user, post, comment_data, db)
    
    return new_comment


@router.get("/comments/{comment_id}/replies", response_model=CommentListResponse)
def get_comment_replies_endpoint(
    comment_id: int,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get replies for a specific comment.
    
    - **comment_id**: Comment ID to get replies for
    - **page**: Page number (default: 1)
    - **size**: Number of replies per page (default: 20, max: 50)
    
    Returns list of reply comments.
    """
    comment = get_comment_by_id(comment_id, db)
    
    replies, total = get_comment_replies(comment_id, db, page, size, current_user.id)
    
    return CommentListResponse(
        comments=replies,
        total=total
    )


@router.post("/comments/{comment_id}/like", response_model=CommentLikeResponse)
def like_comment_endpoint(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Like a comment.
    
    - **comment_id**: Comment ID to like
    
    Returns updated like status and count.
    """
    comment = get_comment_by_id(comment_id, db)
    
    result = like_comment(comment, current_user, db)
    
    return CommentLikeResponse(
        success=True,
        liked=True,
        likes_count=result['likes_count']
    )


@router.delete("/comments/{comment_id}/like", response_model=CommentLikeResponse)
def unlike_comment_endpoint(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Unlike a comment.
    
    - **comment_id**: Comment ID to unlike
    
    Returns updated like status and count.
    """
    comment = get_comment_by_id(comment_id, db)
    
    result = unlike_comment(comment, current_user, db)
    
    return CommentLikeResponse(
        success=True,
        liked=False,
        likes_count=result['likes_count']
    )


@router.delete("/comments/{comment_id}")
def delete_existing_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a comment (only by comment owner or admin).
    
    - **comment_id**: Comment ID to delete
    
    Removes the comment and decrements post comment count.
    """
    comment = get_comment_by_id(comment_id, db)
    
    delete_comment(comment, current_user, db)
    return {"message": "Comment deleted successfully"}