"""
Comment model for IAP Connect application.
Handles user comments on posts.
"""

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..config.database import Base


class Comment(Base):
    """
    Comment model for post interactions.
    
    Attributes:
        id: Primary key
        post_id: Foreign key to the post being commented on
        user_id: Foreign key to user who made the comment
        content: Comment text content
        created_at: Comment creation timestamp
    """
    
    __tablename__ = "comments"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="comments")
    author = relationship("User", back_populates="comments")