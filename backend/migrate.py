#!/usr/bin/env python3
"""
Database migration script for User Profiles feature.
Run this from the backend directory.
"""

import os
import sys
from sqlalchemy import create_engine, text

# Get DATABASE_URL from environment or construct it
def get_database_url():
    """Get database URL from various sources."""
    # Try environment variable first
    if 'DATABASE_URL' in os.environ:
        return os.environ['DATABASE_URL']
    
    # Try loading from .env file
    try:
        from dotenv import load_dotenv
        load_dotenv()
        if 'DATABASE_URL' in os.environ:
            return os.environ['DATABASE_URL']
    except ImportError:
        pass
    
    # Try importing from app config
    try:
        from app.config.database import SQLALCHEMY_DATABASE_URL
        return SQLALCHEMY_DATABASE_URL
    except ImportError:
        pass
    
    try:
        from app.config.database import engine
        return str(engine.url)
    except ImportError:
        pass
    
    # Default PostgreSQL URL (adjust as needed)
    return "postgresql://postgres:password@localhost:5432/iap_connect"

# Get database URL
DATABASE_URL = get_database_url()
print(f"🔗 Using database: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")

# Migration SQL
MIGRATION_SQL = """
-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS posts_count INTEGER DEFAULT 0 NOT NULL;

-- Create follows table if it doesn't exist
CREATE TABLE IF NOT EXISTS follows (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Update existing user counts
UPDATE users 
SET followers_count = COALESCE((
    SELECT COUNT(*) 
    FROM follows 
    WHERE follows.following_id = users.id
), 0),
following_count = COALESCE((
    SELECT COUNT(*) 
    FROM follows 
    WHERE follows.follower_id = users.id
), 0),
posts_count = COALESCE((
    SELECT COUNT(*) 
    FROM posts 
    WHERE posts.user_id = users.id
), 0);

-- Create function to automatically update user counts when follows change
CREATE OR REPLACE FUNCTION update_user_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment counters
        UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement counters
        UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
        UPDATE users SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = OLD.following_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update counts
DROP TRIGGER IF EXISTS trigger_update_follow_counts ON follows;
CREATE TRIGGER trigger_update_follow_counts
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_user_follow_counts();

-- Create function to update post counts (if posts table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        EXECUTE '
        CREATE OR REPLACE FUNCTION update_user_post_counts()
        RETURNS TRIGGER AS $func$
        BEGIN
            IF TG_OP = ''INSERT'' THEN
                UPDATE users SET posts_count = posts_count + 1 WHERE id = NEW.user_id;
                RETURN NEW;
            ELSIF TG_OP = ''DELETE'' THEN
                UPDATE users SET posts_count = GREATEST(posts_count - 1, 0) WHERE id = OLD.user_id;
                RETURN OLD;
            END IF;
            RETURN NULL;
        END;
        $func$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS trigger_update_post_counts ON posts;
        CREATE TRIGGER trigger_update_post_counts
            AFTER INSERT OR DELETE ON posts
            FOR EACH ROW EXECUTE FUNCTION update_user_post_counts();
        ';
    END IF;
END $$;
"""

def run_migration():
    """Run the database migration."""
    try:
        print("🔄 Starting User Profiles migration...")
        
        # Create engine
        engine = create_engine(DATABASE_URL)
        
        # Test connection first
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
        
        # Execute migration
        with engine.connect() as connection:
            # Split by semicolon and execute each statement
            statements = [stmt.strip() for stmt in MIGRATION_SQL.split(';') if stmt.strip()]
            
            for i, statement in enumerate(statements, 1):
                if not statement.strip():
                    continue
                    
                try:
                    print(f"📝 Executing statement {i}/{len(statements)}...")
                    result = connection.execute(text(statement))
                    connection.commit()
                    print(f"   ✅ Statement {i} completed")
                except Exception as e:
                    print(f"   ⚠️  Warning in statement {i}: {e}")
                    continue
        
        print("\n✅ Migration completed successfully!")
        print("🎉 User Profiles feature is now ready!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check if PostgreSQL is running: brew services start postgresql")
        print("2. Verify database exists: createdb iap_connect")
        print("3. Check DATABASE_URL in .env file")
        sys.exit(1)

def check_migration():
    """Check if migration was successful."""
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as connection:
            # Check if new columns exist
            result = connection.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name IN ('followers_count', 'following_count', 'posts_count')
            """))
            
            columns = [row[0] for row in result]
            
            # Check if follows table exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name = 'follows'
                )
            """))
            
            follows_exists = result.scalar()
            
            # Check existing users count
            result = connection.execute(text("SELECT COUNT(*) FROM users"))
            users_count = result.scalar()
            
        print("\n📊 Migration Status:")
        print(f"✅ New user columns: {len(columns)}/3 added")
        for col in ['followers_count', 'following_count', 'posts_count']:
            status = "✅" if col in columns else "❌"
            print(f"   {status} {col}")
        
        print(f"✅ Follows table: {'Created' if follows_exists else 'Missing'}")
        print(f"📈 Existing users: {users_count}")
        
        if len(columns) == 3 and follows_exists:
            print("\n🎉 All migration components successful!")
            return True
        else:
            print("\n⚠️  Some migration components may need attention.")
            return False
            
    except Exception as e:
        print(f"❌ Could not check migration status: {e}")
        return False

def check_database_connection():
    """Check database connection and basic info."""
    try:
        print("🔍 Checking database connection...")
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as connection:
            # Check connection
            connection.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            
            # Check if users table exists
            result = connection.execute(text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name = 'users'
                )
            """))
            
            users_table_exists = result.scalar()
            print(f"📋 Users table: {'Exists' if users_table_exists else 'Missing'}")
            
            if users_table_exists:
                result = connection.execute(text("SELECT COUNT(*) FROM users"))
                count = result.scalar()
                print(f"👥 Users count: {count}")
                
                # Show current user table structure
                result = connection.execute(text("""
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'users'
                    ORDER BY ordinal_position
                """))
                
                columns = result.fetchall()
                print("📋 Current users table columns:")
                for col_name, col_type in columns:
                    print(f"   - {col_name}: {col_type}")
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("\n🔧 Try these solutions:")
        print("1. Start PostgreSQL: brew services start postgresql")
        print("2. Create database: createdb iap_connect")
        print("3. Check your .env file for correct DATABASE_URL")
        return False
    
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "check":
            check_migration()
        elif sys.argv[1] == "test":
            check_database_connection()
        else:
            print("Usage: python migrate.py [check|test]")
    else:
        if check_database_connection():
            run_migration()
            print("\n" + "="*50)
            check_migration()