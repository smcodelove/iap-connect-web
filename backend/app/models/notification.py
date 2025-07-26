# backend/app/models/notification.py
"""
Notification model for IAP Connect application.
Handles user notifications for social interactions.
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from ..config.database import Base


class NotificationType(enum.Enum):
    """Notification types for different actions"""
    LIKE = "like"
    COMMENT = "comment"
    FOLLOW = "follow"
    MENTION = "mention"
    POST_UPDATE = "post_update"
    SYSTEM = "system"


class Notification(Base):
    """
    Notification model for user notifications.
    
    Attributes:
        id: Primary key
        recipient_id: User receiving the notification
        sender_id: User who triggered the notification (optional)
        type: Type of notification
        title: Notification title
        message: Notification message
        data: Additional JSON data (post_id, comment_id, etc.)
        is_read: Whether notification has been read
        created_at: Notification creation timestamp
    """
    
    __tablename__ = "notifications"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    # Notification details
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(Text, nullable=True)  # JSON string for additional data
    
    # Status
    is_read = Column(Boolean, default=False)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_notifications")
    sender = relationship("User", foreign_keys=[sender_id])


# backend/app/schemas/notification.py
"""
Notification schemas for IAP Connect application.
Pydantic models for notification API requests and responses.
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from ..models.notification import NotificationType
from .user import UserBasicInfo


class NotificationBase(BaseModel):
    """Base notification schema"""
    type: NotificationType
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None


class NotificationCreate(NotificationBase):
    """Schema for creating notifications"""
    recipient_id: int
    sender_id: Optional[int] = None


class NotificationResponse(NotificationBase):
    """Schema for notification responses"""
    id: int
    recipient_id: int
    sender_id: Optional[int] = None
    is_read: bool
    created_at: datetime
    sender: Optional[UserBasicInfo] = None

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """Schema for notification list responses"""
    notifications: list[NotificationResponse]
    total: int
    unread_count: int
    page: int
    has_next: bool


class NotificationStatsResponse(BaseModel):
    """Schema for notification statistics"""
    total_notifications: int
    unread_count: int
    recent_count: int  # Notifications from last 24 hours


# backend/app/services/notification_service.py
"""
Notification service for IAP Connect application.
Handles notification creation, delivery, and management.
"""

import json
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_, func
from typing import List, Optional, Dict, Any
from ..models.user import User
from ..models.notification import Notification, NotificationType
from ..models.post import Post
from ..models.comment import Comment
from ..schemas.notification import NotificationCreate, NotificationResponse
from ..schemas.user import UserBasicInfo


