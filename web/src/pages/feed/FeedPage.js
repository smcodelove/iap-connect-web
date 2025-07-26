// web/src/pages/feed/FeedPage.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, TrendingUp, Clock, Users, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchFeedPosts, createPost } from '../../store/slices/postSlice';
import PostCard from '../../components/posts/PostCard';
import CreatePostWidget from '../../components/posts/CreatePostWidget';

const FeedContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FeedHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 20px;
  
  h1 {
    color: ${props => props.theme.colors.textPrimary};
    font-size: 1.8rem;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  
  p {
    color: ${props => props.theme.colors.gray600};
    font-size: 1rem;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin: 20px 0;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.color || '#667eea'} 0%, ${props => props.colorDark || '#764ba2'} 100%);
  color: white;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  
  .stat-number {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .stat-label {
    font-size: 0.85rem;
    opacity: 0.9;
  }
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const FeedTabs = styled.div`
  display: flex;
  gap: 15px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const FeedTab = styled.button`
  background: none;
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  color: ${props => props.active ? 'white' : props.theme.colors.gray600};
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray100};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.gray200};
    color: ${props => props.active ? 'white' : props.theme.colors.primary};
  }
`;

const FilterControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RefreshButton = styled.button`
  background: none;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  padding: 8px 12px;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  
  &::after {
    content: '';
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

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.gray600};
  
  .icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  h3 {
    margin-bottom: 10px;
    color: ${props => props.theme.colors.gray700};
  }
  
  p {
    margin-bottom: 20px;
    line-height: 1.6;
  }
`;

const CreatePostButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-2px);
    text-decoration: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: ${props => props.theme.colors.danger};
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  margin-bottom: 20px;
  text-align: center;
`;

const FeedPage = () => {
  const dispatch = useDispatch();
  const { posts, loading, error, stats } = useSelector(state => state.posts);
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('recent');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeedPosts();
  }, [dispatch]);

  const loadFeedPosts = async () => {
    try {
      await dispatch(fetchFeedPosts()).unwrap();
    } catch (error) {
      console.error('Failed to load feed:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeedPosts();
    setRefreshing(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // You can implement different API calls based on tab
    if (tab === 'trending') {
      // dispatch(fetchTrendingPosts());
    } else if (tab === 'following') {
      // dispatch(fetchFollowingPosts());
    } else {
      // dispatch(fetchFeedPosts());
    }
  };

  const filteredPosts = posts?.filter(post => {
    if (activeTab === 'recent') return true;
    if (activeTab === 'trending') return post.likes_count > 5;
    if (activeTab === 'following') return post.user?.is_following;
    return true;
  }) || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading && !posts?.length) {
    return (
      <FeedContainer>
        <LoadingSpinner />
      </FeedContainer>
    );
  }

  return (
    <FeedContainer>
      <FeedHeader>
        <WelcomeSection>
          <h1>
            <Users size={24} />
            {getGreeting()}, {user?.full_name?.split(' ')[0] || user?.username}!
          </h1>
          <p>
            Welcome to the medical community. Connect, learn, and share knowledge with 
            {user?.user_type === 'doctor' ? ' fellow doctors' : ' medical students'} and professionals.
          </p>
        </WelcomeSection>
        
        <StatsRow>
          <StatCard color="#0066CC" colorDark="#004499">
            <div className="stat-number">{stats?.total_posts || 0}</div>
            <div className="stat-label">Total Posts</div>
          </StatCard>
          <StatCard color="#28A745" colorDark="#1e7e34">
            <div className="stat-number">{stats?.active_users || 0}</div>
            <div className="stat-label">Active Users</div>
          </StatCard>
          <StatCard color="#FF6B35" colorDark="#e55a2b">
            <div className="stat-number">{stats?.discussions || 0}</div>
            <div className="stat-label">Discussions</div>
          </StatCard>
          <StatCard color="#6F42C1" colorDark="#5a2d91">
            <div className="stat-number">
              {user?.user_type === 'doctor' ? 'MD' : 'Student'}
            </div>
            <div className="stat-label">Your Role</div>
          </StatCard>
        </StatsRow>
      </FeedHeader>

      <FilterSection>
        <FeedTabs>
          <FeedTab 
            active={activeTab === 'recent'} 
            onClick={() => handleTabChange('recent')}
          >
            <Clock size={16} />
            Recent
          </FeedTab>
          <FeedTab 
            active={activeTab === 'trending'} 
            onClick={() => handleTabChange('trending')}
          >
            <TrendingUp size={16} />
            Trending
          </FeedTab>
          <FeedTab 
            active={activeTab === 'following'} 
            onClick={() => handleTabChange('following')}
          >
            <Users size={16} />
            Following
          </FeedTab>
        </FeedTabs>

        <FilterControls>
          <RefreshButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
            Refresh
          </RefreshButton>
        </FilterControls>
      </FilterSection>

      <CreatePostWidget />

      <PostsContainer>
        {error && (
          <ErrorMessage>
            Error loading posts: {error}
          </ErrorMessage>
        )}

        {filteredPosts.length === 0 && !loading ? (
          <EmptyState>
            <div className="icon">📋</div>
            <h3>No posts yet</h3>
            <p>
              Be the first to share something with the medical community!<br/>
              Start a discussion, share a case study, or ask a question.
            </p>
            <CreatePostButton to="/create-post">
              <Plus size={16} />
              Create Your First Post
            </CreatePostButton>
          </EmptyState>
        ) : (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </PostsContainer>
    </FeedContainer>
  );
};

export default FeedPage;