// web/src/pages/post/PostDetailPage.js - COMPLETE ERROR-FREE VERSION
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Send,
  Clock,
  Loader,
  Copy,          // NEW
  ExternalLink,  // NEW
  Flag,          // NEW
  Edit,          // NEW
  Trash2         // NEW
} from 'lucide-react';

// Fixed imports
import postService from '../../services/postService';
import { commentService } from '../../services/api';

const PostDetailContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  background: none;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  padding: 10px;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: ${props => props.theme.colors.gray600};
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${props => props.theme.colors.gray200};
    border-top: 3px solid ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
`;

const PostCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AuthorDetails = styled.div`
  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 4px;
  }
  
  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const PostContent = styled.div`
  margin-bottom: 25px;
  
  .content-text {
    color: ${props => props.theme.colors.gray700};
    line-height: 1.7;
    font-size: 1.05rem;
    margin-bottom: 15px;
    white-space: pre-line;
  }
  
  .hashtags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 15px;
  }
  
  .hashtag {
    background: ${props => props.theme.colors.primary}10;
    color: ${props => props.theme.colors.primary};
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 500;
  }
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.colors.gray200};
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  border-radius: 8px;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray600};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
    fill: ${props => props.active ? 'currentColor' : 'none'};
  }
`;

const CommentsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
`;

const CommentsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  
  h3 {
    color: ${props => props.theme.colors.textPrimary};
    font-size: 1.3rem;
  }
`;

const CommentForm = styled.form`
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  padding: 20px;
  background: ${props => props.theme.colors.gray50};
  border-radius: 8px;
`;

const CommentInput = styled.textarea`
  flex: 1;
  padding: 12px;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    outline: none;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const CommentButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  height: fit-content;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.gray400};
    cursor: not-allowed;
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CommentItem = styled.div`
  padding: 15px;
  border: 1px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray50};
  }
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const CommentAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
  }
  
  .time {
    font-size: 0.85rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const CommentContent = styled.div`
  color: ${props => props.theme.colors.gray700};
  line-height: 1.6;
`;

const EmptyComments = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.theme.colors.gray600};
  
  .icon {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.5;
  }
  
  h4 {
    margin-bottom: 8px;
    color: ${props => props.theme.colors.gray700};
  }
`;

// NEW styled components from first file
const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 150px;
  overflow: hidden;
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
  gap: 8px;
  color: ${props => props.danger ? props.theme.colors.danger : props.theme.colors.gray700};
  font-size: 14px;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${props => props.danger ? '#fef2f2' : props.theme.colors.gray50};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const MoreOptionsContainer = styled.div`
  position: relative;
`;

const ShareMenu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const ShareDialog = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const ShareOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 16px;
`;

