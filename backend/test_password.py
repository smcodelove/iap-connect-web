from app.config.database import SessionLocal
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def test_admin_password():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@iapconnect.com").first()
        if admin:
            print(f"Admin found: {admin.email}")
            print(f"Password hash: {admin.password_hash[:50]}...")
            
            # Test password verification
            is_valid = pwd_context.verify("admin123", admin.password_hash)
            print(f"Password verification: {is_valid}")
        else:
            print("Admin not found")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_admin_password()
