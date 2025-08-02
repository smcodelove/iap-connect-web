# backend/app/services/notification_service.py
"""
Notification service for IAP Connect application.
Handles notification creation, delivery, and management.
COMPLETE: All service methods integrated with existing structure
"""

import json
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_, func, or_
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta

# Import models
from ..models.user import User
from ..models.notification import Notification, NotificationType
from ..models.post import Post
from ..models.comment import Comment

# Import schemas
from ..schemas.notification import (
    NotificationCreate, NotificationResponse, NotificationListResponse,
    UserBasicInfo, NotificationStatsResponse, NotificationFilter
)


class NotificationService:
    """Comprehensive service class for handling all notification operations"""
    
    @staticmethod
    def create_notification(
        db: Session,
        recipient_id: int,
        notification_type: NotificationType,
        title: str,
        message: str,
        sender_id: Optional[int] = None,
        data: Optional[Dict[str, Any]] = None
    ) -> Optional[Notification]:
        """
        Create a new notification with comprehensive validation and duplicate prevention.
        
        Args:
            db: Database session
            recipient_id: User receiving the notification
            notification_type: Type of notification
            title: Notification title
            message: Notification message
            sender_id: User who triggered the notification
            data: Additional data (post_id, comment_id, etc.)
            
        Returns:
            Notification: Created notification or None if validation fails
        """
        try:
            # Don't create notification if sender and recipient are the same
            if sender_id and sender_id == recipient_id:
                print(f"⚠️ Skipping self-notification for user {recipient_id}")
                return None
            
            # Validate recipient exists and is active
            recipient = db.query(User).filter(
                and_(User.id == recipient_id, User.is_active == True)
            ).first()
            if not recipient:
                print(f"⚠️ Recipient user {recipient_id} not found or inactive")
                return None
            
            # Validate sender exists if provided
            sender = None
            if sender_id:
                sender = db.query(User).filter(
                    and_(User.id == sender_id, User.is_active == True)
                ).first()
                if not sender:
                    print(f"⚠️ Sender user {sender_id} not found or inactive")
                    return None
            
            # Prevent duplicate notifications (anti-spam)
            if sender_id and notification_type in [NotificationType.LIKE, NotificationType.COMMENT]:
                recent_cutoff = datetime.utcnow() - timedelta(minutes=5)
                existing_notification = db.query(Notification).filter(
                    and_(
                        Notification.recipient_id == recipient_id,
                        Notification.sender_id == sender_id,
                        Notification.type == notification_type,
                        Notification.created_at >= recent_cutoff
                    )
                ).first()
                
                if existing_notification and data and existing_notification.data:
                    try:
                        existing_data = json.loads(existing_notification.data)
                        if existing_data.get("post_id") == data.get("post_id"):
                            print(f"⚠️ Duplicate notification prevented for user {recipient_id}")
                            return existing_notification
                    except (json.JSONDecodeError, AttributeError):
                        pass
            
            # Create the notification
            data_json = json.dumps(data) if data else None
            
            notification = Notification(
                recipient_id=recipient_id,
                sender_id=sender_id,
                type=notification_type,
                title=title,
                message=message,
                data=data_json
            )
            
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
    def create_like_notification(db: Session, post: Post, liker: User) -> Optional[Notification]:
        """
        Create notification for post like with enhanced context.
        
        Args:
            db: Database session
            post: Post that was liked
            liker: User who liked the post
            
        Returns:
            Notification: Created notification or None
        """
        if post.user_id == liker.id:
            return None  # Don't notify if user likes their own post
        
        try:
            # Get post preview for context
            post_preview = post.content[:50] + "..." if len(post.content) > 50 else post.content
            
            return NotificationService.create_notification(
                db=db,
                recipient_id=post.user_id,
                sender_id=liker.id,
                notification_type=NotificationType.LIKE,
                title="New Like",
                message=f"liked your post",
                data={
                    "post_id": post.id,
                    "post_preview": post_preview,
                    "action": "like",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            print(f"❌ Error creating like notification: {str(e)}")
            return None
    
    @staticmethod
    def create_comment_notification(db: Session, post: Post, commenter: User, comment: Comment) -> Optional[Notification]:
        """
        Create notification for new comment with enhanced context.
        
        Args:
            db: Database session
            post: Post that was commented on
            commenter: User who made the comment
            comment: The comment object
            
        Returns:
            Notification: Created notification or None
        """
        if post.user_id == commenter.id:
            return None  # Don't notify if user comments on their own post
        
        try:
            # Get comment preview for context
            comment_preview = comment.content[:50] + "..." if len(comment.content) > 50 else comment.content
            post_preview = post.content[:50] + "..." if len(post.content) > 50 else post.content
            
            return NotificationService.create_notification(
                db=db,
                recipient_id=post.user_id,
                sender_id=commenter.id,
                notification_type=NotificationType.COMMENT,
                title="New Comment",
                message=f"commented on your post",
                data={
                    "post_id": post.id,
                    "comment_id": comment.id,
                    "post_preview": post_preview,
                    "comment_preview": comment_preview,
                    "action": "comment",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            print(f"❌ Error creating comment notification: {str(e)}")
            return None
    
    @staticmethod
    def create_follow_notification(db: Session, followed_user: User, follower: User) -> Optional[Notification]:
        """
        Create notification for new follower.
        
        Args:
            db: Database session
            followed_user: User being followed
            follower: User who started following
            
        Returns:
            Notification: Created notification or None
        """
        try:
            return NotificationService.create_notification(
                db=db,
                recipient_id=followed_user.id,
                sender_id=follower.id,
                notification_type=NotificationType.FOLLOW,
                title="New Follower",
                message=f"started following you",
                data={
                    "user_id": follower.id,
                    "action": "follow",
                    "follower_type": follower.user_type.value if hasattr(follower.user_type, 'value') else str(follower.user_type),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            print(f"❌ Error creating follow notification: {str(e)}")
            return None
    
    @staticmethod
    def get_user_notifications(
        db: Session, 
        user_id: int, 
        page: int = 1, 
        size: int = 20,
        unread_only: bool = False,
        notification_filter: Optional[NotificationFilter] = None
    ) -> Tuple[List[NotificationResponse], int, int]:
        """
        Get user notifications with advanced filtering and pagination.
        
        Args:
            db: Database session
            user_id: User ID
            page: Page number
            size: Page size
            unread_only: Only return unread notifications
            notification_filter: Advanced filtering options
            
        Returns:
            tuple: (notifications, total_count, unread_count)
        """
        try:
            # Base query with eager loading
            query = db.query(Notification).options(
                joinedload(Notification.sender)
            ).filter(Notification.recipient_id == user_id)
            
            # Apply filters
            if unread_only:
                query = query.filter(Notification.is_read == False)
            
            if notification_filter:
                if notification_filter.type:
                    query = query.filter(Notification.type == notification_filter.type)
                
                if notification_filter.is_read is not None:
                    query = query.filter(Notification.is_read == notification_filter.is_read)
                
                if notification_filter.sender_id:
                    query = query.filter(Notification.sender_id == notification_filter.sender_id)
                
                if notification_filter.date_from:
                    query = query.filter(Notification.created_at >= notification_filter.date_from)
                
                if notification_filter.date_to:
                    query = query.filter(Notification.created_at <= notification_filter.date_to)
            
            # Get total count for pagination
            total_count = query.count()
            
            # Get unread count (separate query for accuracy)
            unread_count = db.query(Notification).filter(
                and_(Notification.recipient_id == user_id, Notification.is_read == False)
            ).count()
            
            # Get paginated notifications ordered by creation date (newest first)
            notifications = (query
                           .order_by(Notification.created_at.desc())
                           .offset((page - 1) * size)
                           .limit(size)
                           .all())
            
            # Convert to response objects with complete sender information
            notification_responses = []
            for notification in notifications:
                try:
                    sender_info = None
                    if notification.sender:
                        sender_info = UserBasicInfo(
                            id=notification.sender.id,
                            username=notification.sender.username,
                            full_name=notification.sender.full_name,
                            user_type=notification.sender.user_type.value if hasattr(notification.sender.user_type, 'value') else str(notification.sender.user_type),
                            profile_picture_url=notification.sender.profile_picture_url,
                            specialty=notification.sender.specialty,
                            college=notification.sender.college
                        )
                    
                    # Parse data safely
                    data = {}
                    if notification.data:
                        try:
                            data = json.loads(notification.data)
                        except json.JSONDecodeError:
                            data = {}
                    
                    # Create response object
                    notification_response = NotificationResponse(
                        id=notification.id,
                        recipient_id=notification.recipient_id,
                        sender_id=notification.sender_id,
                        type=notification.type,
                        title=notification.title,
                        message=notification.message,
                        data=data,
                        is_read=notification.is_read,
                        created_at=notification.created_at,
                        sender=sender_info,
                        time_since_created=notification.time_since_created,
                        display_message=notification.display_message
                    )
                    
                    notification_responses.append(notification_response)
                    
                except Exception as e:
                    print(f"⚠️ Error converting notification {notification.id}: {str(e)}")
                    # Add basic notification without sender info as fallback
                    basic_notification = NotificationResponse(
                        id=notification.id,
                        recipient_id=notification.recipient_id,
                        sender_id=notification.sender_id,
                        type=notification.type,
                        title=notification.title,
                        message=notification.message,
                        data={},
                        is_read=notification.is_read,
                        created_at=notification.created_at,
                        sender=None
                    )
                    notification_responses.append(basic_notification)
            
            return notification_responses, total_count, unread_count
            
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
            
            if notification:
                if not notification.is_read:
                    notification.is_read = True
                    db.commit()
                    print(f"✅ Marked notification {notification_id} as read for user {user_id}")
                else:
                    print(f"⚠️ Notification {notification_id} already read")
                return True
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
    def get_notification_stats(db: Session, user_id: int) -> Dict[str, Any]:
        """Get comprehensive notification statistics for a user"""
        try:
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
            
            # Get most recent notification
            latest_notification = db.query(Notification).filter(
                Notification.recipient_id == user_id
            ).order_by(Notification.created_at.desc()).first()
            
            # Calculate read rate
            read_rate = 0.0
            if total_notifications > 0:
                read_count = total_notifications - unread_count
                read_rate = read_count / total_notifications
            
            return {
                "total_notifications": total_notifications,
                "unread_count": unread_count,
                "recent_count": recent_count,
                "type_counts": type_counts,
                "read_rate": round(read_rate, 2),
                "latest_notification_id": latest_notification.id if latest_notification else None,
                "success": True
            }
            
        except Exception as e:
            print(f"❌ Error getting notification stats for user {user_id}: {str(e)}")
            return {
                "total_notifications": 0,
                "unread_count": 0,
                "recent_count": 0,
                "type_counts": {},
                "read_rate": 0.0,
                "latest_notification_id": None,
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
    def search_notifications(
        db: Session, 
        user_id: int, 
        query: str, 
        page: int = 1, 
        size: int = 20
    ) -> Tuple[List[NotificationResponse], int]:
        """Search user notifications by content"""
        try:
            # Search in title and message
            search_query = db.query(Notification).options(
                joinedload(Notification.sender)
            ).filter(
                and_(
                    Notification.recipient_id == user_id,
                    or_(
                        Notification.title.ilike(f"%{query}%"),
                        Notification.message.ilike(f"%{query}%")
                    )
                )
            )
            
            total = search_query.count()
            
            notifications = (search_query
                           .order_by(Notification.created_at.desc())
                           .offset((page - 1) * size)
                           .limit(size)
                           .all())
            
            # Convert to response objects
            notification_responses = []
            for notification in notifications:
                notification_responses.append(notification.to_dict())
            
            return notification_responses, total
            
        except Exception as e:
            print(f"❌ Error searching notifications: {str(e)}")
            return [], 0
    
    @staticmethod
    def bulk_mark_read(db: Session, notification_ids: List[int], user_id: int) -> Tuple[int, int]:
        """Mark multiple notifications as read"""
        try:
            updated_count = db.query(Notification).filter(
                and_(
                    Notification.id.in_(notification_ids),
                    Notification.recipient_id == user_id,
                    Notification.is_read == False
                )
            ).update({"is_read": True})
            
            db.commit()
            failed_count = len(notification_ids) - updated_count
            
            print(f"✅ Bulk marked {updated_count} notifications as read for user {user_id}")
            return updated_count, failed_count
            
        except Exception as e:
            db.rollback()
            print(f"❌ Error in bulk mark read: {str(e)}")
            return 0, len(notification_ids)
    
    @staticmethod
    def create_system_notification(
        db: Session,
        title: str,
        message: str,
        recipient_ids: List[int],
        data: Optional[Dict[str, Any]] = None
    ) -> Tuple[int, int]:
        """Create system notifications for multiple users"""
        try:
            success_count = 0
            failed_count = 0
            
            for recipient_id in recipient_ids:
                notification = NotificationService.create_notification(
                    db=db,
                    recipient_id=recipient_id,
                    notification_type=NotificationType.SYSTEM,
                    title=title,
                    message=message,
                    sender_id=None,  # System notification
                    data=data
                )
                
                if notification:
                    success_count += 1
                else:
                    failed_count += 1
            
            print(f"✅ Created {success_count} system notifications, {failed_count} failed")
            return success_count, failed_count
            
        except Exception as e:
            print(f"❌ Error creating system notifications: {str(e)}")
            return 0, len(recipient_ids)
    
    @staticmethod
    def create_mention_notification(
        db: Session, 
        mentioned_user_id: int, 
        sender_id: int, 
        post_id: int, 
        mention_text: str
    ) -> Optional[Notification]:
        """Create notification when someone mentions a user in a post"""
        if mentioned_user_id == sender_id:  # Don't notify self
            return None
        
        try:
            return NotificationService.create_notification(
                db=db,
                recipient_id=mentioned_user_id,
                sender_id=sender_id,
                notification_type=NotificationType.MENTION,
                title="You were mentioned",
                message=f"mentioned you in a post",
                data={
                    "post_id": post_id, 
                    "mention_text": mention_text, 
                    "action": "mention",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            print(f"❌ Error creating mention notification: {str(e)}")
            return None
    
    @staticmethod
    def get_notification_digest(
        db: Session, 
        user_id: int, 
        days: int = 7
    ) -> Dict[str, Any]:
        """Get notification digest for a user over specified days"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Get notifications in the period
            notifications = db.query(Notification).filter(
                and_(
                    Notification.recipient_id == user_id,
                    Notification.created_at >= start_date
                )
            ).order_by(Notification.created_at.desc()).all()
            
            # Group by type
            type_summary = {}
            for notification_type in NotificationType:
                type_notifications = [n for n in notifications if n.type == notification_type]
                type_summary[notification_type.value] = {
                    "count": len(type_notifications),
                    "latest": type_notifications[0].created_at.isoformat() if type_notifications else None
                }
            
            # Get top 5 most recent
            top_notifications = notifications[:5]
            
            return {
                "period_days": days,
                "total_notifications": len(notifications),
                "unread_count": len([n for n in notifications if not n.is_read]),
                "type_summary": type_summary,
                "top_notifications": [n.to_dict() for n in top_notifications],
                "success": True
            }
            
        except Exception as e:
            print(f"❌ Error creating notification digest: {str(e)}")
            return {
                "period_days": days,
                "total_notifications": 0,
                "unread_count": 0,
                "type_summary": {},
                "top_notifications": [],
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def export_notifications(
        db: Session, 
        user_id: int, 
        format: str = "json",
        days: Optional[int] = None
    ) -> Dict[str, Any]:
        """Export user notifications in specified format"""
        try:
            query = db.query(Notification).options(
                joinedload(Notification.sender)
            ).filter(Notification.recipient_id == user_id)
            
            if days:
                start_date = datetime.utcnow() - timedelta(days=days)
                query = query.filter(Notification.created_at >= start_date)
            
            notifications = query.order_by(Notification.created_at.desc()).all()
            
            if format.lower() == "json":
                export_data = [n.to_dict() for n in notifications]
            elif format.lower() == "csv":
                # Simplified CSV format
                export_data = []
                for n in notifications:
                    export_data.append({
                        "id": n.id,
                        "type": n.type.value,
                        "title": n.title,
                        "message": n.message,
                        "is_read": n.is_read,
                        "created_at": n.created_at.isoformat(),
                        "sender_name": n.sender.full_name if n.sender else "System"
                    })
            else:
                raise ValueError(f"Unsupported format: {format}")
            
            return {
                "success": True,
                "format": format,
                "count": len(notifications),
                "data": export_data
            }
            
        except Exception as e:
            print(f"❌ Error exporting notifications: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "data": []
            }
    
    @staticmethod
    def get_notification_analytics(db: Session, days: int = 30) -> Dict[str, Any]:
        """Get notification analytics for admin dashboard"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            # Total notifications sent
            total_sent = db.query(Notification).filter(
                Notification.created_at >= start_date
            ).count()
            
            # Total read
            total_read = db.query(Notification).filter(
                and_(
                    Notification.created_at >= start_date,
                    Notification.is_read == True
                )
            ).count()
            
            # Read rate
            read_rate = total_read / total_sent if total_sent > 0 else 0
            
            # Notifications by type
            type_breakdown = {}
            for notification_type in NotificationType:
                count = db.query(Notification).filter(
                    and_(
                        Notification.created_at >= start_date,
                        Notification.type == notification_type
                    )
                ).count()
                type_breakdown[notification_type.value] = count
            
            # Most active users (by notifications received)
            active_users = db.query(
                Notification.recipient_id,
                func.count(Notification.id).label('notification_count')
            ).filter(
                Notification.created_at >= start_date
            ).group_by(Notification.recipient_id).order_by(
                func.count(Notification.id).desc()
            ).limit(10).all()
            
            return {
                "period_days": days,
                "total_sent": total_sent,
                "total_read": total_read,
                "read_rate": round(read_rate, 3),
                "type_breakdown": type_breakdown,
                "most_active_users": [
                    {"user_id": user_id, "notification_count": count} 
                    for user_id, count in active_users
                ],
                "success": True
            }
            
        except Exception as e:
            print(f"❌ Error getting notification analytics: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def cleanup_duplicate_notifications(db: Session) -> int:
        """Remove duplicate notifications (admin function)"""
        try:
            # Find duplicates based on recipient, sender, type, and same post/comment within 1 hour
            duplicates_query = """
                DELETE FROM notifications 
                WHERE id NOT IN (
                    SELECT MIN(id) 
                    FROM notifications 
                    GROUP BY recipient_id, sender_id, type, 
                             EXTRACT(HOUR FROM created_at),
                             EXTRACT(DAY FROM created_at)
                    HAVING COUNT(*) > 1
                )
                AND created_at >= NOW() - INTERVAL '24 hours'
            """
            
            # Note: This is a simplified version. In production, you'd want more sophisticated duplicate detection
            
            print("⚠️ Duplicate cleanup requires manual implementation based on your specific duplicate criteria")
            return 0
            
        except Exception as e:
            print(f"❌ Error cleaning up duplicates: {str(e)}")
            return 0
    
    @staticmethod
    def validate_notification_data(notification_data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """Validate notification data before creation"""
        try:
            required_fields = ['recipient_id', 'type', 'title', 'message']
            
            for field in required_fields:
                if field not in notification_data:
                    return False, f"Missing required field: {field}"
                
                if not notification_data[field]:
                    return False, f"Field {field} cannot be empty"
            
            # Validate type
            try:
                NotificationType(notification_data['type'])
            except ValueError:
                return False, f"Invalid notification type: {notification_data['type']}"
            
            # Validate recipient_id
            if not isinstance(notification_data['recipient_id'], int) or notification_data['recipient_id'] <= 0:
                return False, "recipient_id must be a positive integer"
            
            # Validate sender_id if provided
            if 'sender_id' in notification_data and notification_data['sender_id'] is not None:
                if not isinstance(notification_data['sender_id'], int) or notification_data['sender_id'] <= 0:
                    return False, "sender_id must be a positive integer"
            
            # Validate title and message length
            if len(notification_data['title']) > 255:
                return False, "Title must be 255 characters or less"
            
            if len(notification_data['message']) > 1000:
                return False, "Message must be 1000 characters or less"
            
            return True, None
            
        except Exception as e:
            return False, f"Validation error: {str(e)}"
    
    @staticmethod
    def get_user_notification_preferences(db: Session, user_id: int) -> Dict[str, bool]:
        """Get user notification preferences (placeholder for future feature)"""
        try:
            # Default preferences - in the future this could be stored in a separate table
            default_preferences = {
                "email_notifications": True,
                "push_notifications": True,
                "like_notifications": True,
                "comment_notifications": True,
                "follow_notifications": True,
                "mention_notifications": True,
                "system_notifications": True
            }
            
            return default_preferences
            
        except Exception as e:
            print(f"❌ Error getting notification preferences: {str(e)}")
            return {}
    
    @staticmethod
    def update_user_notification_preferences(
        db: Session, 
        user_id: int, 
        preferences: Dict[str, bool]
    ) -> bool:
        """Update user notification preferences (placeholder for future feature)"""
        try:
            # In the future, this would update a user_notification_preferences table
            print(f"✅ Would update notification preferences for user {user_id}: {preferences}")
            return True
            
        except Exception as e:
            print(f"❌ Error updating notification preferences: {str(e)}")
            return False