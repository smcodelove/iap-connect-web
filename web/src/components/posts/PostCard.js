// web/src/components/posts/PostCard.js
/**
 * Enhanced PostCard with complete API integration and social features
 * Features: Like, Comment, Share, Follow, Bookmark, Image display, Dropdown actions
 * UPDATED: Real API integration with proper state management
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Edit3,
  Trash2,
  Flag,
  Copy,
  ExternalLink,
  Send,
  Stethoscope,
  GraduationCap,
  Shield,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Import API services
import { postService, commentService, userService } from '../../services/api';

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
  flex-shrink: 0;
  
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
  min-width: 0;
`;

const UserName = styled(Link)`
  font-weight: 700;
  color: ${props => props.theme.colors.gray800};
  text-decoration: none;
  font-size: 16px;
  display: block;
  
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
  font-size: 12px;
  background: ${props => props.type === 'doctor' ? '#e3f2fd' : 
                         props.type === 'admin' ? '#ffebe6' : '#f3e5f5'};
  color: ${props => props.type === 'doctor' ? '#1976d2' : 
                    props.type === 'admin' ? '#d84315' : '#7b1fa2'};
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
`;

const PostTime = styled.span`
  font-size: 13px;
  color: ${props => props.theme.colors.gray500};
`;

const PostActions = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FollowButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.following ? `
    background: ${props.theme.colors.gray100};
    color: ${props.theme.colors.gray700};
    
    &:hover {
      background: ${props.theme.colors.danger}20;
      color: ${props.theme.colors.danger};
    }
  ` : `
    background: ${props.theme.colors.primary};
    color: white;
    
    &:hover {
      background: ${props.theme.colors.primaryDark};
      transform: translateY(-1px);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const MoreButton = styled.button`
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

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
  margin-top: 4px;
`;

const DropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.danger ? props.theme.colors.danger : props.theme.colors.gray700};
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.danger ? 
      props.theme.colors.danger + '10' : 
      props.theme.colors.gray50};
    color: ${props => props.danger ? 
      props.theme.colors.danger : 
      props.theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  cursor: pointer;
  
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
  border-radius: 4px;
  
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
    border-radius: 4px;
  }
`;

const PostFooter = styled.div`
  padding: 0 20px 16px;
`;

const PostStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
  margin-bottom: 12px;
  font-size: 13px;
  color: ${props => props.theme.colors.gray600};
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

const SocialActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  color: ${props => props.active ? 
    props.theme.colors.primary : 
    props.theme.colors.gray600};
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LikeButton = styled(SocialButton)`
  color: ${props => props.liked ? props.theme.colors.danger : props.theme.colors.gray600};
  
  &:hover {
    color: ${props => props.theme.colors.danger};
    background: ${props => props.theme.colors.danger}10;
  }
`;

const BookmarkButton = styled(SocialButton)`
  color: ${props => props.bookmarked ? 
    props.theme.colors.warning : 
    props.theme.colors.gray600};
    
  &:hover {
    color: ${props => props.theme.colors.warning};
    background: ${props => props.theme.colors.warning}10;
  }
`;

const CommentSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${props => props.theme.colors.gray200};
`;

const CommentInput = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
`;

const CommentTextarea = styled.textarea`
  flex: 1;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: 8px;
  resize: none;
  min-height: 80px;
  font-family: inherit;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const CommentButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  transition: all 0.2s ease;
  height: fit-content;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CommentItem = styled.div`
  padding: 12px;
  background: ${props => props.theme.colors.gray50};
  border-radius: 8px;
  border-left: 3px solid ${props => props.theme.colors.primary};
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.gray800};
  font-size: 14px;
`;

const CommentTime = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.gray500};
`;

const CommentText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.theme.colors.gray700};
`;

const PostCard = ({ post, onUpdate, onLike, onComment, onShare, onBookmark }) => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  // State management
  const [showDropdown, setShowDropdown] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked || false);
  const [following, setFollowing] = useState(post.author.is_following || false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check ownership and permissions
  const isOwnPost = user && user.id === post.author.id;
  const isAdmin = user && (user.user_type === 'admin' || user.user_type === 'ADMIN');

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  // Format time
  const formatTime = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return postDate.toLocaleDateString();
  };

  // Parse hashtags in text
  const parseHashtags = (text) => {
    return text.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
  };

  // Get user type icon
  const getUserTypeIcon = (userType) => {
    return userType === 'doctor' ? <Stethoscope size={12} /> : 
           userType === 'admin' ? <Shield size={12} /> :
           <GraduationCap size={12} />;
  };

  // Load comments when section is opened
  const loadComments = async () => {
    if (commentsLoading) return;
    
    try {
      setCommentsLoading(true);
      console.log(`📝 Loading comments for post ${post.id}`);
      
      const response = await commentService.getPostComments(post.id);
      setComments(response.comments || []);
      
      console.log(`✅ Loaded ${response.comments?.length || 0} comments`);
    } catch (error) {
      console.error('❌ Error loading comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Handle like
  const handleLike = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log(`❤️ ${liked ? 'Unliking' : 'Liking'} post ${post.id}`);
      
      const response = liked 
        ? await postService.unlikePost(post.id)
        : await postService.likePost(post.id);
      
      setLiked(!liked);
      setLikeCount(response.likes_count || (liked ? likeCount - 1 : likeCount + 1));
      
      if (onLike) {
        onLike(post.id, !liked);
      }
      
      console.log(`✅ Post ${post.id} ${liked ? 'unliked' : 'liked'} successfully`);
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      alert('Failed to update like. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [liked, likeCount, loading, post.id, onLike]);

  // Handle follow
  const handleFollow = async () => {
    if (followLoading || isOwnPost) return;
    
    setFollowLoading(true);
    const newFollowState = !following;
    setFollowing(newFollowState);

    try {
      let response;
      if (following) {
        response = await userService.unfollowUser(post.author.id);
      } else {
        response = await userService.followUser(post.author.id);
      }

      if (!response.success) {
        // Revert on failure
        setFollowing(following);
      }
    } catch (error) {
      // Revert on error
      setFollowing(following);
      console.error('Follow error:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  // Handle bookmark
  const handleBookmark = useCallback(async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      console.log(`🔖 ${bookmarked ? 'Unbookmarking' : 'Bookmarking'} post ${post.id}`);
      
      const response = bookmarked 
        ? await postService.unbookmarkPost(post.id)
        : await postService.bookmarkPost(post.id);
      
      setBookmarked(!bookmarked);
      
      if (onBookmark) {
        onBookmark(post.id, !bookmarked);
      }
      
      console.log(`✅ Post ${post.id} ${bookmarked ? 'unbookmarked' : 'bookmarked'} successfully`);
    } catch (error) {
      console.error('❌ Error toggling bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [bookmarked, loading, post.id, onBookmark]);

  // Handle add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || loading) return;
    
    try {
      setLoading(true);
      console.log(`💬 Adding comment to post ${post.id}`);
      
      const response = await commentService.addComment(post.id, newComment.trim());
      
      // Add new comment to list
      setComments(prev => [response.comment, ...prev]);
      setNewComment('');
      
      if (onComment) {
        onComment(post.id);
      }
      
      console.log('✅ Comment added successfully');
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle share
  const handleShare = useCallback(async () => {
    try {
      const postUrl = `${window.location.origin}/post/${post.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `Post by ${post.author.full_name}`,
          text: post.content.substring(0, 100),
          url: postUrl
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(postUrl);
        alert('Link copied to clipboard!');
      }
      
      if (onShare) {
        onShare(post.id);
      }
      
      console.log(`📤 Post ${post.id} shared`);
    } catch (error) {
      console.error('❌ Error sharing:', error);
    }
  }, [post, onShare]);

  // Handle dropdown actions
  const handleEdit = () => {
    setShowDropdown(false);
    console.log(`✏️ Editing post ${post.id}`);
    navigate(`/post/${post.id}/edit`);
  };

  const handleDelete = async () => {
    setShowDropdown(false);
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        console.log(`🗑️ Deleting post ${post.id}`);
        
        await postService.deletePost(post.id);
        
        if (onUpdate) {
          onUpdate();
        }
        
        console.log(`✅ Post ${post.id} deleted successfully`);
      } catch (error) {
        console.error('❌ Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const handleReport = () => {
    setShowDropdown(false);
    console.log(`🚩 Reporting post ${post.id}`);
    alert('Report functionality coming soon!');
  };

  const handleCopyLink = async () => {
    setShowDropdown(false);
    try {
      const postUrl = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(postUrl);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('❌ Error copying link:', error);
    }
  };

  const handleViewPost = () => {
    setShowDropdown(false);
    navigate(`/post/${post.id}`);
  };

  // Handle comments toggle
  const handleCommentsToggle = () => {
    const newShowComments = !showComments;
    setShowComments(newShowComments);
    
    if (newShowComments && comments.length === 0) {
      loadComments();
    }
  };

  // Handle post text click (view full post)
  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <PostCardContainer>
      <PostHeader>
        <UserInfo>
          <UserAvatar to={`/user/${post.author.id}`}>
            {post.author.profile_picture_url ? (
              <img src={post.author.profile_picture_url} alt={post.author.full_name} />
            ) : (
              getUserInitials(post.author.full_name)
            )}
          </UserAvatar>
          
          <UserDetails>
            <UserName to={`/user/${post.author.id}`}>
              {post.author.full_name}
            </UserName>
            <UserMeta>
              <UserType type={post.author.user_type}>
                {getUserTypeIcon(post.author.user_type)}
                {post.author.user_type === 'doctor' ? 'Doctor' : 
                 post.author.user_type === 'student' ? 'Student' : 
                 post.author.user_type === 'admin' ? 'Admin' : 'User'}
              </UserType>
              <PostTime>{formatTime(post.created_at)}</PostTime>
            </UserMeta>
          </UserDetails>
        </UserInfo>

        <PostActions ref={dropdownRef}>
          {!isOwnPost && (
            <FollowButton
              following={following}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
              {followLoading ? 'Loading...' : following ? 'Following' : 'Follow'}
            </FollowButton>
          )}
          
          <MoreButton onClick={() => setShowDropdown(!showDropdown)}>
            <MoreHorizontal size={20} />
          </MoreButton>
          
          {showDropdown && (
            <DropdownMenu>
              <DropdownItem onClick={handleViewPost}>
                <ExternalLink size={16} />
                View Post
              </DropdownItem>
              
              <DropdownItem onClick={handleCopyLink}>
                <Copy size={16} />
                Copy Link
              </DropdownItem>
              
              {isOwnPost && (
                <>
                  <DropdownItem onClick={handleEdit}>
                    <Edit3 size={16} />
                    Edit Post
                  </DropdownItem>
                  
                  <DropdownItem onClick={handleDelete} danger>
                    <Trash2 size={16} />
                    Delete Post
                  </DropdownItem>
                </>
              )}
              
              {isAdmin && !isOwnPost && (
                <DropdownItem onClick={handleDelete} danger>
                  <Trash2 size={16} />
                  Delete Post (Admin)
                </DropdownItem>
              )}
              
              {!isOwnPost && (
                <DropdownItem onClick={handleReport} danger>
                  <Flag size={16} />
                  Report Post
                </DropdownItem>
              )}
            </DropdownMenu>
          )}
        </PostActions>
      </PostHeader>

      <PostContent>
        <PostText 
          onClick={handlePostClick}
          dangerouslySetInnerHTML={{ __html: parseHashtags(post.content) }}
        />
        
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
        {(likeCount > 0 || post.comments_count > 0) && (
          <PostStats>
            <StatButton>
              {likeCount > 0 && `${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`}
            </StatButton>
            <StatButton onClick={handleCommentsToggle}>
              {post.comments_count > 0 && `${post.comments_count} ${post.comments_count === 1 ? 'comment' : 'comments'}`}
            </StatButton>
          </PostStats>
        )}

        <SocialActions>
          <ActionGroup>
            <LikeButton
              liked={liked}
              onClick={handleLike}
              disabled={loading}
            >
              <Heart 
                size={20} 
                fill={liked ? 'currentColor' : 'none'} 
              />
              Like
            </LikeButton>
            
            <SocialButton onClick={handleCommentsToggle}>
              <MessageCircle size={20} />
              Comment
            </SocialButton>
            
            <SocialButton onClick={handleShare}>
              <Share2 size={20} />
              Share
            </SocialButton>
          </ActionGroup>

          <BookmarkButton 
            bookmarked={bookmarked}
            onClick={handleBookmark}
            disabled={loading}
          >
            <Bookmark 
              size={20} 
              fill={bookmarked ? 'currentColor' : 'none'} 
            />
          </BookmarkButton>
        </SocialActions>

        {showComments && (
          <CommentSection>
            <CommentInput>
              <CommentTextarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                disabled={loading}
              />
              <CommentButton 
                onClick={handleAddComment}
                disabled={!newComment.trim() || loading}
              >
                <Send size={16} />
                Post
              </CommentButton>
            </CommentInput>

            <CommentsList>
              {commentsLoading && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  Loading comments...
                </div>
              )}
              
              {comments.map(comment => (
                <CommentItem key={comment.id}>
                  <CommentHeader>
                    <CommentAuthor>{comment.author.full_name}</CommentAuthor>
                    <CommentTime>{formatTime(comment.created_at)}</CommentTime>
                  </CommentHeader>
                  <CommentText>{comment.content}</CommentText>
                </CommentItem>
              ))}
              
              {!commentsLoading && comments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                  No comments yet. Be the first to comment!
                </div>
              )}
            </CommentsList>
          </CommentSection>
        )}
      </PostFooter>
    </PostCardContainer>
  );
};

export default PostCard;