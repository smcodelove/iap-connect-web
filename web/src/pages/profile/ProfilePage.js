// web/src/pages/profile/ProfilePage.js - FIXED NAVIGATION LOGIC
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Users, 
  Stethoscope, 
  GraduationCap, 
  Mail, 
  Calendar,
  MapPin,
  Shield,
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

// Import services
import { postService } from '../../services/api';
import userService from '../../services/userService';
import authService from '../../services/authService';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  color: white;
`;

const ProfileTop = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  margin-bottom: 25px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  border: 4px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  
  .name {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .username {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 10px;
  }
  
  .bio {
    font-size: 1rem;
    opacity: 0.9;
    margin-bottom: 15px;
    line-height: 1.4;
  }
  
  .details {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    font-size: 0.9rem;
    opacity: 0.9;
    
    .detail-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }
`;

const UserTypeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
`;

const StatCard = styled.div`
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.clickable ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
    transform: ${props => props.clickable ? 'translateY(-2px)' : 'none'};
  }
  
  .number {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  .label {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  &.spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid white;
  border-radius: 8px;
  background: ${props => props.primary ? 'white' : 'transparent'};
  color: ${props => props.primary ? props.theme.colors.primary : 'white'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: white;
    color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ContentSection = styled.div`
  background: white;
`;

const ContentTabs = styled.div`
  display: flex;
  border-bottom: 2px solid ${props => props.theme.colors.gray200};
  margin-bottom: 30px;
  gap: 30px;
`;

const ContentTab = styled.button`
  background: none;
  border: none;
  padding: 15px 0;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray600};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.theme.colors.primary};
    transform: scaleX(${props => props.active ? 1 : 0});
    transition: transform 0.3s ease;
  }
`;

const ContentArea = styled.div`
  min-height: 300px;
`;

const EmptyContent = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.theme.colors.gray600};
  
  .icon {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.5;
  }
  
  h3 {
    margin-bottom: 8px;
    color: ${props => props.theme.colors.gray700};
  }
`;

const PostGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const PostCard = styled.div`
  background: ${props => props.theme.colors.gray50};
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.gray200};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  .author {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${props => props.theme.colors.primary};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .info {
      .name {
        font-weight: 600;
        color: ${props => props.theme.colors.gray800};
      }
      
      .type {
        font-size: 0.8rem;
        color: ${props => props.theme.colors.gray600};
      }
    }
  }
  
  .content {
    margin-bottom: 15px;
    line-height: 1.6;
    color: ${props => props.theme.colors.gray700};
  }
  
  .hashtags {
    margin-bottom: 15px;
    
    .hashtag {
      display: inline-block;
      background: ${props => props.theme.colors.primary}20;
      color: ${props => props.theme.colors.primary};
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      margin-right: 5px;
      margin-bottom: 5px;
    }
  }
  
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: ${props => props.theme.colors.gray600};
    
    .left {
      display: flex;
      gap: 20px;
      
      .action-btn {
        display: flex;
        align-items: center;
        gap: 5px;
        background: none;
        border: none;
        color: ${props => props.theme.colors.gray600};
        cursor: pointer;
        transition: color 0.3s ease;
        
        &:hover {
          color: ${props => props.theme.colors.primary};
        }
        
        &.liked {
          color: ${props => props.theme.colors.danger};
        }
        
        &.bookmarked {
          color: ${props => props.theme.colors.accent};
        }
      }
    }
    
    .date {
      opacity: 0.8;
      font-size: 0.8rem;
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: ${props => props.theme.colors.gray600};
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${props => props.theme.colors.gray200};
    border-top: 3px solid ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 20px;
  background: white;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 20px auto 0;
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: white;
    transform: translateY(-1px);
  }
`;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [refreshingStats, setRefreshingStats] = useState(false);
  
  // NEW: Real-time stats state
  const [realTimeStats, setRealTimeStats] = useState({
    posts_count: user?.posts_count || 0,
    followers_count: user?.followers_count || 0,
    following_count: user?.following_count || 0
  });

  // FIXED: Load real-time user statistics
  const loadRealTimeStats = async () => {
    try {
      setRefreshingStats(true);
      console.log('📊 Loading real-time user statistics');
      
      // Get fresh profile data with real counts
      const profileResponse = await userService.getMyProfile();
      
      if (profileResponse.success) {
        const newStats = {
          posts_count: profileResponse.user.posts_count || 0,
          followers_count: profileResponse.user.followers_count || 0,
          following_count: profileResponse.user.following_count || 0
        };
        
        setRealTimeStats(newStats);
        
        console.log('✅ Real-time stats updated:', newStats);
      } else {
        console.error('❌ Failed to load real-time stats:', profileResponse.error);
      }
    } catch (error) {
      console.error('❌ Error loading real-time stats:', error);
    } finally {
      setRefreshingStats(false);
    }
  };

  // Fetch user posts - Real API Implementation
  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      console.log('📝 Fetching user posts...');
      
      // Get all posts and filter for current user
      const response = await postService.getFeed(1, 100);
      const userPosts = response.posts.filter(post => post.author.id === user.id);
      setPosts(userPosts);
      
      // Update posts count in real-time stats
      setRealTimeStats(prev => ({
        ...prev,
        posts_count: userPosts.length
      }));
      
      console.log(`✅ Found ${userPosts.length} user posts`);
    } catch (error) {
      console.error('❌ Error fetching user posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch liked posts - Real API Implementation
  const fetchLikedPosts = async () => {
    try {
      setLoading(true);
      console.log('❤️ Fetching liked posts...');
      
      // Use the new liked posts API endpoint
      const response = await postService.getLikedPosts(1, 100);
      setLikedPosts(response.posts || []);
      
      console.log(`✅ Found ${response.posts?.length || 0} liked posts`);
    } catch (error) {
      console.error('❌ Error fetching liked posts:', error);
      setLikedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved posts - Real API Implementation  
  const fetchSavedPosts = async () => {
    try {
      setLoading(true);
      console.log('🔖 Fetching saved posts...');
      
      // Use the new bookmark API endpoint
      const response = await postService.getBookmarkedPosts(1, 100);
      setSavedPosts(response.posts || []);
      
      console.log(`✅ Found ${response.posts?.length || 0} saved posts`);
    } catch (error) {
      console.error('❌ Error fetching saved posts:', error);
      setSavedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle post interactions
  const handleLikePost = async (postId, currentLiked) => {
    try {
      console.log(`❤️ ${currentLiked ? 'Unliking' : 'Liking'} post: ${postId}`);
      
      if (currentLiked) {
        await postService.unlikePost(postId);
      } else {
        await postService.likePost(postId);
      }
      
      // Refresh current tab data
      switch (activeTab) {
        case 'posts':
          fetchUserPosts();
          break;
        case 'likes':
          fetchLikedPosts();
          break;
        case 'saved':
          fetchSavedPosts();
          break;
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error);
    }
  };

  const handleBookmarkPost = async (postId, currentBookmarked) => {
    try {
      console.log(`🔖 ${currentBookmarked ? 'Unbookmarking' : 'Bookmarking'} post: ${postId}`);
      
      if (currentBookmarked) {
        await postService.unbookmarkPost(postId);
      } else {
        await postService.bookmarkPost(postId);
      }
      
      // Refresh current tab data
      switch (activeTab) {
        case 'posts':
          fetchUserPosts();
          break;
        case 'likes':
          fetchLikedPosts();
          break;
        case 'saved':
          fetchSavedPosts();
          break;
      }
    } catch (error) {
      console.error('❌ Error toggling bookmark:', error);
      alert('Failed to update bookmark. Please try again.');
    }
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  // Handle edit profile
  const handleEditProfile = async () => {
    try {
      setEditProfileLoading(true);
      console.log('✏️ Opening edit profile...');
      
      // Navigate to edit profile route
      navigate('/edit-profile');
      
    } catch (error) {
      console.error('❌ Error opening edit profile:', error);
      alert('Unable to open edit profile. Please try again.');
    } finally {
      setEditProfileLoading(false);
    }
  };

  // Handle view connections
  const handleViewConnections = () => {
    try {
      console.log('👥 Opening connections...');
      
      // Navigate to connections page
      navigate('/connections');
      
    } catch (error) {
      console.error('❌ Error opening connections:', error);
      alert('Unable to open connections. Please try again.');
    }
  };

  // FIXED: Handle stats click (navigate to specific lists) - Use current user ID
  const handleStatsClick = (type) => {
    if (!user || !user.id) {
      console.error('❌ User ID not available');
      return;
    }

    console.log(`📊 Navigating to ${type} for user ${user.id}`);
    
    switch (type) {
      case 'posts':
        navigate(`/user/${user.id}/posts`);
        break;
      case 'followers':
        navigate(`/user/${user.id}/followers`);
        break;
      case 'following':
        navigate(`/user/${user.id}/following`);
        break;
      default:
        console.log(`📊 Unknown stats type: ${type}`);
    }
  };

  // Load content based on active tab
  useEffect(() => {
    if (!user) return;
    
    switch (activeTab) {
      case 'posts':
        fetchUserPosts();
        break;
      case 'likes':
        fetchLikedPosts();
        break;
      case 'saved':
        fetchSavedPosts();
        break;
      default:
        break;
    }
  }, [activeTab, user]);

  // Load real-time stats on component mount
  useEffect(() => {
    if (user) {
      loadRealTimeStats();
    }
  }, [user]);

  // Helper functions
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatPostDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return postDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Debug: Log user information
  useEffect(() => {
    console.log('🔍 ProfilePage Debug:', {
      user: user,
      userId: user?.id,
      username: user?.username
    });
  }, [user]);

  // Render post card component
  const renderPostCard = (post) => (
    <PostCard key={post.id} onClick={() => handlePostClick(post.id)}>
      <div className="author">
        <div className="avatar">
          {post.author.profile_picture_url ? (
            <img 
              src={post.author.profile_picture_url} 
              alt={post.author.full_name}
            />
          ) : (
            getInitials(post.author.full_name || post.author.username)
          )}
        </div>
        <div className="info">
          <div className="name">{post.author.full_name || post.author.username}</div>
          <div className="type">
            {post.author.user_type === 'doctor' ? 'Medical Professional' : 
             post.author.user_type === 'student' ? 'Medical Student' : 'User'}
          </div>
        </div>
      </div>
      
      <div className="content">{post.content}</div>
      
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="hashtags">
          {post.hashtags.map((hashtag, index) => (
            <span key={index} className="hashtag">#{hashtag}</span>
          ))}
        </div>
      )}
      
      <div className="actions">
        <div className="left">
          <button 
            className={`action-btn ${post.is_liked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleLikePost(post.id, post.is_liked);
            }}
          >
            <Heart size={16} fill={post.is_liked ? 'currentColor' : 'none'} />
            {post.likes_count || 0}
          </button>
          
          <button className="action-btn">
            <MessageCircle size={16} />
            {post.comments_count || 0}
          </button>
          
          <button 
            className={`action-btn ${post.is_bookmarked ? 'bookmarked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleBookmarkPost(post.id, post.is_bookmarked);
            }}
          >
            <Bookmark size={16} fill={post.is_bookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <div className="date">{formatPostDate(post.created_at)}</div>
      </div>
    </PostCard>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    if (loading) {
      return (
        <LoadingSpinner>
          <div className="spinner"></div>
          <span style={{ marginLeft: '10px' }}>Loading {activeTab}...</span>
        </LoadingSpinner>
      );
    }

    let currentPosts = [];
    switch (activeTab) {
      case 'posts':
        currentPosts = posts;
        break;
      case 'likes':
        currentPosts = likedPosts;
        break;
      case 'saved':
        currentPosts = savedPosts;
        break;
      default:
        currentPosts = [];
    }

    if (currentPosts.length === 0) {
      return (
        <EmptyContent>
          <div className="icon">
            {activeTab === 'posts' && '📝'}
            {activeTab === 'likes' && '❤️'}
            {activeTab === 'saved' && '🔖'}
          </div>
          <h3>No {activeTab} yet</h3>
          <p>
            {activeTab === 'posts' && 'Start sharing your knowledge with the medical community!'}
            {activeTab === 'likes' && 'Posts you like will appear here.'}
            {activeTab === 'saved' && 'Save posts to read them later.'}
          </p>
        </EmptyContent>
      );
    }

    return (
      <PostGrid>
        {currentPosts.slice(0, 3).map(renderPostCard)}
        {currentPosts.length > 3 && (
          <ViewAllButton onClick={() => handleStatsClick('posts')}>
            <ExternalLink size={16} />
            View All {currentPosts.length} Posts
          </ViewAllButton>
        )}
      </PostGrid>
    );
  };

  if (!user) {
    return (
      <ProfileContainer>
        <LoadingSpinner>
          <div className="spinner"></div>
          <span style={{ marginLeft: '10px' }}>Loading profile...</span>
        </LoadingSpinner>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <ProfileTop>
          <Avatar>
            {user.profile_picture_url ? (
              <img 
                src={user.profile_picture_url} 
                alt={user.full_name}
              />
            ) : (
              getInitials(user.full_name || user.username)
            )}
          </Avatar>
          
          <ProfileInfo>
            <div className="name">{user.full_name || user.username}</div>
            <div className="username">@{user.username}</div>
            
            <UserTypeBadge>
              {user.user_type === 'doctor' && <Stethoscope size={16} />}
              {user.user_type === 'student' && <GraduationCap size={16} />}
              {user.user_type === 'admin' && <Shield size={16} />}
              {user.user_type === 'doctor' ? 'Medical Professional' : 
               user.user_type === 'student' ? 'Medical Student' : 
               user.user_type === 'admin' ? 'Administrator' : 'User'}
            </UserTypeBadge>
            
            {user.bio && (
              <div className="bio">{user.bio}</div>
            )}
            
            <div className="details">
              {user.email && (
                <div className="detail-item">
                  <Mail size={16} />
                  {user.email}
                </div>
              )}
              
              {user.specialty && (
                <div className="detail-item">
                  <Stethoscope size={16} />
                  Specialty: {user.specialty}
                </div>
              )}
              
              {user.college && (
                <div className="detail-item">
                  <GraduationCap size={16} />
                  College: {user.college}
                </div>
              )}
              
              {user.created_at && (
                <div className="detail-item">
                  <Calendar size={16} />
                  Joined {formatJoinDate(user.created_at)}
                </div>
              )}
            </div>
          </ProfileInfo>
        </ProfileTop>

        <StatsSection>
          <StatCard clickable onClick={() => handleStatsClick('posts')}>
            <div className="number">
              {realTimeStats.posts_count}
              <RefreshButton 
                onClick={(e) => {
                  e.stopPropagation();
                  loadRealTimeStats();
                }}
                disabled={refreshingStats}
                className={refreshingStats ? 'spinning' : ''}
                title="Refresh stats"
              >
                <RefreshCw size={14} />
              </RefreshButton>
            </div>
            <div className="label">Posts</div>
          </StatCard>
          
          <StatCard clickable onClick={() => handleStatsClick('followers')}>
            <div className="number">
              {realTimeStats.followers_count}
              <RefreshButton 
                onClick={(e) => {
                  e.stopPropagation();
                  loadRealTimeStats();
                }}
                disabled={refreshingStats}
                className={refreshingStats ? 'spinning' : ''}
                title="Refresh stats"
              >
                <RefreshCw size={14} />
              </RefreshButton>
            </div>
            <div className="label">Followers</div>
          </StatCard>
          
          <StatCard clickable onClick={() => handleStatsClick('following')}>
            <div className="number">
              {realTimeStats.following_count}
              <RefreshButton 
                onClick={(e) => {
                  e.stopPropagation();
                  loadRealTimeStats();
                }}
                disabled={refreshingStats}
                className={refreshingStats ? 'spinning' : ''}
                title="Refresh stats"
              >
                <RefreshCw size={14} />
              </RefreshButton>
            </div>
            <div className="label">Following</div>
          </StatCard>
          
          <StatCard>
            <div className="number">
              {user.user_type === 'doctor' ? 'MD' : 
               user.user_type === 'student' ? 'Student' : 
               user.user_type === 'admin' ? 'Admin' : 'User'}
            </div>
            <div className="label">Role</div>
          </StatCard>
        </StatsSection>

        <ActionButtons>
          <ActionButton 
            primary 
            onClick={handleEditProfile}
            disabled={editProfileLoading}
          >
            <Edit size={16} />
            {editProfileLoading ? 'Loading...' : 'Edit Profile'}
          </ActionButton>
          <ActionButton onClick={handleViewConnections}>
            <Users size={16} />
            View Connections
          </ActionButton>
        </ActionButtons>
      </ProfileHeader>

      <ContentSection>
        <ContentTabs>
          <ContentTab 
            active={activeTab === 'posts'} 
            onClick={() => setActiveTab('posts')}
          >
            My Posts ({posts.length})
          </ContentTab>
          <ContentTab 
            active={activeTab === 'likes'} 
            onClick={() => setActiveTab('likes')}
          >
            Liked Posts ({likedPosts.length})
          </ContentTab>
          <ContentTab 
            active={activeTab === 'saved'} 
            onClick={() => setActiveTab('saved')}
          >
            Saved ({savedPosts.length})
          </ContentTab>
        </ContentTabs>

        <ContentArea>
          {renderTabContent()}
        </ContentArea>
      </ContentSection>
    </ProfileContainer>
  );
};

export default ProfilePage;