# backend/create_admin.py - SECURE Admin Creation Script
"""
SECURE Admin User Creation Script for IAP Connect
⚠️  SECURITY: Only developers should run this script manually
⚠️  This script BYPASSES normal registration validation
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config.database import SessionLocal
from app.models.user import User, UserType
from app.utils.security import get_password_hash

def create_admin_user():
    """
    Create admin user - ONLY for developers
    ⚠️  SECURITY: This bypasses normal registration validation
    """
    db = SessionLocal()
    
    try:
        print("🔐 SECURE ADMIN CREATION")
        print("=" * 40)
        
        # Get admin details from developer
        print("📝 Enter admin user details:")
        admin_email = input("Admin Email: ").strip()
        admin_username = input("Admin Username: ").strip()
        admin_fullname = input("Admin Full Name: ").strip()
        admin_password = input("Admin Password: ").strip()
        
        # Basic validation
        if not all([admin_email, admin_username, admin_fullname, admin_password]):
            print("❌ All fields are required!")
            return False
        
        # Check if admin already exists
        existing_user = db.query(User).filter(
            (User.email == admin_email) | (User.username == admin_username)
        ).first()
        
        if existing_user:
            print(f"⚠️  User already exists!")
            print(f"📧 Email: {existing_user.email}")
            print(f"👤 Username: {existing_user.username}")
            print(f"🏷️  Type: {existing_user.user_type.value}")
            return False
        
        # Confirm admin creation
        print(f"\n🔍 Creating admin user:")
        print(f"📧 Email: {admin_email}")
        print(f"👤 Username: {admin_username}")
        print(f"👨‍💼 Name: {admin_fullname}")
        
        confirm = input("\n❓ Confirm creation? (yes/no): ").strip().lower()
        if confirm != 'yes':
            print("❌ Admin creation cancelled")
            return False
        
        # Create admin user DIRECTLY (bypassing normal validation)
        admin_user = User(
            username=admin_username,
            email=admin_email,
            full_name=admin_fullname,
            user_type=UserType.ADMIN,  # DIRECT admin assignment
            password_hash=get_password_hash(admin_password),
            is_active=True,
            bio="System Administrator - Created by Developer Script",
            specialty=None,  # Not applicable for admin
            college=None     # Not applicable for admin
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("\n🎉 ADMIN USER CREATED SUCCESSFULLY!")
        print("=" * 50)
        print(f"📧 Email: {admin_email}")
        print(f"👤 Username: {admin_username}")
        print(f"🆔 User ID: {admin_user.id}")
        print(f"🏷️  User Type: {admin_user.user_type.value}")
        print("=" * 50)
        print("✅ Admin can now:")
        print("  1. Login to web dashboard")
        print("  2. Access admin features")
        print("  3. Manage users and content")
        print("⚠️  SECURITY: Keep admin credentials secure!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def delete_admin_user():
    """Delete admin user if needed"""
    db = SessionLocal()
    
    try:
        admin_email = input("Enter admin email to delete: ").strip()
        
        admin_user = db.query(User).filter(
            User.email == admin_email,
            User.user_type == UserType.ADMIN
        ).first()
        
        if not admin_user:
            print("❌ Admin user not found!")
            return False
        
        print(f"🔍 Found admin: {admin_user.username} ({admin_user.email})")
        confirm = input("❓ Confirm deletion? (yes/no): ").strip().lower()
        
        if confirm == 'yes':
            db.delete(admin_user)
            db.commit()
            print("✅ Admin user deleted successfully!")
            return True
        else:
            print("❌ Deletion cancelled")
            return False
            
    except Exception as e:
        print(f"❌ Error deleting admin: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 IAP Connect Admin Management")
    print("⚠️  DEVELOPERS ONLY!")
    print("-" * 30)
    print("1. Create Admin User")
    print("2. Delete Admin User")
    print("3. Exit")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == '1':
        print("\n🔐 Creating admin user...")
        success = create_admin_user()
        if success:
            print("\n🚀 Admin user is ready!")
        else:
            print("\n💥 Failed to create admin user")
    
    elif choice == '2':
        print("\n🗑️  Deleting admin user...")
        success = delete_admin_user()
        if success:
            print("\n🗑️  Admin user deleted!")
        else:
            print("\n💥 Failed to delete admin user")
    
    elif choice == '3':
        print("👋 Goodbye!")
    
    else:
        print("❌ Invalid choice!")