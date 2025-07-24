#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.database import SessionLocal
from app.models.user import User, UserType
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    db = SessionLocal()
    
    try:
        # Delete existing admin if any
        existing_admin = db.query(User).filter(User.email == "admin@iapconnect.com").first()
        if existing_admin:
            db.delete(existing_admin)
            db.commit()
            print("Deleted existing admin")
        
        # Create fresh admin user
        admin_user = User(
            username="admin",
            email="admin@iapconnect.com",
            full_name="IAP Connect Administrator",
            user_type=UserType.ADMIN,
            password_hash=pwd_context.hash("admin123"),
            is_active=True,
            bio="System Administrator"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ New admin user created successfully!")
        print("==========================================")
        print("📧 Email: admin@iapconnect.com")
        print("🔑 Password: admin123")
        print(f"🆔 User ID: {admin_user.id}")
        print("==========================================")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
