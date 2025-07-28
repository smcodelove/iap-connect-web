# backend/debug_users.py - Check what users exist in database

from app.config.database import SessionLocal
from app.models.user import User

def check_users():
    """Check what users exist in the database"""
    db = SessionLocal()
    try:
        print("🔍 Checking users in database...")
        
        # Get all users
        users = db.query(User).all()
        
        print(f"📊 Total users found: {len(users)}")
        print("-" * 50)
        
        for user in users:
            print(f"ID: {user.id}")
            print(f"Username: {user.username}")
            print(f"Email: {user.email}")
            print(f"Full Name: {user.full_name}")
            print(f"User Type: {user.user_type.value}")
            print(f"Active: {user.is_active}")
            print(f"Created: {user.created_at}")
            print("-" * 30)
            
        print("\n✅ Available user IDs for testing:")
        active_users = [user for user in users if user.is_active]
        for user in active_users:
            print(f"  - User ID {user.id}: {user.full_name} (@{user.username})")
            
        if active_users:
            print(f"\n🎯 Try testing with: http://localhost:3000/user/{active_users[0].id}")
        else:
            print("\n❌ No active users found! Create a test user first.")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()