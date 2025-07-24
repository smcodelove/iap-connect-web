from app.config.database import SessionLocal
from app.models.user import User, UserType
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_fresh_admin():
    db = SessionLocal()
    try:
        # Delete existing admin
        existing = db.query(User).filter(User.email == "admin@iapconnect.com").first()
        if existing:
            db.delete(existing)
            db.commit()
            print("Deleted existing admin")
        
        # Create new admin with correct field name
        admin = User(
            username="admin",
            email="admin@iapconnect.com",
            full_name="System Administrator",
            user_type=UserType.ADMIN,
            hashed_password=pwd_context.hash("admin123"),  # Note: hashed_password not password_hash
            is_active=True,
            bio="Admin User"
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        print("✅ Fresh admin created!")
        print(f"ID: {admin.id}")
        print("Email: admin@iapconnect.com")
        print("Password: admin123")
        
        # Test password
        is_valid = pwd_context.verify("admin123", admin.hashed_password)
        print(f"Password verification: {is_valid}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_fresh_admin()
