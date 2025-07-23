"""
Database creation script for IAP Connect.
Creates PostgreSQL database and admin user.
"""

import asyncio
import asyncpg
from sqlalchemy.orm import Session
from app.config.database import SessionLocal, engine
from app.models import Base, User, UserType
from app.utils.security import get_password_hash


async def create_database():
    """Create the PostgreSQL database if it doesn't exist."""
    try:
        # Connect to PostgreSQL server (not specific database)
        conn = await asyncpg.connect(
            host="localhost",
            port=5432,
            user="postgres",  # Default PostgreSQL user
            password="password"  # Change this to your PostgreSQL password
        )
        
        # Check if database exists
        db_exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = 'iap_connect'"
        )
        
        if not db_exists:
            # Create database
            await conn.execute("CREATE DATABASE iap_connect")
            print("✅ Database 'iap_connect' created successfully")
        else:
            print("✅ Database 'iap_connect' already exists")
            
        await conn.close()
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        print("Please ensure PostgreSQL is running and credentials are correct")


def create_tables():
    """Create all database tables."""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")


def create_admin_user():
    """Create default admin user."""
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_exists = db.query(User).filter(
            User.user_type == UserType.ADMIN
        ).first()
        
        if not admin_exists:
            # Create admin user
            admin_user = User(
                username="admin",
                email="admin@iapconnect.com",
                password_hash=get_password_hash("admin123"),
                user_type=UserType.ADMIN,
                full_name="IAP Connect Administrator",
                bio="System Administrator",
                is_active=True
            )
            
            db.add(admin_user)
            db.commit()
            print("✅ Admin user created successfully")
            print("   Email: admin@iapconnect.com")
            print("   Password: admin123")
        else:
            print("✅ Admin user already exists")
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


async def main():
    """Main setup function."""
    print("🚀 Setting up IAP Connect Database...")
    print("-" * 50)
    
    # Step 1: Create database
    await create_database()
    
    # Step 2: Create tables
    create_tables()
    
    # Step 3: Create admin user
    create_admin_user()
    
    print("-" * 50)
    print("✅ Database setup completed!")
    print("\nNext steps:")
    print("1. Update .env file with your database credentials")
    print("2. Run: uvicorn app.main:app --reload")
    print("3. Visit: http://localhost:8000/docs")


if __name__ == "__main__":
    asyncio.run(main())