"""
Bookmark model for IAP Connect application.
Handles user bookmarks/saved posts.
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..config.database import Base


class Bookmark(Base):
    """
    Bookmark model for saved posts.
    
    Attributes:
        id: Primary key
        post_id: Foreign key to the post being bookmarked
        user_id: Foreign key to user who bookmarked the post
        created_at: Bookmark creation timestamp
    """
    
    __tablename__ = "bookmarks"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    post = relationship("Post")
    user = relationship("User")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('post_id', 'user_id', name='unique_post_user_bookmark'),
    )