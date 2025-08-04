# models/user.py
"""
Enhanced User model for IAP Connect application.
Handles doctor, student, and admin user types with complete profile management.
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
from enum import Enum
from app.config.database import Base


class UserType(Enum):
    """User type enumeration for role-based access."""
    DOCTOR = "doctor"
    STUDENT = "student"
    ADMIN = "admin"


class User(Base):
    """
    User model representing all user types in the system.
    
    Attributes:
        id: Primary key
        username: Unique username for the user
        email: User's email address
        password_hash: Hashed password for authentication
        user_type: Enum value (doctor, student, admin)
        full_name: User's display name
        bio: User's bio/description
        profile_picture_url: URL to profile picture
        specialty: Professional specialty (for doctors)
        college: Educational institution (for students)
        followers_count: Number of followers
        following_count: Number of users being followed
        posts_count: Number of posts created
        is_active: Account status
        created_at: Account creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "users"

    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    
    # User type and basic info - FIXED: Using proper enum
    user_type = Column(SqlEnum(UserType), nullable=False)
    full_name = Column(String(100), nullable=False)
    
    # Profile information
    bio = Column(Text, nullable=True)
    profile_picture_url = Column(String(500), nullable=True)
    
    # Professional details
    specialty = Column(String(100), nullable=True)  # For doctors
    college = Column(String(100), nullable=True)    # For students
    
    # Social statistics
    followers_count = Column(Integer, default=0, nullable=False)
    following_count = Column(Integer, default=0, nullable=False)
    posts_count = Column(Integer, default=0, nullable=False)
    
    
    # Account status and timestamps
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("Bookmark", back_populates="user", cascade="all, delete-orphan")
    
    # NEW: Comment likes relationship
    comment_likes = relationship("CommentLike", back_populates="user", cascade="all, delete-orphan")
    
    # Following relationships
    following = relationship(
        "Follow", 
        foreign_keys="Follow.follower_id",
        back_populates="follower",
        cascade="all, delete-orphan"
    )
    followers = relationship(
        "Follow", 
        foreign_keys="Follow.following_id",
        back_populates="following",
        cascade="all, delete-orphan"
    )

    # Notification relationships
    received_notifications = relationship(
        "Notification", 
        foreign_keys="Notification.recipient_id", 
        back_populates="recipient",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', type='{self.user_type}')>"
    
    @property
    def display_info(self):
        """Get user's professional display information"""
        if self.user_type == UserType.DOCTOR:
            return self.specialty or "Doctor"
        elif self.user_type == UserType.STUDENT:
            return self.college or "Student"
        else:
            return "Admin"
    
    def to_dict(self):
        """Convert user object to dictionary for API responses"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "user_type": self.user_type.value,  # FIXED: Get enum value
            "full_name": self.full_name,
            "bio": self.bio,
            "profile_picture_url": self.profile_picture_url,
            "specialty": self.specialty,
            "college": self.college,
            "followers_count": self.followers_count,
            "following_count": self.following_count,
            "posts_count": self.posts_count,
            "display_info": self.display_info,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


from .follow import Follow