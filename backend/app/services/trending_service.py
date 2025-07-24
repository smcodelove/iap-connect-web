"""
Trending service for IAP Connect application.
Handles trending posts calculation and algorithm.
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func, and_, or_
from datetime import datetime, timedelta
from typing import List, Tuple
import math

from ..models.post import Post
from ..models.like import Like
from ..models.comment import Comment
from ..models.user import User


class TrendingService:
    """Service for calculating and managing trending posts."""
    
    @staticmethod
    def calculate_trending_score(
        likes_count: int,
        comments_count: int, 
        shares_count: int,
        created_at: datetime,
        author_followers: int = 0
    ) -> float:
        """
        Calculate trending score for a post.
        
        Formula considers:
        - Engagement (likes, comments, shares)
        - Time decay (newer posts get higher scores)
        - Author influence (followers count)
        
        Args:
            likes_count: Number of likes
            comments_count: Number of comments
            shares_count: Number of shares
            created_at: Post creation time
            author_followers: Author's followers count
            
        Returns:
            float: Trending score
        """
        # Base engagement score
        engagement_score = (
            likes_count * 1.0 +           # Like weight
            comments_count * 2.0 +        # Comment weight (higher value)
            shares_count * 3.0            # Share weight (highest value)
        )
        
        # Time decay factor (posts lose relevance over time)
        hours_since_creation = (datetime.utcnow() - created_at).total_seconds() / 3600
        
        # Time decay using exponential decay
        # Posts older than 24 hours start losing significant score
        time_factor = math.exp(-hours_since_creation / 24)
        
        # Author influence factor (logarithmic scale)
        author_factor = 1 + math.log10(max(1, author_followers)) * 0.1
        
        # Velocity factor (engagement rate per hour)
        velocity = engagement_score / max(1, hours_since_creation)
        velocity_factor = 1 + math.log10(max(1, velocity)) * 0.2
        
        # Final trending score
        trending_score = (
            engagement_score * 
            time_factor * 
            author_factor * 
            velocity_factor
        )
        
        return round(trending_score, 2)
    
    @staticmethod
    def get_trending_posts(
        db: Session, 
        limit: int = 20,
        hours_window: int = 72  # Look at posts from last 72 hours
    ) -> List[Post]:
        """
        Get trending posts based on algorithm.
        
        Args:
            db: Database session
            limit: Number of trending posts to return
            hours_window: Time window to consider (in hours)
            
        Returns:
            List[Post]: Trending posts ordered by score
        """
        # Time threshold
        time_threshold = datetime.utcnow() - timedelta(hours=hours_window)
        
        # Query posts with engagement data
        trending_posts = db.query(Post).options(
            joinedload(Post.author)
        ).filter(
            Post.created_at >= time_threshold
        ).filter(
            # Only posts with some engagement
            or_(
                Post.likes_count > 0,
                Post.comments_count > 0,
                Post.shares_count > 0
            )
        ).all()
        
        # Calculate trending scores
        posts_with_scores = []
        for post in trending_posts:
            # Get author followers count (simplified - using user ID as proxy)
            author_followers = post.author.id * 10  # Mock followers calculation
            
            score = TrendingService.calculate_trending_score(
                likes_count=post.likes_count,
                comments_count=post.comments_count,
                shares_count=post.shares_count,
                created_at=post.created_at,
                author_followers=author_followers
            )
            
            posts_with_scores.append((post, score))
        
        # Sort by trending score (descending)
        posts_with_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Mark posts as trending and return
        trending_posts_result = []
        for post, score in posts_with_scores[:limit]:
            post.is_trending = True
            post.trending_score = score
            trending_posts_result.append(post)
        
        return trending_posts_result
    
    @staticmethod
    def get_trending_hashtags(db: Session, limit: int = 10) -> List[dict]:
        """
        Get trending hashtags.
        
        Args:
            db: Database session
            limit: Number of trending hashtags to return
            
        Returns:
            List[dict]: Trending hashtags with metadata
        """
        # Time threshold (last 7 days)
        time_threshold = datetime.utcnow() - timedelta(days=7)
        
        # Query to get hashtag usage from recent posts
        hashtag_query = db.query(Post).filter(
            Post.created_at >= time_threshold,
            Post.hashtags.isnot(None)
        ).all()
        
        # Count hashtag occurrences
        hashtag_counts = {}
        for post in hashtag_query:
            if post.hashtags:
                for hashtag in post.hashtags:
                    if hashtag not in hashtag_counts:
                        hashtag_counts[hashtag] = {
                            'count': 0,
                            'posts': [],
                            'total_engagement': 0
                        }
                    hashtag_counts[hashtag]['count'] += 1
                    hashtag_counts[hashtag]['posts'].append(post.id)
                    hashtag_counts[hashtag]['total_engagement'] += (
                        post.likes_count + post.comments_count + post.shares_count
                    )
        
        # Calculate trending scores for hashtags
        trending_hashtags = []
        for hashtag, data in hashtag_counts.items():
            if data['count'] >= 2:  # Minimum 2 posts to be trending
                # Score based on usage frequency and engagement
                score = (
                    data['count'] * 10 +  # Usage frequency
                    data['total_engagement'] * 2  # Total engagement
                )
                
                trending_hashtags.append({
                    'hashtag': hashtag,
                    'posts_count': data['count'],
                    'total_engagement': data['total_engagement'],
                    'score': score,
                    'growth': f"+{min(100, score // 10)}%"  # Mock growth percentage
                })
        
        # Sort by score and return top hashtags
        trending_hashtags.sort(key=lambda x: x['score'], reverse=True)
        return trending_hashtags[:limit]
    
    @staticmethod
    def update_post_trending_status(db: Session) -> int:
        """
        Batch update trending status for all posts.
        This should be run periodically (e.g., every hour).
        
        Args:
            db: Database session
            
        Returns:
            int: Number of posts updated
        """
        # Get trending posts
        trending_posts = TrendingService.get_trending_posts(db, limit=50)
        trending_post_ids = [post.id for post in trending_posts]
        
        # Reset all posts trending status
        db.query(Post).update({Post.is_trending: False})
        
        # Set trending status for top posts
        if trending_post_ids:
            db.query(Post).filter(
                Post.id.in_(trending_post_ids)
            ).update({Post.is_trending: True})
        
        db.commit()
        return len(trending_post_ids)


# Utility function for API endpoints
def get_trending_service() -> TrendingService:
    """Get trending service instance."""
    return TrendingService()