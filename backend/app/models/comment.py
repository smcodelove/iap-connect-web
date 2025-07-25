"""
Comment model for IAP Connect application.
Handles user comments on posts with nested replies.
"""

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..config.database import Base


class Comment(Base):
    """
    Comment model for post interactions with nested replies support.
    
    Attributes:
        id: Primary key
        post_id: Foreign key to the post being commented on
        user_id: Foreign key to user who made the comment
        parent_id: Foreign key to parent comment (for replies)
        content: Comment text content
        likes_count: Number of likes on this comment
        replies_count: Number of replies to this comment
        created_at: Comment creation timestamp
    """
    
    __tablename__ = "comments"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)  # For nested replies
    content = Column(Text, nullable=False)
    
    # Engagement counters
    likes_count = Column(Integer, default=0)
    replies_count = Column(Integer, default=0)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")
    
    # Self-referential relationship for replies
    parent_comment = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship("Comment", back_populates="parent_comment", cascade="all, delete-orphan")
    
    # Comment likes relationship
    comment_likes = relationship("CommentLike", back_populates="comment", cascade="all, delete-orphan")