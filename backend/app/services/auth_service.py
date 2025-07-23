"""
Authentication service for IAP Connect application.
Handles user registration and login business logic.
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.user import User, UserType
from ..schemas.auth import UserRegister, UserLogin
from ..utils.security import get_password_hash, verify_password, create_access_token


def register_user(user_data: UserRegister, db: Session) -> User:
    """
    Register a new user in the system.
    
    Args:
        user_data: User registration data
        db: Database session
        
    Returns:
        User: Newly created user
        
    Raises:
        HTTPException: If username or email already exists
    """
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Validate user type specific fields
    if user_data.user_type == UserType.DOCTOR and not user_data.specialty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Specialty is required for doctors"
        )
    
    if user_data.user_type == UserType.STUDENT and not user_data.college:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="College is required for students"
        )
    
    # Prevent admin registration through public endpoint
    if user_data.user_type == UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin accounts cannot be created through public registration"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
        user_type=user_data.user_type,
        full_name=user_data.full_name,
        bio=user_data.bio,
        specialty=user_data.specialty,
        college=user_data.college
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


def authenticate_user(login_data: UserLogin, db: Session) -> User:
    """
    Authenticate user login credentials.
    
    Args:
        login_data: User login credentials
        db: Database session
        
    Returns:
        User: Authenticated user
        
    Raises:
        HTTPException: If credentials are invalid
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated"
        )
    
    return user


def generate_access_token(user: User) -> str:
    """
    Generate JWT access token for authenticated user.
    
    Args:
        user: Authenticated user
        
    Returns:
        str: JWT access token
    """
    token_data = {
        "sub": user.id,
        "email": user.email,
        "user_type": user.user_type.value
    }
    return create_access_token(data=token_data)