class NotificationService:
    """Service class for handling notifications"""
    
    @staticmethod
    def create_notification(
        db: Session,
        recipient_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        sender_id: Optional[int] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> Notification:
        """
        Create a new notification.
        
        Args:
            db: Database session
            recipient_id: User receiving the notification
            notification_type: Type of notification
            title: Notification title
            message: Notification message
            sender_id: User who triggered the notification
            data: Additional data (post_id, comment_id, etc.)
            
        Returns:
            Notification: Created notification
        """
        # Don't create notification if sender and recipient are the same
        if sender_id and sender_id == recipient_id:
            return None
            
        notification = Notification(
            recipient_id=recipient_id,
            sender_id=sender_id,
            type=notification_type,
            title=title,
            message=message,
            data=json.dumps(data) if data else None
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        return notification
    
    @staticmethod
    def create_like_notification(db: Session, post: Post, liker: User) -> Optional[Notification]:
        """Create notification for post like"""
        if post.user_id == liker.id:
            return None  # Don't notify if user likes their own post
            
        return NotificationService.create_notification(
            db=db,
            recipient_id=post.user_id,
            sender_id=liker.id,
            notification_type=NotificationType.LIKE,
            title="New Like",
            message=f"{liker.full_name} liked your post",
            data={"post_id": post.id, "action": "like"}
        )
    
    @staticmethod
    def create_comment_notification(db: Session, post: Post, commenter: User, comment: Comment) -> Optional[Notification]:
        """Create notification for new comment"""
        if post.user_id == commenter.id:
            return None  # Don't notify if user comments on their own post
            
        return NotificationService.create_notification(
            db=db,
            recipient_id=post.user_id,
            sender_id=commenter.id,
            notification_type=NotificationType.COMMENT,
            title="New Comment",
            message=f"{commenter.full_name} commented on your post",
            data={"post_id": post.id, "comment_id": comment.id, "action": "comment"}
        )
    
    @staticmethod
    def create_follow_notification(db: Session, followed_user: User, follower: User) -> Optional[Notification]:
        """Create notification for new follower"""
        return NotificationService.create_notification(
            db=db,
            recipient_id=followed_user.id,
            sender_id=follower.id,
            notification_type=NotificationType.FOLLOW,
            title="New Follower",
            message=f"{follower.full_name} started following you",
            data={"user_id": follower.id, "action": "follow"}
        )
    
    @staticmethod
    def get_user_notifications(
        db: Session, 
        user_id: int, 
        page: int = 1, 
        size: int = 20,
        unread_only: bool = False
    ) -> tuple[List[NotificationResponse], int, int]:
        """
        Get user notifications with pagination.
        
        Args:
            db: Database session
            user_id: User ID
            page: Page number
            size: Page size
            unread_only: Only return unread notifications
            
        Returns:
            tuple: (notifications, total_count, unread_count)
        """
        query = db.query(Notification).options(
            joinedload(Notification.sender)
        ).filter(Notification.recipient_id == user_id)
        
        if unread_only:
            query = query.filter(Notification.is_read == False)
        
        # Get total count
        total_count = query.count()
        
        # Get unread count
        unread_count = db.query(Notification).filter(
            and_(Notification.recipient_id == user_id, Notification.is_read == False)
        ).count()
        
        # Get paginated notifications
        notifications = query.order_by(desc(Notification.created_at)).offset(
            (page - 1) * size
        ).limit(size).all()
        
        # Convert to response objects
        notification_responses = []
        for notification in notifications:
            sender_info = None
            if notification.sender:
                sender_info = UserBasicInfo(
                    id=notification.sender.id,
                    username=notification.sender.username,
                    full_name=notification.sender.full_name,
                    user_type=notification.sender.user_type.value,
                    profile_picture_url=notification.sender.profile_picture_url,
                    specialty=notification.sender.specialty,
                    college=notification.sender.college
                )
            
            data = None
            if notification.data:
                try:
                    data = json.loads(notification.data)
                except json.JSONDecodeError:
                    data = None
            
            notification_responses.append(NotificationResponse(
                id=notification.id,
                recipient_id=notification.recipient_id,
                sender_id=notification.sender_id,
                type=notification.type,
                title=notification.title,
                message=notification.message,
                data=data,
                is_read=notification.is_read,
                created_at=notification.created_at,
                sender=sender_info
            ))
        
        return notification_responses, total_count, unread_count
    
    @staticmethod
    def mark_notification_as_read(db: Session, notification_id: int, user_id: int) -> bool:
        """
        Mark a notification as read.
        
        Args:
            db: Database session
            notification_id: Notification ID
            user_id: User ID (for security)
            
        Returns:
            bool: True if successful, False otherwise
        """
        notification = db.query(Notification).filter(
            and_(
                Notification.id == notification_id,
                Notification.recipient_id == user_id
            )
        ).first()
        
        if notification:
            notification.is_read = True
            db.commit()
            return True
        
        return False
    
    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        """
        Mark all notifications as read for a user.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            int: Number of notifications marked as read
        """
        updated_count = db.query(Notification).filter(
            and_(
                Notification.recipient_id == user_id,
                Notification.is_read == False
            )
        ).update({"is_read": True})
        
        db.commit()
        return updated_count
    
    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        """Get unread notification count for a user"""
        return db.query(Notification).filter(
            and_(
                Notification.recipient_id == user_id,
                Notification.is_read == False
            )
        ).count()
    
    @staticmethod
    def delete_old_notifications(db: Session, days: int = 30) -> int:
        """
        Delete notifications older than specified days.
        
        Args:
            db: Database session
            days: Number of days to keep notifications
            
        Returns:
            int: Number of deleted notifications
        """
        from datetime import datetime, timedelta
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        deleted_count = db.query(Notification).filter(
            Notification.created_at < cutoff_date
        ).delete()
        
        db.commit()
        return deleted_count


# backend/app/routers/notifications.py
"""
Notification routes for IAP Connect application.
Handles notification management and delivery.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from ..config.database import get_db
from ..schemas.notification import NotificationListResponse, NotificationStatsResponse
from ..services.notification_service import NotificationService
from ..utils.dependencies import get_current_active_user
from ..models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def get_notifications(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False, description="Only return unread notifications"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user notifications with pagination.
    
    - **page**: Page number (default: 1)
    - **size**: Number of notifications per page (default: 20, max: 100)
    - **unread_only**: Filter to show only unread notifications
    
    Returns paginated list of notifications with sender information.
    """
    notifications, total, unread_count = NotificationService.get_user_notifications(
        db, current_user.id, page, size, unread_only
    )
    
    has_next = (page * size) < total
    
    return NotificationListResponse(
        notifications=notifications,
        total=total,
        unread_count=unread_count,
        page=page,
        has_next=has_next
    )


@router.put("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mark a specific notification as read.
    
    - **notification_id**: ID of the notification to mark as read
    
    Returns success status.
    """
    success = NotificationService.mark_notification_as_read(
        db, notification_id, current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    return {"success": True, "message": "Notification marked as read"}


@router.put("/mark-all-read")
def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications as read for the current user.
    
    Returns number of notifications marked as read.
    """
    updated_count = NotificationService.mark_all_as_read(db, current_user.id)
    
    return {
        "success": True,
        "message": f"Marked {updated_count} notifications as read",
        "updated_count": updated_count
    }


@router.get("/unread-count")
def get_unread_notification_count(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get count of unread notifications for the current user.
    
    Returns unread notification count.
    """
    unread_count = NotificationService.get_unread_count(db, current_user.id)
    
    return {
        "unread_count": unread_count
    }


@router.get("/stats", response_model=NotificationStatsResponse)
def get_notification_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get notification statistics for the current user.
    
    Returns total, unread, and recent notification counts.
    """
    from datetime import datetime, timedelta
    from sqlalchemy import and_
    from ..models.notification import Notification
    
    # Get total notifications
    total_notifications = db.query(Notification).filter(
        Notification.recipient_id == current_user.id
    ).count()
    
    # Get unread count
    unread_count = NotificationService.get_unread_count(db, current_user.id)
    
    # Get recent notifications (last 24 hours)
    yesterday = datetime.utcnow() - timedelta(hours=24)
    recent_count = db.query(Notification).filter(
        and_(
            Notification.recipient_id == current_user.id,
            Notification.created_at >= yesterday
        )
    ).count()
    
    return NotificationStatsResponse(
        total_notifications=total_notifications,
        unread_count=unread_count,
        recent_count=recent_count
    )


# Additional endpoint for admin to clean up old notifications
@router.delete("/cleanup")
def cleanup_old_notifications(
    days: int = Query(30, ge=1, description="Delete notifications older than this many days"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Clean up old notifications (Admin only).
    
    - **days**: Delete notifications older than this many days (default: 30)
    
    Returns number of deleted notifications.
    """
    from ..utils.dependencies import get_admin_user
    
    # Verify admin permissions
    get_admin_user(current_user)
    
    deleted_count = NotificationService.delete_old_notifications(db, days)
    
    return {
        "success": True,
        "message": f"Deleted {deleted_count} old notifications",
        "deleted_count": deleted_count
    }