"""
User model for IAP Connect application.
Handles doctor, student, and admin user types.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Enum as SqlEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum

from ..config.database import Base


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
        full_name: User's full name
        bio: User biography/description
        profile_picture_url: URL to user's profile picture
        specialty: Medical specialty (for doctors only)
        college: Educational institution (for students only)
        is_active: Account status flag
        created_at: Account creation timestamp
        updated_at: Last modification timestamp
    """
    
    __tablename__ = "users"
    
    # Primary fields
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    user_type = Column(SqlEnum(UserType), nullable=False)
    
    # Profile fields
    full_name = Column(String(100), nullable=False)
    bio = Column(Text)
    profile_picture_url = Column(String(500))
    
    # Role-specific fields
    specialty = Column(String(100))  # For doctors
    college = Column(String(100))    # For students
    
    # Status and timestamps
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    
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