"""
Share routes for IAP Connect application.
Handles post sharing functionality.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from ..config.database import get_db
from ..schemas.share import ShareCreate, ShareResponse
from ..services.share_service import create_share, get_post_shares
from ..services.post_service import get_post_by_id
from ..utils.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/posts", tags=["Shares"])


@router.post("/{post_id}/share", response_model=ShareResponse, status_code=status.HTTP_201_CREATED)
def share_post(
    post_id: int,
    share_data: Optional[ShareCreate] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Share a post.
    
    - **post_id**: Post ID to share
    - **share_type**: Type of share (optional: external, internal, copy_link)
    
    Returns success status and updated share count.
    """
    # Verify post exists
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Default share type
    share_type = share_data.share_type if share_data else "external"
    
    result = create_share(current_user, post, share_type, db)
    
    return ShareResponse(
        success=True,
        shared=True,
        shares_count=result['shares_count'],
        share_type=share_type
    )


@router.get("/{post_id}/shares")
def get_shares(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get shares for a specific post (admin only).
    
    - **post_id**: Post ID to get shares for
    
    Returns list of users who shared the post.
    """
    # Verify post exists
    post = get_post_by_id(post_id, db)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Only allow admin or post owner to see shares
    if current_user.user_type.value != "admin" and current_user.id != post.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view shares"
        )
    
    shares = get_post_shares(post_id, db)
    
    return {
        "shares": shares,
        "total": len(shares)
    }