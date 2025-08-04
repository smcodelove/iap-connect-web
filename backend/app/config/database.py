"""
Database configuration for IAP Connect application.
Fixed for Neon PostgreSQL with AsyncPG driver.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .settings import settings
import os

def get_database_url():
    """Get database URL with AsyncPG driver for Neon."""
    database_url = settings.database_url
    
    # Force use of asyncpg driver instead of psycopg2
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
    elif database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+asyncpg://")
    
    # Handle Neon SSL requirements
    if "neon.tech" in database_url and "sslmode" not in database_url:
        separator = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{separator}sslmode=require"
    
    return database_url

# Create database engine with AsyncPG driver
engine = create_engine(
    get_database_url(),
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
    # AsyncPG specific connection args
    connect_args={
        "server_settings": {
            "application_name": "iap_connect",
        }
    }
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


def get_db():
    """
    Database dependency for FastAPI routes.
    Creates and closes database sessions automatically.
    
    Yields:
        db: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_connection():
    """Test database connection for deployment verification."""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False