"""
Database configuration for IAP Connect application.
Fixed AsyncPG configuration for Neon PostgreSQL.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .settings import settings
import os

def get_database_url():
    """Get database URL with AsyncPG driver for Neon."""
    database_url = settings.database_url
    
    # Convert to AsyncPG driver
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
    elif database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+asyncpg://")
    
    # Remove sslmode parameter as AsyncPG handles SSL automatically for Neon
    if "sslmode=require" in database_url:
        database_url = database_url.replace("sslmode=require", "")
        database_url = database_url.replace("&sslmode=require", "")
        database_url = database_url.replace("?sslmode=require&", "?")
        database_url = database_url.replace("?sslmode=require", "")
    
    # Clean up any double separators
    database_url = database_url.replace("&&", "&")
    database_url = database_url.replace("?&", "?")
    if database_url.endswith("&") or database_url.endswith("?"):
        database_url = database_url[:-1]
    
    return database_url

# Create database engine with AsyncPG
engine = create_engine(
    get_database_url(),
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
    # AsyncPG connection args (SSL is automatic for neon.tech)
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