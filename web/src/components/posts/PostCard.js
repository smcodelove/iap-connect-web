// web/src/components/posts/PostCard.js
/**
 * Enhanced PostCard with complete social features
 * Features: Like, Comment, Share, Follow, Image display, Medical theme
 */

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  MapPin,
  Calendar,
  Stethoscope,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';

import LikeButton from '../common/LikeButton';
import FollowButton from '../common/FollowButton';
import CommentSection from '../comments/CommentSection';
import { postService, userService } from '../../services/api';

const PostCardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const PostHeader = styled.div`
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const UserAvatar = styled(Link)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
  text-decoration: none;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled(Link)`
  font-weight: 700;
  color: ${props => props.theme.colors.gray800};
  text-decoration: none;
  font-size: 16px;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const UserMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
`;

const UserType = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: ${props => props.theme.colors.gray600};
  background: ${props => props.type === 'doctor' ? '#e3f2fd' : '#f3e5f5'};
  color: ${props => props.type === 'doctor' ? '#1976d2' : '#7b1fa2'};
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
`;

const PostTime = styled.span`
  font-size: 13px;
  color: ${props => props.theme.colors.gray500};
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.primary};
  }
`;

const PostContent = styled.div`
  padding: 0 20px 16px;
`;

const PostText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${props => props.theme.colors.gray800};
  margin: 0 0 16px 0;
  white-space: pre-wrap;
  
  .hashtag {
    color: ${props => props.theme.colors.primary};
    font-weight: 600;
    cursor: pointer;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PostImages = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  
  ${props => props.count === 1 && `
    grid-template-columns: 1fr;
  `}
  
  ${props => props.count === 2 && `
    grid-template-columns: 1fr 1fr;
  `}
  
  ${props => props.count === 3 && `
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    
    img:first-child {
      grid-row: 1 / 3;
    }
  `}
  
  ${props => props.count >= 4 && `
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  `}
`;

const PostImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
  }
  
  ${props => props.single && `
    height: 300px;
  `}
`;

const MoreImagesOverlay = styled.div`
  position: relative;
  
  &::after {
    content: '+${props => props.count}';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 700;
  }
`;

const PostFooter = styled.div`
  padding: 0 20px 16px;
`;

const SocialActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-top: 1px solid ${props => props.theme.colors.gray200};
  margin-top: 12px;
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const SocialButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray600};
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const BookmarkButton = styled(SocialButton)`
  color: ${props => props.bookmarked ? '#f59e0b' : props.theme.colors.gray600};
`;

const PostStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: ${props => props.theme.colors.gray600};
  margin-bottom: 8px;
`;

const StatButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: inherit;
  
  &:hover {
    text-decoration: underline;
    color: ${props => props.theme.colors.primary};
  }
`;