const ShareOption = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: ${props => props.theme.colors.gray50};
  border: 1px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    border-color: ${props => props.theme.colors.primary};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  // State management
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // NEW state for dropdown and share
  const [showDropdown, setShowDropdown] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Load post and comments on component mount
  useEffect(() => {
    if (id) {
      loadPostData();
      loadComments();
    }
  }, [id]);

  // NEW: Handle more options click
  const handleMoreOptions = () => {
    setShowDropdown(!showDropdown);
  };

  // NEW: Handle share functionality
  const handleShare = async () => {
    setShowShareMenu(true);
    
    // Also track share in backend
    try {
      await postService.sharePost(post.id);
      setPost(prev => ({
        ...prev,
        shares_count: (prev.shares_count || 0) + 1
      }));
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  // NEW: Copy link to clipboard
  const handleCopyLink = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      alert('Link copied to clipboard!');
      setShowShareMenu(false);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // NEW: Share via web API
  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'IAP Connect Post',
          text: post.content.substring(0, 100) + '...',
          url: `${window.location.origin}/post/${post.id}`
        });
        setShowShareMenu(false);
      } catch (error) {
        console.error('Web share failed:', error);
      }
    } else {
      handleCopyLink(); // Fallback
    }
  };

  // NEW: Edit post (only for post owner)
  const handleEditPost = () => {
    navigate(`/edit-post/${post.id}`);
    setShowDropdown(false);
  };

  // NEW: Delete post (only for post owner or admin)
  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(post.id);
        alert('Post deleted successfully!');
        navigate('/feed');
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
    setShowDropdown(false);
  };

  // NEW: Report post
  const handleReportPost = () => {
    alert('Report functionality will be implemented soon.');
    setShowDropdown(false);
  };

  // NEW: Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };
    
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading post details for ID:', id);
      
      const response = await postService.getPostById(id);
      
      if (response.success && response.post) {
        setPost(response.post);
        console.log('✅ Post loaded successfully:', response.post);
      } else {
        throw new Error('Post not found');
      }
    } catch (error) {
      console.error('❌ Error loading post:', error);
      setError(error.message || 'Failed to load post details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      console.log('💬 Loading comments for post:', id);
      
      const response = await commentService.getPostComments(id, 1, 50);
      
      if (response.success && response.comments) {
        setComments(response.comments);
        console.log(`✅ Loaded ${response.comments.length} comments`);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('❌ Error loading comments:', error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (actionLoading || !post) return;
    
    try {
      setActionLoading(true);
      console.log('❤️ Toggling like for post:', post.id);
      
      let response;
      if (post.is_liked_by_user || post.is_liked) {
        response = await postService.unlikePost(post.id);
      } else {
        response = await postService.likePost(post.id);
      }
      
      if (response.success) {
        setPost(prev => ({
          ...prev,
          is_liked_by_user: response.liked,
          is_liked: response.liked,
          likes_count: response.likes_count || prev.likes_count
        }));
        console.log('✅ Like toggled successfully');
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      alert('Failed to update like. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || submittingComment) return;

    try {
      setSubmittingComment(true);
      console.log('💬 Submitting comment:', comment);
      
      const response = await commentService.addComment(id, comment.trim());
      
      if (response.success && response.comment) {
        // Add new comment to the top of the list
        setComments(prev => [response.comment, ...prev]);
        
        // Update post comments count
        setPost(prev => ({
          ...prev,
          comments_count: prev.comments_count + 1
        }));
        
        setComment('');
        console.log('✅ Comment added successfully');
      }
    } catch (error) {
      console.error('❌ Error submitting comment:', error);
      alert(error.message || 'Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Check if current user is post owner
  const isPostOwner = post && user && post.author?.id === user.id;
  const isAdmin = user?.user_type === 'admin';

  // Loading state
  if (loading) {
    return (
      <PostDetailContainer>
        <Header>
          <BackButton onClick={() => navigate('/feed')}>
            <ArrowLeft size={20} />
          </BackButton>
          <h1>Post Details</h1>
        </Header>
        <LoadingSpinner>
          <div className="spinner"></div>
          <div>Loading post details...</div>
        </LoadingSpinner>
      </PostDetailContainer>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <PostDetailContainer>
        <Header>
          <BackButton onClick={() => navigate('/feed')}>
            <ArrowLeft size={20} />
          </BackButton>
          <h1>Post Details</h1>
        </Header>
        <ErrorMessage>
          {error || 'Post not found'}
        </ErrorMessage>
        <button 
          onClick={loadPostData}
          style={{
            background: '#0066cc',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </PostDetailContainer>
    );
  }

  return (
    <PostDetailContainer>
      <Header>
        <BackButton onClick={() => navigate('/feed')}>
          <ArrowLeft size={20} />
        </BackButton>
        <h1>Post Details</h1>
      </Header>

      <PostCard>
        <PostHeader>
          <AuthorInfo>
            <Avatar>
              {post.author?.profile_picture_url || post.author?.avatar_url ? (
                <img 
                  src={post.author.profile_picture_url || post.author.avatar_url} 
                  alt={post.author.full_name || post.author.username}
                />
              ) : (
                getInitials(post.author?.full_name || post.author?.username || 'User')
              )}
            </Avatar>
            <AuthorDetails>
              <div className="name">
                {post.author?.full_name || post.author?.username || 'Unknown User'}
              </div>
              <div className="meta">
                <span>{post.author?.user_type || 'User'}</span>
                <Clock size={14} />
                <span>{formatTimeAgo(post.created_at)}</span>
              </div>
            </AuthorDetails>
          </AuthorInfo>
          
          {/* UPDATED: More options with dropdown */}
          <MoreOptionsContainer>
            <button 
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                handleMoreOptions();
              }}
            >
              <MoreHorizontal size={20} />
            </button>
            
            {showDropdown && (
              <DropdownMenu>
                <DropdownItem onClick={handleCopyLink}>
                  <Copy />
                  Copy Link
                </DropdownItem>
                
                {isPostOwner && (
                  <DropdownItem onClick={handleEditPost}>
                    <Edit />
                    Edit Post
                  </DropdownItem>
                )}
                
                {(isPostOwner || isAdmin) && (
                  <DropdownItem onClick={handleDeletePost} danger>
                    <Trash2 />
                    Delete Post
                  </DropdownItem>
                )}
                
                {!isPostOwner && (
                  <DropdownItem onClick={handleReportPost} danger>
                    <Flag />
                    Report Post
                  </DropdownItem>
                )}
              </DropdownMenu>
            )}
          </MoreOptionsContainer>
        </PostHeader>

        <PostContent>
          <div className="content-text">{post.content}</div>
          
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="hashtags">
              {post.hashtags.map((hashtag, index) => (
                <span key={index} className="hashtag">
                  {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                </span>
              ))}
            </div>
          )}
        </PostContent>

        <PostActions>
          <ActionGroup>
            <ActionButton 
              active={post.is_liked_by_user || post.is_liked} 
              onClick={handleLike}
              disabled={actionLoading}
            >
              <Heart size={18} />
              {post.likes_count || 0}
            </ActionButton>
            <ActionButton>
              <MessageCircle size={18} />
              {post.comments_count || 0}
            </ActionButton>
            
            {/* UPDATED: Share button with functionality */}
            <ActionButton onClick={handleShare}>
              <Share2 size={18} />
              {post.shares_count || 0}
            </ActionButton>
          </ActionGroup>
        </PostActions>
      </PostCard>

      <CommentsSection>
        <CommentsHeader>
          <h3>Comments ({post.comments_count || 0})</h3>
        </CommentsHeader>

        <CommentForm onSubmit={handleCommentSubmit}>
          <Avatar style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}>
            {getInitials(user?.full_name || user?.username)}
          </Avatar>
          <CommentInput
            placeholder="Add a thoughtful comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            disabled={submittingComment}
          />
          <CommentButton 
            type="submit" 
            disabled={!comment.trim() || submittingComment}
          >
            {submittingComment ? <Loader size={16} /> : <Send size={16} />}
            {submittingComment ? 'Posting...' : 'Comment'}
          </CommentButton>
        </CommentForm>

        <CommentsList>
          {commentsLoading ? (
            <LoadingSpinner>
              <div className="spinner"></div>
              <div>Loading comments...</div>
            </LoadingSpinner>
          ) : comments.length > 0 ? (
            comments.map(comment => (
              <CommentItem key={comment.id}>
                <CommentHeader>
                  <CommentAuthor>
                    <Avatar style={{ width: '35px', height: '35px', fontSize: '0.8rem' }}>
                      {getInitials(comment.author?.full_name || comment.author?.username || 'User')}
                    </Avatar>
                    <div>
                      <div className="name">
                        {comment.author?.full_name || comment.author?.username || 'Unknown User'}
                      </div>
                      <div className="time">{formatTimeAgo(comment.created_at)}</div>
                    </div>
                  </CommentAuthor>
                </CommentHeader>
                <CommentContent>
                  {comment.content}
                </CommentContent>
              </CommentItem>
            ))
          ) : (
            <EmptyComments>
              <div className="icon">💬</div>
              <h4>No comments yet</h4>
              <p>Be the first to share your thoughts!</p>
            </EmptyComments>
          )}
        </CommentsList>
      </CommentsSection>

      {/* NEW: Share Menu Modal */}
      {showShareMenu && (
        <ShareMenu onClick={() => setShowShareMenu(false)}>
          <ShareDialog onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Share this post</h3>
            
            <ShareOptions>
              <ShareOption onClick={handleWebShare}>
                <ExternalLink />
                Share
              </ShareOption>
              
              <ShareOption onClick={handleCopyLink}>
                <Copy />
                Copy Link
              </ShareOption>
            </ShareOptions>
            
            <button 
              onClick={() => setShowShareMenu(false)}
              style={{
                width: '100%',
                padding: '8px',
                marginTop: '16px',
                background: 'none',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </ShareDialog>
        </ShareMenu>
      )}
    </PostDetailContainer>
  );
};

export default PostDetailPage;