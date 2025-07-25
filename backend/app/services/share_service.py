"""
Share service for IAP Connect application.
Handles share-related business logic.
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from typing import List, Dict
from ..models.user import User
from ..models.post import Post
from ..models.share import Share
from ..schemas.share import ShareDetailResponse
from ..schemas.user import UserSearchResponse


def create_share(user: User, post: Post, share_type: str, db: Session) -> Dict:
    """
    Create a new share for a post.
    
    Args:
        user: User sharing the post
        post: Post being shared
        share_type: Type of share (external, internal, copy_link)
        db: Database session
        
    Returns:
        Dict: Share information with updated count
    """
    new_share = Share(
        user_id=user.id,
        post_id=post.id,
        share_type=share_type
    )
    
    db.add(new_share)
    
    # Update post shares count
    post.shares_count += 1
    
    db.commit()
    db.refresh(new_share)
    
    return {
        'shared': True,
        'shares_count': post.shares_count,
        'share_type': share_type
    }


def get_post_shares(post_id: int, db: Session, limit: int = 50) -> List[ShareDetailResponse]:
    """
    Get shares for a specific post.
    
    Args:
        post_id: Post ID
        db: Database session
        limit: Maximum number of shares to return
        
    Returns:
        List[ShareDetailResponse]: List of shares with user information
    """
    shares = db.query(Share).options(
        joinedload(Share.user)
    ).filter(
        Share.post_id == post_id
    ).order_by(desc(Share.created_at)).limit(limit).all()
    
    share_responses = []
    for share in shares:
        share_response = ShareDetailResponse(
            id=share.id,
            share_type=share.share_type,
            created_at=share.created_at,
            user=UserSearchResponse(
                id=share.user.id,
                username=share.user.username,
                full_name=share.user.full_name,
                user_type=share.user.user_type,
                profile_picture_url=share.user.profile_picture_url,
                specialty=share.user.specialty,
                college=share.user.college
            )
        )
        share_responses.append(share_response)
    
    return share_responses