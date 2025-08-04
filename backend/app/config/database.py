"""
Database configuration for IAP Connect application.
Simple configuration for Neon PostgreSQL using psycopg2.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .settings import settings
import os

def get_database_url():
    """Get database URL with proper SSL for Neon."""
    database_url = settings.database_url
    
    # Ensure standard postgresql:// prefix (no AsyncPG)
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://")
    
    # Remove any AsyncPG references
    if "+asyncpg" in database_url:
        database_url = database_url.replace("+asyncpg", "")
    
    # Add SSL mode for Neon if not present
    if "neon.tech" in database_url and "sslmode" not in database_url:
        separator = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{separator}sslmode=require"
    
    return database_url

# Simple engine configuration with psycopg2
engine = create_engine(
    get_database_url(),
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


def get_db():
    """Database dependency for FastAPI routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_connection():
    """Test database connection."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"Database connection test failed: {e}")
        return False