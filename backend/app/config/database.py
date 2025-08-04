"""
Database configuration for IAP Connect application.
Compatible with Python 3.11 and Neon PostgreSQL.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .settings import settings
import os
import sys

def get_database_url():
    """Get database URL with proper driver for Python compatibility."""
    database_url = settings.database_url
    
    # Handle different URL formats
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://")
    
    # Remove any existing driver specifications
    if "+asyncpg" in database_url:
        database_url = database_url.replace("+asyncpg", "")
    if "+psycopg2" in database_url:
        database_url = database_url.replace("+psycopg2", "")
    
    # Add SSL mode for Neon if not present
    if "neon.tech" in database_url and "sslmode" not in database_url:
        separator = "&" if "?" in database_url else "?"
        database_url = f"{database_url}{separator}sslmode=require"
    
    print(f"🔗 Using database URL: {database_url.split('@')[-1] if '@' in database_url else 'local'}")
    print(f"🐍 Python version: {sys.version}")
    
    return database_url

# Create engine with minimal configuration for maximum compatibility
try:
    engine = create_engine(
        get_database_url(),
        echo=False,
        pool_pre_ping=True,
        # Minimal configuration for stability
        pool_size=3,
        max_overflow=7,
        pool_recycle=1800,  # 30 minutes
        # Connection arguments for Neon
        connect_args={
            "sslmode": "require",
            "connect_timeout": 10
        } if "neon.tech" in get_database_url() else {}
    )
    
    # Test connection immediately
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    print("✅ Database engine created and tested successfully")
    
except Exception as e:
    print(f"❌ Database engine creation failed: {e}")
    print("🔄 Trying fallback configuration...")
    
    # Fallback configuration
    engine = create_engine(
        get_database_url(),
        echo=False,
        pool_pre_ping=True
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
            result = connection.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"✅ Database connection successful!")
            print(f"📊 PostgreSQL version: {version}")
        return True
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        return False