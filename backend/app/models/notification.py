# backend/app/models/notification.py
"""
Notification model for IAP Connect application.
Handles user notifications for social interactions.
COMPLETE: All features integrated with existing structure (500+ lines)
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, and_
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, Session, joinedload
import enum
import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

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
    recipient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    
    # Notification details
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(Text, nullable=True)  # JSON string for additional data
    
    # Status
    is_read = Column(Boolean, default=False, index=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="received_notifications")
    sender = relationship("User", foreign_keys=[sender_id])
    
    def __repr__(self):
        return f"<Notification(id={self.id}, type='{self.type}', recipient_id={self.recipient_id})>"
    
    def to_dict(self):
        """Convert notification to dictionary for API responses"""
        data_dict = {}
        if self.data:
            try:
                data_dict = json.loads(self.data)
            except json.JSONDecodeError:
                data_dict = {}
        
        return {
            "id": self.id,
            "type": self.type.value,
            "title": self.title,
            "message": self.message,
            "data": data_dict,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "recipient_id": self.recipient_id,
            "sender_id": self.sender_id,
            "sender": {
                "id": self.sender.id,
                "username": self.sender.username,
                "full_name": self.sender.full_name,
                "user_type": self.sender.user_type.value if hasattr(self.sender.user_type, 'value') else str(self.sender.user_type),
                "profile_picture_url": self.sender.profile_picture_url,
                "specialty": self.sender.specialty,
                "college": self.sender.college
            } if self.sender else None
        }
    
    @property
    def display_message(self):
        """Get formatted display message with sender name"""
        if self.sender:
            return f"{self.sender.full_name} {self.message}"
        return self.message
    
    @property
    def time_since_created(self):
        """Get human-readable time since notification was created"""
        if not self.created_at:
            return "Unknown"
        
        now = datetime.utcnow()
        diff = now - self.created_at
        
        if diff.days > 0:
            return f"{diff.days}d ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours}h ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes}m ago"
        else:
            return "Just now"


class NotificationService:
    """Service class for notification operations with complete functionality"""
    
    @staticmethod
    def create_notification(
        db: Session,
        recipient_id: int,
        type: NotificationType,
        title: str,
        message: str,
        sender_id: int = None,
        data: dict = None
    ) -> Optional[Notification]:
        """
        Create a new notification with comprehensive validation.
        
        Args:
            db: Database session
            recipient_id: ID of user receiving notification
            type: Type of notification
            title: Notification title
            message: Notification message
            sender_id: ID of user who triggered notification (optional)
            data: Additional data as dictionary
            
        Returns:
            Notification: Created notification object or None if skipped
        """
        # Don't create notification if sender and recipient are the same
        if sender_id and sender_id == recipient_id:
            print(f"⚠️ Skipping self-notification for user {recipient_id}")
            return None
        
        # Validate recipient exists
        from ..models.user import User
        recipient = db.query(User).filter(User.id == recipient_id).first()
        if not recipient:
            print(f"⚠️ Recipient user {recipient_id} not found")
            return None
        
        # Validate sender exists if provided
        sender = None
        if sender_id:
            sender = db.query(User).filter(User.id == sender_id).first()
            if not sender:
                print(f"⚠️ Sender user {sender_id} not found")
                return None
        
        # Check for duplicate notifications (prevent spam)
        if sender_id and type in [NotificationType.LIKE, NotificationType.COMMENT]:
            recent_notification = db.query(Notification).filter(
                and_(
                    Notification.recipient_id == recipient_id,
                    Notification.sender_id == sender_id,
                    Notification.type == type,
                    Notification.created_at >= datetime.utcnow() - timedelta(minutes=5)
                )
            ).first()
            
            if recent_notification and data and recent_notification.data:
                try:
                    recent_data = json.loads(recent_notification.data)
                    if recent_data.get("post_id") == data.get("post_id"):
                        print(f"⚠️ Duplicate notification prevented for user {recipient_id}")
                        return recent_notification
                except json.JSONDecodeError:
                    pass
        
        data_json = json.dumps(data) if data else None
        
        notification = Notification(
            recipient_id=recipient_id,
            sender_id=sender_id,
            type=type,
            title=title,
            message=message,
            data=data_json
        )
        
        try:
            db.add(notification)
            db.commit()
            db.refresh(notification)
            print(f"✅ Created notification {notification.id} for user {recipient_id}")
            return notification
        except Exception as e:
            db.rollback()
            print(f"❌ Failed to create notification: {str(e)}")
            return None
    
    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: int,
        page: int = 1,
        size: int = 20,
        unread_only: bool = False
    ) -> tuple:
        """
        Get paginated notifications for a user with comprehensive filtering.
        
        Args:
            db: Database session
            user_id: User ID
            page: Page number (1-based)
            size: Number of notifications per page
            unread_only: Filter to show only unread notifications
            
        Returns:
            tuple: (notifications_list, total_count, unread_count)
        """
        try:
            # Base query with eager loading
            query = db.query(Notification).options(
                joinedload(Notification.sender)
            ).filter(Notification.recipient_id == user_id)
            
            if unread_only:
                query = query.filter(Notification.is_read == False)
            
            # Get total count for pagination
            total = query.count()
            
            # Get unread count (separate query for accuracy)
            unread_count = db.query(Notification).filter(
                and_(
                    Notification.recipient_id == user_id,
                    Notification.is_read == False
                )
            ).count()
            
            # Get paginated results ordered by creation date (newest first)
            notifications = (query
                            .order_by(Notification.created_at.desc())
                            .offset((page - 1) * size)
                            .limit(size)
                            .all())
            
            # Convert to dictionaries with complete sender info
            notifications_list = []
            for notification in notifications:
                try:
                    notifications_list.append(notification.to_dict())
                except Exception as e:
                    print(f"⚠️ Error converting notification {notification.id}: {str(e)}")
                    # Add basic notification without sender info
                    notifications_list.append({
                        "id": notification.id,
                        "type": notification.type.value,
                        "title": notification.title,
                        "message": notification.message,
                        "data": {},
                        "is_read": notification.is_read,
                        "created_at": notification.created_at.isoformat() if notification.created_at else None,
                        "sender": None
                    })
            
            return notifications_list, total, unread_count
            
        except Exception as e:
            print(f"❌ Error getting notifications for user {user_id}: {str(e)}")
            return [], 0, 0
    
    @staticmethod
    def mark_notification_as_read(db: Session, notification_id: int, user_id: int) -> bool:
        """
        Mark a notification as read with security validation.
        
        Args:
            db: Database session
            notification_id: Notification ID
            user_id: User ID (for security)
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            notification = db.query(Notification).filter(
                and_(
                    Notification.id == notification_id,
                    Notification.recipient_id == user_id
                )
            ).first()
            
            if notification and not notification.is_read:
                notification.is_read = True
                db.commit()
                print(f"✅ Marked notification {notification_id} as read for user {user_id}")
                return True
            elif notification and notification.is_read:
                print(f"⚠️ Notification {notification_id} already read")
                return True  # Already read, consider it success
            else:
                print(f"⚠️ Notification {notification_id} not found for user {user_id}")
                return False
                
        except Exception as e:
            db.rollback()
            print(f"❌ Error marking notification {notification_id} as read: {str(e)}")
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
        try:
            updated_count = db.query(Notification).filter(
                and_(
                    Notification.recipient_id == user_id,
                    Notification.is_read == False
                )
            ).update({"is_read": True})
            
            db.commit()
            print(f"✅ Marked {updated_count} notifications as read for user {user_id}")
            return updated_count
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error marking all notifications as read for user {user_id}: {str(e)}")
            return 0
    
    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        """Get unread notification count for a user with error handling"""
        try:
            count = db.query(Notification).filter(
                and_(
                    Notification.recipient_id == user_id,
                    Notification.is_read == False
                )
            ).count()
            return count
        except Exception as e:
            print(f"❌ Error getting unread count for user {user_id}: {str(e)}")
            return 0
    
    @staticmethod
    def delete_old_notifications(db: Session, days: int = 30) -> int:
        """
        Delete notifications older than specified days with safety checks.
        
        Args:
            db: Database session
            days: Number of days to keep notifications (minimum 7)
            
        Returns:
            int: Number of deleted notifications
        """
        try:
            # Safety check - don't delete too recent notifications
            if days < 7:
                days = 7
                print(f"⚠️ Minimum 7 days enforced for notification cleanup")
            
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            # Get count first for logging
            to_delete_count = db.query(Notification).filter(
                Notification.created_at < cutoff_date
            ).count()
            
            if to_delete_count == 0:
                print(f"✅ No notifications older than {days} days found")
                return 0
            
            # Perform deletion
            deleted_count = db.query(Notification).filter(
                Notification.created_at < cutoff_date
            ).delete()
            
            db.commit()
            print(f"✅ Deleted {deleted_count} notifications older than {days} days")
            return deleted_count
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error deleting old notifications: {str(e)}")
            return 0

    @staticmethod
    def create_like_notification(db: Session, post_owner_id: int, sender_id: int, post_id: int) -> Optional[Notification]:
        """Create notification when someone likes a post"""
        if post_owner_id == sender_id:  # Don't notify self
            return None
        
        try:
            # Get sender info for personalized message
            from ..models.user import User
            sender = db.query(User).filter(User.id == sender_id).first()
            sender_name = sender.full_name if sender else "Someone"
            
            return NotificationService.create_notification(
                db=db,
                recipient_id=post_owner_id,
                sender_id=sender_id,
                type=NotificationType.LIKE,
                title="New Like",
                message=f"liked your post",
                data={"post_id": post_id, "action": "like"}
            )
        except Exception as e:
            print(f"❌ Error creating like notification: {str(e)}")
            return None
    
    @staticmethod
    def create_comment_notification(db: Session, post_owner_id: int, sender_id: int, post_id: int, comment_id: int) -> Optional[Notification]:
        """Create notification when someone comments on a post"""
        if post_owner_id == sender_id:  # Don't notify self
            return None
        
        try:
            # Get sender info for personalized message
            from ..models.user import User
            sender = db.query(User).filter(User.id == sender_id).first()
            sender_name = sender.full_name if sender else "Someone"
            
            return NotificationService.create_notification(
                db=db,
                recipient_id=post_owner_id,
                sender_id=sender_id,
                type=NotificationType.COMMENT,
                title="New Comment",
                message=f"commented on your post",
                data={"post_id": post_id, "comment_id": comment_id, "action": "comment"}
            )
        except Exception as e:
            print(f"❌ Error creating comment notification: {str(e)}")
            return None
    
    @staticmethod
    def create_follow_notification(db: Session, followed_user_id: int, follower_id: int) -> Optional[Notification]:
        """Create notification when someone follows a user"""
        try:
            # Get follower info for personalized message
            from ..models.user import User
            follower = db.query(User).filter(User.id == follower_id).first()
            follower_name = follower.full_name if follower else "Someone"
            
            return NotificationService.create_notification(
                db=db,
                recipient_id=followed_user_id,
                sender_id=follower_id,
                type=NotificationType.FOLLOW,
                title="New Follower",
                message=f"started following you",
                data={"action": "follow"}
            )
        except Exception as e:
            print(f"❌ Error creating follow notification: {str(e)}")
            return None
    
    @staticmethod
    def create_mention_notification(db: Session, mentioned_user_id: int, sender_id: int, post_id: int, mention_text: str) -> Optional[Notification]:
        """Create notification when someone mentions a user in a post"""
        if mentioned_user_id == sender_id:  # Don't notify self
            return None
        
        try:
            from ..models.user import User
            sender = db.query(User).filter(User.id == sender_id).first()
            sender_name = sender.full_name if sender else "Someone"
            
            return NotificationService.create_notification(
                db=db,
                recipient_id=mentioned_user_id,
                sender_id=sender_id,
                type=NotificationType.MENTION,
                title="You were mentioned",
                message=f"mentioned you in a post",
                data={"post_id": post_id, "mention_text": mention_text, "action": "mention"}
            )
        except Exception as e:
            print(f"❌ Error creating mention notification: {str(e)}")
            return None
    
    @staticmethod
    def create_system_notification(db: Session, user_id: int, title: str, message: str, data: dict = None) -> Optional[Notification]:
        """Create system notification for user"""
        try:
            return NotificationService.create_notification(
                db=db,
                recipient_id=user_id,
                sender_id=None,  # System notification
                type=NotificationType.SYSTEM,
                title=title,
                message=message,
                data=data or {"action": "system"}
            )
        except Exception as e:
            print(f"❌ Error creating system notification: {str(e)}")
            return None
    
    @staticmethod
    def get_notification_stats(db: Session, user_id: int) -> dict:
        """Get comprehensive notification statistics for a user"""
        try:
            from datetime import datetime, timedelta
            
            # Get total notifications
            total_notifications = db.query(Notification).filter(
                Notification.recipient_id == user_id
            ).count()
            
            # Get unread count
            unread_count = NotificationService.get_unread_count(db, user_id)
            
            # Get recent notifications (last 24 hours)
            yesterday = datetime.utcnow() - timedelta(hours=24)
            recent_count = db.query(Notification).filter(
                and_(
                    Notification.recipient_id == user_id,
                    Notification.created_at >= yesterday
                )
            ).count()
            
            # Get notifications by type
            type_counts = {}
            for notification_type in NotificationType:
                count = db.query(Notification).filter(
                    and_(
                        Notification.recipient_id == user_id,
                        Notification.type == notification_type
                    )
                ).count()
                type_counts[notification_type.value] = count
            
            return {
                "total_notifications": total_notifications,
                "unread_count": unread_count,
                "recent_count": recent_count,
                "type_counts": type_counts,
                "success": True
            }
            
        except Exception as e:
            print(f"❌ Error getting notification stats for user {user_id}: {str(e)}")
            return {
                "total_notifications": 0,
                "unread_count": 0,
                "recent_count": 0,
                "type_counts": {},
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def delete_notification(db: Session, notification_id: int, user_id: int) -> bool:
        """Delete a specific notification (user can only delete their own)"""
        try:
            notification = db.query(Notification).filter(
                and_(
                    Notification.id == notification_id,
                    Notification.recipient_id == user_id
                )
            ).first()
            
            if notification:
                db.delete(notification)
                db.commit()
                print(f"✅ Deleted notification {notification_id} for user {user_id}")
                return True
            else:
                print(f"⚠️ Notification {notification_id} not found for user {user_id}")
                return False
                
        except Exception as e:
            db.rollback()
            print(f"❌ Error deleting notification {notification_id}: {str(e)}")
            return False
    
    @staticmethod
    def bulk_create_notifications(db: Session, notifications_data: List[dict]) -> int:
        """Create multiple notifications in bulk for efficiency"""
        try:
            created_count = 0
            for data in notifications_data:
                notification = NotificationService.create_notification(
                    db=db,
                    recipient_id=data.get("recipient_id"),
                    type=data.get("type"),
                    title=data.get("title"),
                    message=data.get("message"),
                    sender_id=data.get("sender_id"),
                    data=data.get("data")
                )
                if notification:
                    created_count += 1
            
            print(f"✅ Created {created_count} notifications in bulk")
            return created_count
            
        except Exception as e:
            print(f"❌ Error in bulk notification creation: {str(e)}")
            return 0