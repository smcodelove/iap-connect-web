from app.config.database import SessionLocal
from app.models.post import Post
from app.models.user import User

def create_sample_posts():
    db = SessionLocal()
    try:
        # Get admin user
        admin = db.query(User).filter(User.email == "admin@iapconnect.com").first()
        
        if admin:
            # Create sample posts
            posts = [
                {
                    "content": "Welcome to IAP Connect! 🎉 This is our first post on this amazing platform for medical professionals.",
                    "hashtags": ["#IAPConnect", "#MedicalCommunity", "#Welcome"]
                },
                {
                    "content": "Just learned about the latest advances in minimally invasive surgery. The future of medicine is here! 🏥",
                    "hashtags": ["#Surgery", "#MedicalAdvances", "#Innovation"]
                },
                {
                    "content": "Study tip: Use active recall and spaced repetition for better retention. Works wonders for medical students! 📚",
                    "hashtags": ["#StudyTips", "#MedicalStudent", "#Learning"]
                }
            ]
            
            for post_data in posts:
                post = Post(
                    user_id=admin.id,
                    content=post_data["content"],
                    hashtags=post_data["hashtags"],
                    likes_count=0,
                    comments_count=0,
                    shares_count=0,
                    is_trending=False
                )
                db.add(post)
            
            db.commit()
            print("✅ Sample posts created successfully!")
        else:
            print("❌ Admin user not found")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_posts()
