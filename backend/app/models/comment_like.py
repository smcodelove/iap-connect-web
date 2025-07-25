"""
CommentLike model for IAP Connect application.
Handles user likes on comments.
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from ..config.database import Base


class CommentLike(Base):
    """
    CommentLike model for comment interactions.
    
    Attributes:
        id: Primary key
        comment_id: Foreign key to the comment being liked
        user_id: Foreign key to user who liked the comment
        created_at: Like creation timestamp
    """
    
    __tablename__ = "comment_likes"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    comment = relationship("Comment", back_populates="comment_likes")
    user = relationship("User")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('comment_id', 'user_id', name='unique_comment_user_like'),
    )