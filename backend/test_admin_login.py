from app.config.database import SessionLocal
from app.models.user import User
from app.utils.security import verify_password

def test_admin_login():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@iapconnect.com").first()
        if admin:
            print(f"✅ Admin found: {admin.email}")
            print(f"Password hash: {admin.password_hash}")
            
            # Test password verification
            is_valid = verify_password("admin123", admin.password_hash)
            print(f"Password verification: {is_valid}")
            
            if not is_valid:
                print("❌ Password verification failed!")
                # Try to create new hash
                from app.utils.security import get_password_hash
                new_hash = get_password_hash("admin123")
                print(f"New password hash: {new_hash}")
                
                # Update admin password
                admin.password_hash = new_hash
                db.commit()
                print("✅ Password updated!")
                
                # Test again
                is_valid_new = verify_password("admin123", admin.password_hash)
                print(f"New password verification: {is_valid_new}")
        else:
            print("❌ Admin not found")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_admin_login()