const PostCard = ({ 
  post, 
  showComments = false, 
  onLike, 
  onComment, 
  onShare,
  onBookmark,
  currentUser 
}) => {
  const { user } = useSelector(state => state.auth);
  const [commentsVisible, setCommentsVisible] = useState(showComments);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked || false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Format timestamp
  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now - time;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return time.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Parse hashtags in text
  const parseHashtags = (text) => {
    return text.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
  };

  // Handle bookmark
  const handleBookmark = useCallback(async () => {
    if (bookmarkLoading) return;

    setBookmarkLoading(true);
    setIsBookmarked(!isBookmarked);

    try {
      let response;
      if (isBookmarked) {
        response = await postService.unbookmarkPost(post.id);
      } else {
        response = await postService.bookmarkPost(post.id);
      }

      if (!response.success) {
        // Revert on failure
        setIsBookmarked(isBookmarked);
      }

      if (onBookmark) {
        onBookmark(post.id, !isBookmarked);
      }
    } catch (error) {
      // Revert on error
      setIsBookmarked(isBookmarked);
      console.error('Bookmark error:', error);
    } finally {
      setBookmarkLoading(false);
    }
  }, [isBookmarked, bookmarkLoading, post.id, onBookmark]);

  // Handle share
  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${post.author.full_name}'s post`,
          text: post.content.substring(0, 100) + '...',
          url: `${window.location.origin}/post/${post.id}`
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        alert('Post link copied to clipboard!');
      }

      if (onShare) {
        onShare(post.id);
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [post, onShare]);

  // Get user type icon
  const getUserTypeIcon = (userType) => {
    return userType === 'doctor' ? <Stethoscope size={12} /> : <GraduationCap size={12} />;
  };

  // Get user avatar
  const getUserAvatar = () => {
    if (post.author.profile_picture_url) {
      return <img src={post.author.profile_picture_url} alt={post.author.full_name} />;
    }
    return post.author.full_name?.charAt(0) || 'U';
  };

  return (
    <PostCardContainer>
      <PostHeader>
        <UserInfo>
          <UserAvatar to={`/user/${post.author.id}`}>
            {getUserAvatar()}
          </UserAvatar>
          
          <UserDetails>
            <UserName to={`/user/${post.author.id}`}>
              {post.author.full_name}
            </UserName>
            <UserMeta>
              <UserType type={post.author.user_type}>
                {getUserTypeIcon(post.author.user_type)}
                {post.author.user_type === 'doctor' ? 'Doctor' : 'Student'}
              </UserType>
              <PostTime>{formatTime(post.created_at)}</PostTime>
            </UserMeta>
          </UserDetails>
        </UserInfo>

        <PostActions>
          {user?.id !== post.author.id && (
            <FollowButton
              userId={post.author.id}
              initialFollowing={post.author.is_following}
              size="small"
            />
          )}
          <ActionButton>
            <MoreHorizontal size={20} />
          </ActionButton>
        </PostActions>
      </PostHeader>

      <PostContent>
        <PostText dangerouslySetInnerHTML={{ __html: parseHashtags(post.content) }} />
        
        {post.media_urls && post.media_urls.length > 0 && (
          <PostImages count={post.media_urls.length}>
            {post.media_urls.slice(0, 4).map((url, index) => (
              <div key={index} style={{ position: 'relative' }}>
                {index === 3 && post.media_urls.length > 4 ? (
                  <MoreImagesOverlay count={post.media_urls.length - 3}>
                    <PostImage src={url} alt={`Post image ${index + 1}`} />
                  </MoreImagesOverlay>
                ) : (
                  <PostImage 
                    src={url} 
                    alt={`Post image ${index + 1}`}
                    single={post.media_urls.length === 1}
                  />
                )}
              </div>
            ))}
          </PostImages>
        )}
      </PostContent>

      <PostFooter>
        {(post.likes_count > 0 || post.comments_count > 0) && (
          <PostStats>
            <StatButton>
              {post.likes_count > 0 && `${post.likes_count} ${post.likes_count === 1 ? 'like' : 'likes'}`}
            </StatButton>
            <StatButton onClick={() => setCommentsVisible(!commentsVisible)}>
              {post.comments_count > 0 && `${post.comments_count} ${post.comments_count === 1 ? 'comment' : 'comments'}`}
            </StatButton>
          </PostStats>
        )}

        <SocialActions>
          <ActionGroup>
            <LikeButton
              postId={post.id}
              initialLiked={post.is_liked}
              initialCount={post.likes_count}
              onLikeChange={onLike}
            />
            
            <SocialButton onClick={() => setCommentsVisible(!commentsVisible)}>
              <MessageCircle size={20} />
              Comment
            </SocialButton>
            
            <SocialButton onClick={handleShare}>
              <Share2 size={20} />
              Share
            </SocialButton>
          </ActionGroup>

          <BookmarkButton 
            bookmarked={isBookmarked}
            onClick={handleBookmark}
            disabled={bookmarkLoading}
          >
            <Bookmark 
              size={20} 
              fill={isBookmarked ? 'currentColor' : 'none'} 
            />
          </BookmarkButton>
        </SocialActions>

        {commentsVisible && (
          <CommentSection postId={post.id} />
        )}
      </PostFooter>
    </PostCardContainer>
  );
};

export default PostCard;