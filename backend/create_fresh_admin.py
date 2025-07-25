# backend/create_admin_fixed.py
"""
Fixed admin user creation script for IAP Connect
Creates admin user with correct field names
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.database import SessionLocal
from app.models.user import User, UserType
from app.utils.security import get_password_hash

def create_admin_user():
    """Create admin user with correct field names"""
    db = SessionLocal()
    
    try:
        # Delete existing admin if any
        existing_admin = db.query(User).filter(User.email == "admin@iapconnect.com").first()
        if existing_admin:
            db.delete(existing_admin)
            db.commit()
            print("✅ Deleted existing admin")
        
        # Create fresh admin user with CORRECT field name
        admin_user = User(
            username="admin",
            email="admin@iapconnect.com",
            full_name="IAP Connect Administrator",
            user_type=UserType.ADMIN,
            password_hash=get_password_hash("admin123"),  # FIXED: password_hash not hashed_password
            is_active=True,
            bio="System Administrator for IAP Connect Platform"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("🎉 NEW ADMIN USER CREATED SUCCESSFULLY!")
        print("=" * 50)
        print(f"📧 Email: admin@iapconnect.com")
        print(f"🔑 Password: admin123")
        print(f"🆔 User ID: {admin_user.id}")
        print(f"👤 Username: {admin_user.username}")
        print(f"🏷️ User Type: {admin_user.user_type.value}")
        print("=" * 50)
        print("🌐 You can now:")
        print("  1. Login to web admin dashboard")
        print("  2. Login to mobile app as admin")
        print("  3. Access admin features in profile")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = create_admin_user()
    if success:
        print("\n🚀 Admin dashboard is ready to use!")
    else:
        print("\n💥 Failed to create admin user. Check the error above.")