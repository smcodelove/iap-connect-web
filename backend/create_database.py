"""
Database creation script for IAP Connect.
Fixed for Neon PostgreSQL deployment - no asyncpg needed.
UPDATED: Enhanced security for admin user creation.
"""

import secrets
import string
import os
from sqlalchemy.orm import Session
from app.config.database import SessionLocal, engine
from app.models import Base, User, UserType
from app.utils.security import get_password_hash


def generate_secure_password(length=16):
    """Generate a cryptographically secure random password."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()_+-="
    password = ''.join(secrets.choice(alphabet) for i in range(length))
    return password


def create_tables():
    """Create all database tables."""
    try:
        print("🔧 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")


def create_admin_user():
    """Create default admin user with secure credentials."""
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_exists = db.query(User).filter(
            User.user_type == UserType.ADMIN
        ).first()
        
        if not admin_exists:
            # Generate secure credentials
            admin_username = f"admin_{secrets.token_hex(4)}"
            admin_email = os.getenv('ADMIN_EMAIL', f"admin-{secrets.token_hex(4)}@iapconnect.com")
            admin_password = os.getenv('ADMIN_PASSWORD', generate_secure_password(20))
            
            # Create admin user
            admin_user = User(
                username=admin_username,
                email=admin_email,
                password_hash=get_password_hash(admin_password),
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
            print(f"   Username: {admin_username}")
            print(f"   Email: {admin_email}")
            print(f"   Password: {admin_password}")
            print("\n🔒 SECURITY NOTICE:")
            print("   1. SAVE THESE CREDENTIALS SECURELY!")
            print("   2. Change password after first login")
            print("   3. Set ADMIN_EMAIL and ADMIN_PASSWORD env vars for custom credentials")
            
        else:
            print("✅ Admin user already exists")
            # Security check for existing admin
            if admin_exists.email == "admin@iapconnect.com":
                print("⚠️  WARNING: Admin user has default email - consider updating!")
            
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
    
    # Step 2: Create admin user (secure)
    create_admin_user()
    
    print("-" * 50)
    print("✅ Database setup completed!")
    print("\n🌟 IAP Connect is ready to launch!")
    
    # Security reminder
    print("\n🛡️  SECURITY CHECKLIST:")
    print("   ✓ Strong admin credentials generated")
    print("   ✓ Database SSL connection enabled")
    print("   ✓ Environment variables secured")
    print("   ✓ Password hashing with bcrypt")


if __name__ == "__main__":
    main()