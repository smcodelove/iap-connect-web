"""
Comment routes for IAP Connect application.
Handles comment creation and management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..config.database import get_db
from ..schemas.comment import CommentCreate, CommentResponse, CommentListResponse
from ..schemas.user import UserSearchResponse
from ..services.comment_service import create_comment, get_post_comments, delete_comment, get_comment_by_id
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
    Get comments for a specific post.
    
    - **post_id**: Post ID to get comments for
    - **page**: Page number (default: 1)
    - **size**: Number of comments per page (default: 50, max: 100)
    
    Returns list of comments ordered by creation date (newest first).
    """
    # Verify post exists
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    comments, total = get_post_comments(post_id, db, page, size)
    
    comment_responses = []
    for comment in comments:
        comment_response = CommentResponse(
            id=comment.id,
            content=comment.content,
            created_at=comment.created_at,
            author=UserSearchResponse(
                id=comment.author.id,
                username=comment.author.username,
                full_name=comment.author.full_name,
                user_type=comment.author.user_type,
                profile_picture_url=comment.author.profile_picture_url,
                specialty=comment.author.specialty,
                college=comment.author.college
            )
        )
        comment_responses.append(comment_response)
    
    return CommentListResponse(
        comments=comment_responses,
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
    Create a new comment on a post.
    
    - **post_id**: Post ID to comment on
    - **content**: Comment text content (required)
    
    Returns the created comment with author information.
    """
    # Verify post exists
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    new_comment = create_comment(current_user, post, comment_data, db)
    
    # Get comment with author data
    db.refresh(new_comment)
    
    return CommentResponse(
        id=new_comment.id,
        content=new_comment.content,
        created_at=new_comment.created_at,
        author=UserSearchResponse(
            id=current_user.id,
            username=current_user.username,
            full_name=current_user.full_name,
            user_type=current_user.user_type,
            profile_picture_url=current_user.profile_picture_url,
            specialty=current_user.specialty,
            college=current_user.college
        )
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