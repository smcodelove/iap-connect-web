# backend/app/services/auth_service.py - FIXED VERSION
"""
Authentication service for IAP Connect application.
UPDATED: Removed admin restriction, made specialty optional, auto-detect admin by email
"""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models.user import User, UserType
from ..schemas.auth import UserRegister, UserLogin
from ..utils.security import get_password_hash, verify_password, create_access_token


def register_user(user_data: UserRegister, db: Session) -> User:
    """
    Register a new user in the system.
    UPDATED: Auto-detect admin users by email domain, made specialty optional
    
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
    
    # SECURITY: Only allow doctor/student registration through public endpoint
    # Admin users can ONLY be created by developers using admin script
    
    # Force user type to doctor (default for all public registrations)
    final_user_type = UserType.DOCTOR
    
    # STRICT: Block any admin registration attempts through public endpoint
    if user_data.user_type == UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts can only be created by system administrators"
        )
    
    # REMOVED: Strict validation for specialty/college
    # Now optional - users can add later in profile
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hashed_password,
        user_type=final_user_type,  # Use auto-detected or provided type
        full_name=user_data.full_name,
        bio=user_data.bio,
        specialty=user_data.specialty,  # Optional now
        college=user_data.college,      # Optional now
        is_active=True  # Activate immediately
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"✅ Created user: {new_user.username} ({new_user.user_type.value})")
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
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print(f"✅ Login successful: {user.username} ({user.user_type.value})")
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
        "user_id": user.id,  # Both formats for compatibility
        "email": user.email,
        "user_type": user.user_type.value,
        "username": user.username
    }
    return create_access_token(data=token_data)


def refresh_access_token(user: User) -> str:
    """
    Refresh JWT access token for user.
    
    Args:
        user: User object
        
    Returns:
        str: New JWT access token
    """
    return generate_access_token(user)