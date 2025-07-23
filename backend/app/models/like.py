"""
Like model for IAP Connect application.
Handles user likes on posts.
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..config.database import Base


class Like(Base):
    """
    Like model for post interactions.
    
    Attributes:
        id: Primary key
        post_id: Foreign key to the post being liked
        user_id: Foreign key to user who liked the post
        created_at: Like creation timestamp
    """
    
    __tablename__ = "likes"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="likes")
    user = relationship("User", back_populates="likes")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('post_id', 'user_id', name='unique_post_user_like'),
    )