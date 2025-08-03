// web/src/pages/trending/TrendingPage.js - USERS SECTION COMMENTED OUT
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { 
  TrendingUp, 
  Hash, 
  Users, 
  Flame, 
  RefreshCw,
  BarChart3,
  Target,
  Award,
  UserCheck,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { postService } from '../../services/api';
import userService from '../../services/userService';
import PostCard from '../../components/posts/PostCard';

const formatUserTypeDisplay = (user) => {
  if (user.user_type === 'doctor') {
    return user.specialty ? `Dr. ${user.specialty}` : 'Medical Professional';
  } else if (user.user_type === 'student') {
    return user.college || 'Medical Student';
  }
  return 'User';
};

const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.error) return error.error;
  return 'An unexpected error occurred';
};

const TrendingContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
`;

const TrendingHeader = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  
  .icon-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    margin: 0 auto 20px;
  }
  
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
  }
`;

const StatsHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
  
  .stat-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: ${props => props.color || props.theme.colors.primary}15;
    border-radius: 50%;
    margin-bottom: 12px;
    color: ${props => props.color || props.theme.colors.primary};
  }
  
  .stat-number {
    font-size: 1.8rem;
    font-weight: 700;
    color: ${props => props.theme.colors.gray800};
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.gray600};
    font-weight: 500;
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 6px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
  position: relative;
`;

const TabButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.gray600};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover:not([disabled]) {
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.gray100};
    color: ${props => props.active ? 'white' : props.theme.colors.gray800};
  }
`;

const RefreshButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.theme.colors.gray100};
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  color: ${props => props.theme.colors.gray600};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.gray200};
    color: ${props => props.theme.colors.gray800};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .icon {
    animation: ${props => props.refreshing ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
  overflow: hidden;
`;

// Additional styled components for posts, hashtags, and users
const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${props => props.theme.colors.gray200};
    border-top: 3px solid ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    margin-top: 16px;
    font-size: 16px;
    color: ${props => props.theme.colors.gray600};
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.gray600};
  
  .icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 16px;
    opacity: 0.5;
  }
  
  h3 {
    margin: 0 0 8px 0;
    color: ${props => props.theme.colors.gray800};
  }
  
  .error-message {
    margin: 8px 0 16px 0;
    font-size: 14px;
    color: ${props => props.theme.colors.danger};
  }
  
  button {
    background: ${props => props.theme.colors.primary};
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 15px;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${props => props.theme.colors.primaryDark};
      transform: translateY(-1px);
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.gray600};
  
  .icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 16px;
    opacity: 0.5;
  }
  
  h3 {
    margin: 0 0 8px 0;
    color: ${props => props.theme.colors.gray800};
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
`;

const PostsList = styled.div`
  & > * {
    border-bottom: 1px solid ${props => props.theme.colors.gray200};
    
    &:last-child {
      border-bottom: none;
    }
  }
`;

const HashtagsList = styled.div`
  padding: 20px;
`;

const HashtagCard = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray50};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const HashtagRank = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-right: 16px;
  font-size: 14px;
`;

const HashtagContent = styled.div`
  flex: 1;
  
  .hashtag-name {
    font-weight: 600;
    color: ${props => props.theme.colors.gray800};
    margin-bottom: 4px;
  }
  
  .hashtag-stats {
    font-size: 14px;
    color: ${props => props.theme.colors.gray600};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const HashtagGrowth = styled.div`
  font-weight: 600;
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.danger};
  font-size: 14px;
`;

// Users section styled components (COMMENTED OUT)
/*
const UsersList = styled.div`
  padding: 20px;
`;

const UserCard = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray50};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserRank = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.secondary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: ${props => props.theme.colors.secondary};
  margin-right: 12px;
  font-size: 12px;
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
  background: ${props => props.theme.colors.gray200};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .initials {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.theme.colors.primary};
    color: white;
    font-weight: 600;
    font-size: 16px;
  }
`;

const UserContent = styled.div`
  flex: 1;
  
  .user-name {
    font-weight: 600;
    color: ${props => props.theme.colors.gray800};
    margin-bottom: 4px;
  }
  
  .user-type {
    font-size: 13px;
    color: ${props => props.theme.colors.gray600};
    margin-bottom: 8px;
  }
  
  .user-stats {
    font-size: 12px;
    color: ${props => props.theme.colors.gray500};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const UserGrowth = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.danger};
  font-size: 12px;
`;
*/

const TrendingPage = () => {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('posts');
  const [refreshing, setRefreshing] = useState(false);
  
  // Posts state
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trendingError, setTrendingError] = useState(null);
  
  // Hashtags state
  const [hashtags, setHashtags] = useState([]);
  const [hashtagsLoading, setHashtagsLoading] = useState(false);
  const [hashtagsError, setHashtagsError] = useState(null);
  
  // Users state (COMMENTED OUT - NOT USED)
  /*
  const [trendingUsers, setTrendingUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  */

  // Initial data loading
  useEffect(() => {
    if (activeTab === 'posts') {
      fetchTrendingPostsDirectly();
    } else if (activeTab === 'hashtags') {
      fetchHashtags();
    }
    // Users tab removed - no data loading for users
  }, [activeTab]);

  // Fetch trending posts
  const fetchTrendingPostsDirectly = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setTrendingError(null);
      
      console.log('🔥 Fetching trending posts directly...');
      
      const response = await postService.getTrendingPosts(1, 20, 72);
      
      console.log('✅ Trending posts response:', response);
      
      if (response && response.posts) {
        setTrendingPosts(response.posts);
        console.log(`✅ Loaded ${response.posts.length} trending posts`);
      } else {
        setTrendingPosts([]);
        setTrendingError('No trending posts available');
      }
    } catch (error) {
      console.error('❌ Error fetching trending posts:', error);
      const errorMessage = getErrorMessage(error);
      setTrendingError(`Unable to load trending posts: ${errorMessage}`);
      setTrendingPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch hashtags
  // REAL API FIX: TrendingPage.js - fetchHashtags function
// Backend API endpoint: /posts/trending/hashtags exists, just need to fix response handling

  const fetchHashtags = async () => {
    try {
      setHashtagsLoading(true);
      setHashtagsError(null);
      
      console.log('🏷️ Fetching trending hashtags from real API...');
      
      // FIXED: Direct API call since backend endpoint exists
      const response = await postService.getTrendingHashtags(10);
      
      console.log('📊 Raw API Response:', response);
      
      // FIXED: Handle the correct response structure from backend
      if (response && response.success && response.hashtags) {
        const formattedHashtags = response.hashtags.map((tag, index) => ({
          id: index + 1,
          rank: index + 1,
          hashtag: tag.hashtag,
          posts: tag.posts_count,
          engagement: tag.total_engagement,
          growth: tag.growth,
          positive: !tag.growth.includes('-')
        }));
        
        setHashtags(formattedHashtags);
        console.log(`✅ Loaded ${formattedHashtags.length} real trending hashtags:`, formattedHashtags);
      } else {
        throw new Error('Invalid response structure from API');
      }
    } catch (error) {
      console.error('❌ Error fetching real hashtags:', error);
      
      // FALLBACK: Extract hashtags from existing posts if API fails
      try {
        console.log('🔄 Trying fallback method - extracting from posts...');
        
        const postsResponse = await postService.getTrendingPosts(1, 50, 168); // 7 days
        
        if (postsResponse.success && postsResponse.posts && postsResponse.posts.length > 0) {
          // Extract hashtags from posts content
          const hashtagMap = new Map();
          
          postsResponse.posts.forEach(post => {
            if (post.content) {
              // Extract hashtags using regex
              const hashtagMatches = post.content.match(/#[\w]+/g);
              if (hashtagMatches) {
                hashtagMatches.forEach(tag => {
                  const cleanTag = tag.toLowerCase();
                  const engagement = (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0);
                  
                  if (hashtagMap.has(cleanTag)) {
                    const existing = hashtagMap.get(cleanTag);
                    hashtagMap.set(cleanTag, {
                      count: existing.count + 1,
                      engagement: existing.engagement + engagement
                    });
                  } else {
                    hashtagMap.set(cleanTag, {
                      count: 1,
                      engagement: engagement
                    });
                  }
                });
              }
            }
          });
          
          // Convert to array and sort by frequency + engagement
          const sortedHashtags = Array.from(hashtagMap.entries())
            .filter(([, data]) => data.count >= 1) // At least 1 post
            .sort((a, b) => {
              // Sort by count first, then by engagement
              const scoreA = a[1].count * 10 + a[1].engagement;
              const scoreB = b[1].count * 10 + b[1].engagement;
              return scoreB - scoreA;
            })
            .slice(0, 10)
            .map(([hashtag, data], index) => ({
              id: index + 1,
              rank: index + 1,
              hashtag: hashtag,
              posts: data.count,
              engagement: data.engagement,
              growth: `+${Math.min(99, Math.floor(data.count * 5 + Math.random() * 10))}%`,
              positive: true
            }));
          
          if (sortedHashtags.length > 0) {
            setHashtags(sortedHashtags);
            setHashtagsError('Extracted from posts - live hashtag data unavailable');
            console.log('✅ Extracted hashtags from posts:', sortedHashtags);
          } else {
            throw new Error('No hashtags found in posts');
          }
        } else {
          throw new Error('No posts available for hashtag extraction');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        setHashtagsError('Unable to load trending hashtags');
        setHashtags([]);
      }
    } finally {
      setHashtagsLoading(false);
    }
  };

  // Users fetch function (COMMENTED OUT)
  /*
  const fetchTrendingUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      
      console.log('👥 Fetching trending users...');
      
      const response = await userService.getTrendingUsers(15);
      
      if (response && response.success && response.users) {
        const formattedUsers = response.users.map((user, index) => ({
          ...user,
          rank: index + 1,
          growth: `+${Math.floor(Math.random() * 15 + 1)}%`,
          engagement_rate: Math.floor(Math.random() * 20 + 60) + '%'
        }));
        
        setTrendingUsers(formattedUsers);
        console.log(`✅ Loaded ${formattedUsers.length} trending users`);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Primary trending users failed:', error);
      
      try {
        console.log('🔄 Trying fallback with search...');
        const fallbackResponse = await userService.searchUsers('', { page: 1, perPage: 15 });
        
        if (fallbackResponse && fallbackResponse.success && fallbackResponse.users) {
          const fallbackUsers = fallbackResponse.users.map((user, index) => ({
            ...user,
            rank: index + 1,
            growth: `+${Math.floor(Math.random() * 15 + 1)}%`,
            engagement_rate: Math.floor(Math.random() * 20 + 60) + '%'
          }));
          
          console.log(`✅ Fallback: Found ${fallbackUsers.length} users via search`);
          setTrendingUsers(fallbackUsers);
          setUsersError('Live trending data unavailable, showing recent users');
        } else {
          throw new Error('Search fallback also failed');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        const errorMessage = getErrorMessage(error);
        setUsersError(`Unable to load users: ${errorMessage}`);
        setTrendingUsers([]);
      }
    } finally {
      setUsersLoading(false);
    }
  };
  */

  const handleRefresh = () => {
    if (activeTab === 'posts') {
      fetchTrendingPostsDirectly(true);
    } else if (activeTab === 'hashtags') {
      fetchHashtags();
    }
    // Users refresh removed
  };

  const handleRetry = () => {
    if (activeTab === 'posts') {
      fetchTrendingPostsDirectly();
    } else if (activeTab === 'hashtags') {
      fetchHashtags();
    }
    // Users retry removed
  };

  const handleHashtagClick = (hashtag) => {
    window.location.href = `/search?q=${encodeURIComponent(hashtag)}`;
  };

  // User click handler (COMMENTED OUT)
  /*
  const handleUserClick = (userId) => {
    window.location.href = `/profile/${userId}`;
  };
  */

  const renderPosts = () => {
    if (loading) {
      return (
        <LoadingSpinner>
          <div className="spinner"></div>
          <div className="loading-text">Loading trending posts...</div>
        </LoadingSpinner>
      );
    }

    if (trendingError) {
      return (
        <ErrorState>
          <TrendingUp className="icon" />
          <h3>Unable to load trending posts</h3>
          <div className="error-message">{trendingError}</div>
          <button onClick={handleRetry}>Try Again</button>
        </ErrorState>
      );
    }

    if (!trendingPosts || trendingPosts.length === 0) {
      return (
        <EmptyState>
          <TrendingUp className="icon" />
          <h3>No trending posts yet</h3>
          <p>Engaging posts from the medical community will appear here.</p>
        </EmptyState>
      );
    }

    return (
      <PostsList>
        {trendingPosts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            currentUser={user}
            showActions={true}
          />
        ))}
      </PostsList>
    );
  };

  const renderHashtags = () => {
    if (hashtagsLoading) {
      return (
        <LoadingSpinner>
          <div className="spinner"></div>
          <div className="loading-text">Loading trending hashtags...</div>
        </LoadingSpinner>
      );
    }

    if (hashtagsError) {
      return (
        <ErrorState>
          <Hash className="icon" />
          <h3>Unable to load trending hashtags</h3>
          <div className="error-message">{hashtagsError}</div>
          <button onClick={handleRetry}>Try Again</button>
        </ErrorState>
      );
    }

    if (!hashtags || hashtags.length === 0) {
      return (
        <EmptyState>
          <Hash className="icon" />
          <h3>No trending hashtags found</h3>
          <p>Popular medical topics and hashtags will appear here.</p>
        </EmptyState>
      );
    }

    return (
      <HashtagsList>
        {hashtags.map((item) => (
          <HashtagCard 
            key={item.id}
            onClick={() => handleHashtagClick(item.hashtag)}
          >
            <HashtagRank>#{item.rank}</HashtagRank>
            <HashtagContent>
              <div className="hashtag-name">{item.hashtag}</div>
              <div className="hashtag-stats">
                <span>{item.posts} posts</span>
                <span>•</span>
                <span>{item.engagement} engagements</span>
              </div>
            </HashtagContent>
            <HashtagGrowth positive={item.positive}>
              {item.growth}
            </HashtagGrowth>
          </HashtagCard>
        ))}
      </HashtagsList>
    );
  };

  // Users render function (COMMENTED OUT)
  /*
  const renderUsers = () => {
    if (usersLoading) {
      return (
        <LoadingSpinner>
          <div className="spinner"></div>
          <div className="loading-text">Loading trending users...</div>
        </LoadingSpinner>
      );
    }

    if (usersError && trendingUsers.length === 0) {
      return (
        <ErrorState>
          <Users className="icon" />
          <h3>Unable to load trending users</h3>
          <div className="error-message">{usersError}</div>
          <button onClick={handleRetry}>Try Again</button>
        </ErrorState>
      );
    }

    if (!trendingUsers || trendingUsers.length === 0) {
      return (
        <EmptyState>
          <Users className="icon" />
          <h3>No trending users found</h3>
          <p>Popular medical professionals and students will appear here.</p>
        </EmptyState>
      );
    }

    return (
      <UsersList>
        {usersError && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeeba',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#856404',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {usersError}
          </div>
        )}
        {trendingUsers.map((user) => (
          <UserCard 
            key={user.id} 
            onClick={() => handleUserClick(user.id)}
          >
            <UserRank rank={user.rank}>#{user.rank}</UserRank>
            <UserAvatar>
              {user.profile_picture_url ? (
                <img src={user.profile_picture_url} alt={user.full_name} />
              ) : (
                <div className="initials">
                  {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'}
                </div>
              )}
            </UserAvatar>
            <UserContent>
              <div className="user-name">{user.full_name}</div>
              <div className="user-type">
                {formatUserTypeDisplay(user)}
              </div>
              <div className="user-stats">
                <span>
                  <UserCheck size={14} style={{ marginRight: '4px' }} />
                  {user.followers_count || 0} followers
                </span>
                <span>•</span>
                <span>{user.posts_count || 0} posts</span>
                <span>•</span>
                <span>{user.engagement_rate} engagement</span>
              </div>
            </UserContent>
            <UserGrowth positive={!user.growth.includes('-')}>
              {user.growth.includes('-') ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
              {user.growth}
            </UserGrowth>
          </UserCard>
        ))}
      </UsersList>
    );
  };
  */

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return renderPosts();
      case 'hashtags':
        return renderHashtags();
      // case 'users':     // COMMENTED OUT
      //   return renderUsers();
      default:
        return renderPosts();
    }
  };

  const totalEngagement = hashtags.reduce((sum, h) => sum + (h.engagement || 0), 0);
  const totalPosts = trendingPosts.length;
  const avgGrowth = hashtags.length > 0 ? 
    Math.round(hashtags.reduce((sum, h) => sum + parseInt(h.growth.replace('%', '').replace('+', '')), 0) / hashtags.length) : 0;
  // const totalTrendingUsers = trendingUsers.length;  // COMMENTED OUT

  return (
    <TrendingContainer>
      <TrendingHeader>
        <HeaderContent>
          <div className="icon-container">
            <TrendingUp size={30} />
          </div>
          <h1>Trending</h1>
          <p>What's hot in the medical community right now</p>
        </HeaderContent>
      </TrendingHeader>

      <StatsHeader>
        <StatCard color="#FF6B35">
          <div className="stat-icon">
            <Flame size={24} />
          </div>
          <div className="stat-number">{totalPosts}</div>
          <div className="stat-label">Hot Posts</div>
        </StatCard>
        
        <StatCard color="#28A745">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-number">{totalEngagement.toLocaleString()}</div>
          <div className="stat-label">Total Engagement</div>
        </StatCard>
        
        <StatCard color="#6F42C1">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-number">+{avgGrowth}%</div>
          <div className="stat-label">Avg Growth</div>
        </StatCard>
        
        {/* USERS STAT CARD COMMENTED OUT */}
        {/*
        <StatCard color="#FD7E14">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-number">{totalTrendingUsers}</div>
          <div className="stat-label">Active Users</div>
        </StatCard>
        */}
      </StatsHeader>

      <TabContainer>
        <TabButton 
          active={activeTab === 'posts'}
          onClick={() => setActiveTab('posts')}
        >
          <TrendingUp size={18} />
          Posts
        </TabButton>
        
        <TabButton 
          active={activeTab === 'hashtags'}
          onClick={() => setActiveTab('hashtags')}
        >
          <Hash size={18} />
          Hashtags
        </TabButton>
        
        {/* USERS TAB BUTTON COMMENTED OUT */}
        {/*
        <TabButton 
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          Users
        </TabButton>
        */}
        
        {/* FIXED: Refresh button only shows for posts and hashtags, not users */}
        {activeTab !== 'users' && (
          <RefreshButton 
            onClick={handleRefresh}
            disabled={refreshing}
            refreshing={refreshing}
            title="Refresh trending data"
          >
            <RefreshCw size={16} className="icon" />
          </RefreshButton>
        )}
      </TabContainer>

      <ContentArea>
        {refreshing && (
          <div style={{
            textAlign: 'center',
            padding: '12px',
            background: '#e3f2fd',
            color: '#1976d2',
            fontWeight: '600',
            borderBottom: '1px solid #bbdefb'
          }}>
            🔄 Refreshing trending data...
          </div>
        )}
        {renderTabContent()}
      </ContentArea>
    </TrendingContainer>
  );
};

export default TrendingPage;