"""
Post model for IAP Connect application.
Handles social media posts with text, images, and documents.
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..config.database import Base


class Post(Base):
    """
    Post model for social media content.
    
    Attributes:
        id: Primary key
        user_id: Foreign key to user who created the post
        content: Post text content
        media_urls: JSON array of image/document URLs
        hashtags: JSON array of hashtags
        likes_count: Number of likes (denormalized for performance)
        comments_count: Number of comments (denormalized for performance)
        shares_count: Number of shares (denormalized for performance)
        is_trending: Flag indicating if post is trending
        created_at: Post creation timestamp
        updated_at: Last modification timestamp
    """
    
    __tablename__ = "posts"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    
    # Media and metadata
    media_urls = Column(JSON)  # Array of image/document URLs
    hashtags = Column(JSON)    # Array of hashtags
    
    # Engagement counters (denormalized for performance)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    
    # Status flags
    is_trending = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    author = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="post", cascade="all, delete-orphan")