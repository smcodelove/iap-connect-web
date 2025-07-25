"""
Comment service for IAP Connect application.
Handles comment-related business logic with replies and likes.
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_
from fastapi import HTTPException, status
from typing import List, Dict
from ..models.user import User
from ..models.post import Post
from ..models.comment import Comment
from ..models.comment_like import CommentLike
from ..schemas.comment import CommentCreate, CommentResponse
from ..schemas.user import UserPublic  # FIXED: Use UserPublic instead of UserSearchResponse


def create_comment(user: User, post: Post, comment_data: CommentCreate, db: Session) -> CommentResponse:
    """
    Create a new comment or reply on a post.
    
    Args:
        user: User creating the comment
        post: Post being commented on
        comment_data: Comment creation data
        db: Database session
        
    Returns:
        CommentResponse: Newly created comment response
    """
    new_comment = Comment(
        user_id=user.id,
        post_id=post.id,
        parent_id=comment_data.parent_id,
        content=comment_data.content
    )
    
    db.add(new_comment)
    
    # Update post comments count (only for top-level comments)
    if not comment_data.parent_id:
        post.comments_count += 1
    else:
        # Update parent comment replies count
        parent_comment = db.query(Comment).filter(Comment.id == comment_data.parent_id).first()
        if parent_comment:
            parent_comment.replies_count += 1
    
    db.commit()
    db.refresh(new_comment)
    
    return CommentResponse(
        id=new_comment.id,
        content=new_comment.content,
        parent_id=new_comment.parent_id,
        likes_count=new_comment.likes_count,
        replies_count=new_comment.replies_count,
        created_at=new_comment.created_at,
        author=UserPublic(  # FIXED: Use UserPublic
            id=user.id,
            username=user.username,
            full_name=user.full_name,
            bio=user.bio,
            profile_picture_url=user.profile_picture_url,
            user_type=user.user_type,
            display_info=user.display_info,
            followers_count=user.followers_count,
            following_count=user.following_count,
            posts_count=user.posts_count,
            is_following=False
        ),
        is_liked=False,
        replies=[]
    )


def get_post_comments(post_id: int, db: Session, page: int = 1, size: int = 50, user_id: int = None) -> tuple[List[CommentResponse], int]:
    """
    Get top-level comments for a specific post with nested replies.
    
    Args:
        post_id: Post ID
        db: Database session
        page: Page number (1-indexed)
        size: Page size
        user_id: Current user ID for like status
        
    Returns:
        Tuple[List[CommentResponse], int]: List of comments and total count
    """
    # Get top-level comments (no parent)
    comments_query = db.query(Comment).options(
        joinedload(Comment.author)
    ).filter(
        and_(Comment.post_id == post_id, Comment.parent_id.is_(None))
    ).order_by(desc(Comment.created_at))
    
    total = comments_query.count()
    comments = comments_query.offset((page - 1) * size).limit(size).all()
    
    comment_responses = []
    for comment in comments:
        # Check if current user liked this comment
        is_liked = False
        if user_id:
            is_liked = db.query(CommentLike).filter(
                and_(CommentLike.comment_id == comment.id, CommentLike.user_id == user_id)
            ).first() is not None
        
        # Get recent replies (limit to 3 for performance)
        recent_replies = db.query(Comment).options(
            joinedload(Comment.author)
        ).filter(
            Comment.parent_id == comment.id
        ).order_by(Comment.created_at).limit(3).all()
        
        replies_responses = []
        for reply in recent_replies:
            reply_is_liked = False
            if user_id:
                reply_is_liked = db.query(CommentLike).filter(
                    and_(CommentLike.comment_id == reply.id, CommentLike.user_id == user_id)
                ).first() is not None
            
            replies_responses.append(CommentResponse(
                id=reply.id,
                content=reply.content,
                parent_id=reply.parent_id,
                likes_count=reply.likes_count,
                replies_count=reply.replies_count,
                created_at=reply.created_at,
                author=UserPublic(  # FIXED: Use UserPublic
                    id=reply.author.id,
                    username=reply.author.username,
                    full_name=reply.author.full_name,
                    bio=reply.author.bio,
                    profile_picture_url=reply.author.profile_picture_url,
                    user_type=reply.author.user_type,
                    display_info=reply.author.display_info,
                    followers_count=reply.author.followers_count,
                    following_count=reply.author.following_count,
                    posts_count=reply.author.posts_count,
                    is_following=False
                ),
                is_liked=reply_is_liked,
                replies=[]
            ))
        
        comment_response = CommentResponse(
            id=comment.id,
            content=comment.content,
            parent_id=comment.parent_id,
            likes_count=comment.likes_count,
            replies_count=comment.replies_count,
            created_at=comment.created_at,
            author=UserPublic(  # FIXED: Use UserPublic
                id=comment.author.id,
                username=comment.author.username,
                full_name=comment.author.full_name,
                bio=comment.author.bio,
                profile_picture_url=comment.author.profile_picture_url,
                user_type=comment.author.user_type,
                display_info=comment.author.display_info,
                followers_count=comment.author.followers_count,
                following_count=comment.author.following_count,
                posts_count=comment.author.posts_count,
                is_following=False
            ),
            is_liked=is_liked,
            replies=replies_responses
        )
        comment_responses.append(comment_response)
    
    return comment_responses, total


def get_comment_replies(comment_id: int, db: Session, page: int = 1, size: int = 20, user_id: int = None) -> tuple[List[CommentResponse], int]:
    """
    Get replies for a specific comment.
    
    Args:
        comment_id: Parent comment ID
        db: Database session
        page: Page number (1-indexed)
        size: Page size
        user_id: Current user ID for like status
        
    Returns:
        Tuple[List[CommentResponse], int]: List of reply comments and total count
    """
    replies_query = db.query(Comment).options(
        joinedload(Comment.author)
    ).filter(
        Comment.parent_id == comment_id
    ).order_by(Comment.created_at)
    
    total = replies_query.count()
    replies = replies_query.offset((page - 1) * size).limit(size).all()
    
    replies_responses = []
    for reply in replies:
        # Check if current user liked this reply
        is_liked = False
        if user_id:
            is_liked = db.query(CommentLike).filter(
                and_(CommentLike.comment_id == reply.id, CommentLike.user_id == user_id)
            ).first() is not None
        
        replies_responses.append(CommentResponse(
            id=reply.id,
            content=reply.content,
            parent_id=reply.parent_id,
            likes_count=reply.likes_count,
            replies_count=reply.replies_count,
            created_at=reply.created_at,
            author=UserPublic(  # FIXED: Use UserPublic
                id=reply.author.id,
                username=reply.author.username,
                full_name=reply.author.full_name,
                bio=reply.author.bio,
                profile_picture_url=reply.author.profile_picture_url,
                user_type=reply.author.user_type,
                display_info=reply.author.display_info,
                followers_count=reply.author.followers_count,
                following_count=reply.author.following_count,
                posts_count=reply.author.posts_count,
                is_following=False
            ),
            is_liked=is_liked,
            replies=[]
        ))
    
    return replies_responses, total


def like_comment(comment: Comment, user: User, db: Session) -> Dict:
    """
    Like a comment.
    
    Args:
        comment: Comment to like
        user: User liking the comment
        db: Database session
        
    Returns:
        Dict: Updated like information
    """
    # Check if already liked
    existing_like = db.query(CommentLike).filter(
        and_(CommentLike.comment_id == comment.id, CommentLike.user_id == user.id)
    ).first()
    
    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment already liked"
        )
    
    # Create new like
    new_like = CommentLike(
        comment_id=comment.id,
        user_id=user.id
    )
    
    db.add(new_like)
    comment.likes_count += 1
    
    db.commit()
    
    return {
        'liked': True,
        'likes_count': comment.likes_count
    }


def unlike_comment(comment: Comment, user: User, db: Session) -> Dict:
    """
    Unlike a comment.
    
    Args:
        comment: Comment to unlike
        user: User unliking the comment
        db: Database session
        
    Returns:
        Dict: Updated like information
    """
    # Check if liked
    existing_like = db.query(CommentLike).filter(
        and_(CommentLike.comment_id == comment.id, CommentLike.user_id == user.id)
    ).first()
    
    if not existing_like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment not liked"
        )
    
    # Remove like
    db.delete(existing_like)
    comment.likes_count = max(0, comment.likes_count - 1)
    
    db.commit()
    
    return {
        'liked': False,
        'likes_count': comment.likes_count
    }


def delete_comment(comment: Comment, user: User, db: Session) -> bool:
    """
    Delete a comment and all its replies.
    
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
    
    # Update counts based on comment type
    if comment.parent_id is None:
        # Top-level comment - update post comment count
        if post:
            post.comments_count = max(0, post.comments_count - 1)
    else:
        # Reply - update parent comment replies count
        parent_comment = db.query(Comment).filter(Comment.id == comment.parent_id).first()
        if parent_comment:
            parent_comment.replies_count = max(0, parent_comment.replies_count - 1)
    
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
        Comment: Comment object
        
    Raises:
        HTTPException: If comment not found
    """
    comment = db.query(Comment).options(joinedload(Comment.author)).filter(
        Comment.id == comment_id
    ).first()
    
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    
    return comment