"""
Share model for IAP Connect application.
Handles user shares on posts (optional - for tracking).
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..config.database import Base


class Share(Base):
    """
    Share model for post sharing tracking.
    
    Attributes:
        id: Primary key
        post_id: Foreign key to the post being shared
        user_id: Foreign key to user who shared the post
        share_type: Type of share (internal, external, copy_link)
        created_at: Share creation timestamp
    """
    
    __tablename__ = "shares"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    share_type = Column(String(20), default="external", nullable=False)  # internal, external, copy_link
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    post = relationship("Post")
    user = relationship("User")
    
    # Constraints - Allow multiple shares by same user (different times)
    # No unique constraint as user can share same post multiple times