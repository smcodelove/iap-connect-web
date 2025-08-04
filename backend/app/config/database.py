"""
Database creation script for IAP Connect.
Fixed for Neon PostgreSQL deployment - no asyncpg needed.
"""

from sqlalchemy.orm import Session
from app.config.database import SessionLocal, engine
from app.models import Base, User, UserType
from app.utils.security import get_password_hash


def create_tables():
    """Create all database tables."""
    try:
        print("🔧 Creating database tables...")
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
                is_active=True,
                followers_count=0,
                following_count=0,
                posts_count=0
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


def main():
    """Main setup function."""
    print("🚀 Setting up IAP Connect Database...")
    print("-" * 50)
    
    # Step 1: Create tables
    create_tables()
    
    # Step 2: Create admin user
    create_admin_user()
    
    print("-" * 50)
    print("✅ Database setup completed!")
    print("\n🌟 IAP Connect is ready to launch!")


if __name__ == "__main__":
    main()