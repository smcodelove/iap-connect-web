# backend/app/schemas/notification.py
"""
Notification schemas for IAP Connect application.
Pydantic models for notification API requests and responses.
COMPLETE: All schemas integrated with existing structure
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class NotificationTypeSchema(str, Enum):
    """Notification type enumeration for API schemas"""
    LIKE = "like"
    COMMENT = "comment"
    FOLLOW = "follow"
    MENTION = "mention"
    POST_UPDATE = "post_update"
    SYSTEM = "system"


class UserBasicInfo(BaseModel):
    """Basic user information for notification sender"""
    id: int
    username: str
    full_name: Optional[str] = None
    user_type: str
    profile_picture_url: Optional[str] = None
    specialty: Optional[str] = None
    college: Optional[str] = None
    is_following: Optional[bool] = False
    is_bookmarked: Optional[bool] = False

    class Config:
        from_attributes = True


class NotificationBase(BaseModel):
    """Base notification schema with common fields"""
    type: NotificationTypeSchema
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1, max_length=1000)
    data: Optional[Dict[str, Any]] = None

    @validator('title')
    def validate_title(cls, v):
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()

    @validator('message')
    def validate_message(cls, v):
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()


class NotificationCreate(NotificationBase):
    """Schema for creating notifications"""
    recipient_id: int = Field(..., gt=0)
    sender_id: Optional[int] = Field(None, gt=0)

    @validator('recipient_id')
    def validate_recipient_id(cls, v):
        if v <= 0:
            raise ValueError('Recipient ID must be positive')
        return v

    @validator('sender_id')
    def validate_sender_id(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Sender ID must be positive')
        return v


class NotificationResponse(NotificationBase):
    """Schema for notification responses with complete information"""
    id: int
    recipient_id: int
    sender_id: Optional[int] = None
    is_read: bool
    created_at: datetime
    sender: Optional[UserBasicInfo] = None
    time_since_created: Optional[str] = None
    display_message: Optional[str] = None

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """Schema for paginated notification list responses"""
    notifications: List[NotificationResponse]
    total: int = Field(..., ge=0)
    unread_count: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    size: int = Field(..., ge=1)
    has_next: bool = False
    success: bool = True

    @validator('total')
    def validate_total(cls, v):
        if v < 0:
            raise ValueError('Total must be non-negative')
        return v

    @validator('unread_count')
    def validate_unread_count(cls, v):
        if v < 0:
            raise ValueError('Unread count must be non-negative')
        return v


class NotificationStatsResponse(BaseModel):
    """Schema for notification statistics"""
    total_notifications: int = Field(..., ge=0)
    unread_count: int = Field(..., ge=0)
    recent_count: int = Field(..., ge=0)  # Notifications from last 24 hours
    type_counts: Optional[Dict[str, int]] = {}
    success: bool = True


class UnreadCountResponse(BaseModel):
    """Schema for unread notification count response"""
    unread_count: int = Field(..., ge=0)
    count: int = Field(..., ge=0)  # Alias for compatibility
    success: bool = True

    @validator('count')
    def sync_count_with_unread(cls, v, values):
        # Ensure count matches unread_count
        return values.get('unread_count', v)


class MarkReadResponse(BaseModel):
    """Schema for mark as read responses"""
    success: bool
    message: str
    updated_count: Optional[int] = None
    error: Optional[str] = None

    @validator('message')
    def validate_message(cls, v):
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()


class NotificationPreferences(BaseModel):
    """Schema for user notification preferences (future use)"""
    email_notifications: bool = True
    push_notifications: bool = True
    like_notifications: bool = True
    comment_notifications: bool = True
    follow_notifications: bool = True
    mention_notifications: bool = True
    system_notifications: bool = True

    class Config:
        from_attributes = True


class BulkNotificationCreate(BaseModel):
    """Schema for creating multiple notifications"""
    notifications: List[NotificationCreate] = Field(..., min_items=1, max_items=100)

    @validator('notifications')
    def validate_notifications(cls, v):
        if not v:
            raise ValueError('At least one notification is required')
        if len(v) > 100:
            raise ValueError('Maximum 100 notifications per bulk request')
        return v


class NotificationFilter(BaseModel):
    """Schema for filtering notifications"""
    type: Optional[NotificationTypeSchema] = None
    is_read: Optional[bool] = None
    sender_id: Optional[int] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None

    @validator('date_to')
    def validate_date_range(cls, v, values):
        date_from = values.get('date_from')
        if date_from and v and v < date_from:
            raise ValueError('date_to must be after date_from')
        return v


class NotificationActionResponse(BaseModel):
    """Schema for notification action responses"""
    success: bool
    message: str
    notification_id: Optional[int] = None
    action: str
    error: Optional[str] = None


class NotificationSummary(BaseModel):
    """Schema for notification summary"""
    total_notifications: int
    unread_count: int
    recent_count: int
    latest_notification: Optional[NotificationResponse] = None
    most_common_type: Optional[str] = None


class SystemNotificationCreate(BaseModel):
    """Schema for creating system notifications"""
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1, max_length=1000)
    recipient_ids: List[int] = Field(..., min_items=1, max_items=1000)
    data: Optional[Dict[str, Any]] = None
    send_immediately: bool = True

    @validator('recipient_ids')
    def validate_recipient_ids(cls, v):
        if not v:
            raise ValueError('At least one recipient is required')
        if len(v) > 1000:
            raise ValueError('Maximum 1000 recipients per system notification')
        
        # Remove duplicates and validate positive IDs
        unique_ids = list(set(v))
        for recipient_id in unique_ids:
            if recipient_id <= 0:
                raise ValueError('All recipient IDs must be positive')
        
        return unique_ids


class NotificationCleanupResponse(BaseModel):
    """Schema for notification cleanup response"""
    success: bool
    message: str
    deleted_count: int = Field(..., ge=0)
    days_threshold: int = Field(..., ge=1)
    error: Optional[str] = None

    @validator('deleted_count')
    def validate_deleted_count(cls, v):
        if v < 0:
            raise ValueError('Deleted count must be non-negative')
        return v


class NotificationSearchRequest(BaseModel):
    """Schema for searching notifications"""
    query: str = Field(..., min_length=1, max_length=100)
    type_filter: Optional[NotificationTypeSchema] = None
    is_read_filter: Optional[bool] = None
    page: int = Field(1, ge=1)
    size: int = Field(20, ge=1, le=100)

    @validator('query')
    def validate_query(cls, v):
        if not v or not v.strip():
            raise ValueError('Search query cannot be empty')
        return v.strip()


class NotificationDeleteResponse(BaseModel):
    """Schema for notification deletion response"""
    success: bool
    message: str
    notification_id: int
    error: Optional[str] = None


class NotificationBatchMarkReadRequest(BaseModel):
    """Schema for batch marking notifications as read"""
    notification_ids: List[int] = Field(..., min_items=1, max_items=100)

    @validator('notification_ids')
    def validate_notification_ids(cls, v):
        if not v:
            raise ValueError('At least one notification ID is required')
        if len(v) > 100:
            raise ValueError('Maximum 100 notifications per batch request')
        
        # Remove duplicates and validate positive IDs
        unique_ids = list(set(v))
        for notification_id in unique_ids:
            if notification_id <= 0:
                raise ValueError('All notification IDs must be positive')
        
        return unique_ids


class NotificationBatchResponse(BaseModel):
    """Schema for batch operation responses"""
    success: bool
    message: str
    processed_count: int = Field(..., ge=0)
    failed_count: int = Field(..., ge=0)
    total_requested: int = Field(..., ge=0)
    errors: Optional[List[str]] = []


class NotificationExportRequest(BaseModel):
    """Schema for exporting notifications"""
    format: str = Field("json", pattern="^(json|csv)$")
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    include_read: bool = True
    include_unread: bool = True

    @validator('format')
    def validate_format(cls, v):
        if v not in ['json', 'csv']:
            raise ValueError('Format must be either json or csv')
        return v


class NotificationImportRequest(BaseModel):
    """Schema for importing notifications"""
    notifications: List[Dict[str, Any]] = Field(..., min_items=1, max_items=1000)
    validate_recipients: bool = True
    skip_duplicates: bool = True

    @validator('notifications')
    def validate_notifications_import(cls, v):
        if not v:
            raise ValueError('At least one notification is required')
        if len(v) > 1000:
            raise ValueError('Maximum 1000 notifications per import')
        return v


class NotificationAnalytics(BaseModel):
    """Schema for notification analytics"""
    total_sent: int = Field(..., ge=0)
    total_read: int = Field(..., ge=0)
    read_rate: float = Field(..., ge=0.0, le=1.0)
    avg_read_time_hours: Optional[float] = None
    most_active_day: Optional[str] = None
    most_active_hour: Optional[int] = None
    type_breakdown: Dict[str, int] = {}


class NotificationTemplateCreate(BaseModel):
    """Schema for creating notification templates"""
    name: str = Field(..., min_length=1, max_length=100)
    type: NotificationTypeSchema
    title_template: str = Field(..., min_length=1, max_length=255)
    message_template: str = Field(..., min_length=1, max_length=1000)
    default_data: Optional[Dict[str, Any]] = {}
    is_active: bool = True

    @validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Template name cannot be empty')
        return v.strip()


class NotificationTemplate(NotificationTemplateCreate):
    """Schema for notification template response"""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    usage_count: int = 0

    class Config:
        from_attributes = True


class NotificationWebhookCreate(BaseModel):
    """Schema for creating notification webhooks"""
    url: str = Field(..., pattern=r'^https?://.+')
    events: List[NotificationTypeSchema] = Field(..., min_items=1)
    is_active: bool = True
    secret_key: Optional[str] = None

    @validator('url')
    def validate_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v


class NotificationWebhook(NotificationWebhookCreate):
    """Schema for notification webhook response"""
    id: int
    created_at: datetime
    last_triggered: Optional[datetime] = None
    success_count: int = 0
    failure_count: int = 0

    class Config:
        from_attributes = True


class NotificationChannelSettings(BaseModel):
    """Schema for notification channel settings"""
    email_enabled: bool = True
    push_enabled: bool = True
    sms_enabled: bool = False
    in_app_enabled: bool = True
    email_frequency: str = Field("immediate", pattern="^(immediate|daily|weekly)$")
    quiet_hours_start: Optional[int] = Field(None, ge=0, le=23)
    quiet_hours_end: Optional[int] = Field(None, ge=0, le=23)

    @validator('quiet_hours_end')
    def validate_quiet_hours(cls, v, values):
        start = values.get('quiet_hours_start')
        if start is not None and v is not None:
            if start == v:
                raise ValueError('Quiet hours start and end cannot be the same')
        return v


class NotificationDigest(BaseModel):
    """Schema for notification digest"""
    user_id: int
    digest_type: str = Field(..., pattern="^(daily|weekly|monthly)$")
    period_start: datetime
    period_end: datetime
    total_notifications: int
    unread_count: int
    summary_by_type: Dict[str, int]
    top_notifications: List[NotificationResponse] = Field(max_items=10)

    class Config:
        from_attributes = True