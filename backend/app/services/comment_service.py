"""
Comment service for IAP Connect application.
Handles comment-related business logic.
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from fastapi import HTTPException, status
from typing import List, Tuple
from ..models.user import User
from ..models.post import Post
from ..models.comment import Comment
from ..schemas.comment import CommentCreate


def create_comment(user: User, post: Post, comment_data: CommentCreate, db: Session) -> Comment:
    """
    Create a new comment on a post.
    
    Args:
        user: User creating the comment
        post: Post being commented on
        comment_data: Comment creation data
        db: Database session
        
    Returns:
        Comment: Newly created comment
    """
    new_comment = Comment(
        user_id=user.id,
        post_id=post.id,
        content=comment_data.content
    )
    
    db.add(new_comment)
    
    # Update post comments count
    post.comments_count += 1
    
    db.commit()
    db.refresh(new_comment)
    
    return new_comment


def get_post_comments(post_id: int, db: Session, page: int = 1, size: int = 50) -> Tuple[List[Comment], int]:
    """
    Get comments for a specific post.
    
    Args:
        post_id: Post ID
        db: Database session
        page: Page number (1-indexed)
        size: Page size
        
    Returns:
        Tuple[List[Comment], int]: List of comments and total count
    """
    comments_query = db.query(Comment).options(joinedload(Comment.author)).filter(
        Comment.post_id == post_id
    ).order_by(desc(Comment.created_at))
    
    total = comments_query.count()
    comments = comments_query.offset((page - 1) * size).limit(size).all()
    
    return comments, total


def delete_comment(comment: Comment, user: User, db: Session) -> bool:
    """
    Delete a comment.
    
    Args:
        comment: Comment to delete
        user: User requesting deletion
        db: Database session
        
    Returns:
        bool: True if successful
        
    Raises:
        HTTPException: If user doesn't own the comment
    """
    if comment.user_id != user.id and user.user_type.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )
    
    # Get the post to update comment count
    post = db.query(Post).filter(Post.id == comment.post_id).first()
    if post:
        post.comments_count = max(0, post.comments_count - 1)
    
    db.delete(comment)
    db.commit()
    return True


def get_comment_by_id(comment_id: int, db: Session) -> Comment:
    """
    Get comment by ID.
    
    Args:
        comment_id: Comment ID
        db: Database session
        
    Returns:
        Comment: Comment if found
        
    Raises:
        HTTPException: If comment not found
    """
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    return comment