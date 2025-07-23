"""
Follow model for IAP Connect application.
Handles user following relationships.
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..config.database import Base


class Follow(Base):
    """
    Follow model for user relationships.
    
    Attributes:
        id: Primary key
        follower_id: Foreign key to user who is following
        following_id: Foreign key to user being followed
        created_at: Follow relationship creation timestamp
    """
    
    __tablename__ = "follows"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    following_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    follower = relationship("User", foreign_keys=[follower_id], back_populates="following")
    following = relationship("User", foreign_keys=[following_id], back_populates="followers")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('follower_id', 'following_id', name='unique_follower_following'),
    )