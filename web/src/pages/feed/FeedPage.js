// web/src/pages/feed/FeedPage.js - FIXED REFRESH BUTTON
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, RefreshCw, TrendingUp, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

import PostCard from '../../components/posts/PostCard';
import { postService } from '../../services/api';

const FeedContainer = styled.div`
  max-width: 680px;
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
`;

const WelcomeTitle = styled.h1`
  color: ${props => props.theme.colors.gray800};
  margin-bottom: 8px;
  font-size: 1.5rem;
`;

const WelcomeText = styled.p`
  color: ${props => props.theme.colors.gray600};
  margin-bottom: 20px;
  line-height: 1.5;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: ${props => props.color || props.theme.colors.primary};
  color: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  
  .number {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 4px;
  }
  
  .label {
    font-size: 0.875rem;
    opacity: 0.9;
  }
`;

const QuickPostSection = styled.div`
  background: ${props => props.theme.colors.gray50};
  border: 2px dashed ${props => props.theme.colors.gray300};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  margin-bottom: 20px;
  
  .icon {
    font-size: 2rem;
    margin-bottom: 8px;
  }
  
  p {
    color: ${props => props.theme.colors.gray600};
    margin-bottom: 12px;
  }
`;

const CreatePostButton = styled(Link)`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${props => props.theme.colors.primary}40;
  }
`;

const FeedTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FeedTab = styled.button`
  background: ${props => props.active ? props.theme.colors.primary : 'white'};
  color: ${props => props.active ? 'white' : props.theme.colors.gray600};
  border: 2px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray300};
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.active ? 'white' : props.theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const RefreshButton = styled.button`
  background: white;
  border: 2px solid ${props => props.theme.colors.gray300};
  color: ${props => props.theme.colors.gray600};
  padding: 12px 16px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  font-weight: 600;
  
  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
    background: ${props => props.theme.colors.primary}05;
  }
  
  &:active {
    transform: translateY(0);
    background: ${props => props.theme.colors.primary}10;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  .icon {
    animation: ${props => props.loading ? 'spin 1s linear infinite' : 'none'};
    transition: transform 0.2s ease;
  }
  
  &:hover:not(:disabled) .icon {
    transform: rotate(45deg);
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.theme.colors.gray600};
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .icon {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.5;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.theme.colors.gray600};
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  .icon {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.5;
  }
  
  h3 {
    margin-bottom: 8px;
    color: ${props => props.theme.colors.gray700};
  }
  
  p {
    margin-bottom: 20px;
    line-height: 1.5;
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.theme.colors.danger};
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.danger}20;
  
  .icon {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.7;
  }
  
  h3 {
    margin-bottom: 8px;
    color: ${props => props.theme.colors.danger};
  }
  
  button {
    background: ${props => props.theme.colors.danger};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 15px;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${props => props.theme.colors.danger}dd;
      transform: translateY(-1px);
    }
  }
`;

const LoadMoreButton = styled.button`
  background: white;
  border: 2px solid ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primary};
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin: 20px auto;
  display: block;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary};
    color: white;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FeedPage = () => {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('recent');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch posts based on active tab
  const fetchPosts = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (pageNum === 1) {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      } else {
        setLoadingMore(true);
      }
      
      setError(null);
      
      console.log(`📱 Fetching ${activeTab} posts - Page ${pageNum}`);
      
      let response;
      if (activeTab === 'trending') {
        response = await postService.getTrendingPosts(pageNum, 20, 72);
      } else {
        response = await postService.getFeed(pageNum, 20);
      }
      
      const newPosts = response.posts || [];
      
      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(response.hasNext || false);
      setPage(pageNum);
      
      console.log(`✅ Loaded ${newPosts.length} ${activeTab} posts`);
      
    } catch (error) {
      console.error(`❌ Error fetching ${activeTab} posts:`, error);
      setError(error.message || 'Failed to load posts');
      
      if (pageNum === 1) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  // Initial load
  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  // Handle tab change
  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      console.log(`🔄 Switching to ${tab} tab`);
      setActiveTab(tab);
      setPage(1);
      setHasMore(false);
    }
  };

  // Handle refresh - FIXED: Added proper logging and error handling
  const handleRefresh = useCallback((event) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    console.log('🔄 Refresh button clicked - Refreshing feed...');
    
    if (refreshing) {
      console.log('⏳ Already refreshing, ignoring request');
      return;
    }
    
    fetchPosts(1, true);
  }, [fetchPosts, refreshing]);

  // Handle load more
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchPosts(page + 1);
    }
  };

  // Handle post update (after edit, delete, etc.)
  const handlePostUpdate = () => {
    fetchPosts(1, true);
  };

  // Get user greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get user first name
  const getUserFirstName = () => {
    return user?.full_name?.split(' ')[0] || 'Doctor';
  };

  if (loading && posts.length === 0) {
    return (
      <FeedContainer>
        <LoadingState>
          <div className="icon">⏳</div>
          <h3>Loading your feed...</h3>
          <p>Getting the latest posts from the medical community</p>
        </LoadingState>
      </FeedContainer>
    );
  }

  if (error && posts.length === 0) {
    return (
      <FeedContainer>
        <ErrorState>
          <div className="icon">⚠️</div>
          <h3>Unable to load feed</h3>
          <p>{error}</p>
          <button onClick={() => fetchPosts(1)}>
            Try Again
          </button>
        </ErrorState>
      </FeedContainer>
    );
  }

  return (
    <FeedContainer>
      <FeedHeader>
        <WelcomeSection>
          <WelcomeTitle>
            👋 {getGreeting()}, {getUserFirstName()}!
          </WelcomeTitle>
          <WelcomeText>
            Welcome to the medical community. Connect, learn, and share knowledge with medical students and professionals.
          </WelcomeText>
        </WelcomeSection>

        <StatsGrid>
          <StatCard color="#3f51b5">
            <div className="number">{posts.length}</div>
            <div className="label">Posts in Feed</div>
          </StatCard>
          <StatCard color="#4caf50">
            <div className="number">
              {posts.filter(post => new Date(post.created_at) > new Date(Date.now() - 24*60*60*1000)).length}
            </div>
            <div className="label">Today's Posts</div>
          </StatCard>
          <StatCard color="#ff9800">
            <div className="number">
              {posts.reduce((sum, post) => sum + post.comments_count, 0)}
            </div>
            <div className="label">Total Comments</div>
          </StatCard>
          <StatCard color="#9c27b0">
            <div className="number">
              {user?.user_type === 'doctor' ? 'Doctor' : 
               user?.user_type === 'student' ? 'Student' : 
               user?.user_type === 'admin' ? 'Admin' : 'User'}
            </div>
            <div className="label">Your Role</div>
          </StatCard>
        </StatsGrid>

        <QuickPostSection>
          <div className="icon">📝</div>
          <p>What's on your mind? Share your knowledge, ask questions, or start a discussion.</p>
          <CreatePostButton to="/create-post">
            <Plus size={16} />
            Create Post
          </CreatePostButton>
        </QuickPostSection>
      </FeedHeader>

      <FeedTabs>
        <FeedTab 
          active={activeTab === 'recent'} 
          onClick={() => handleTabChange('recent')}
        >
          <Clock size={16} />
          Recent
        </FeedTab>
        <FeedTab 
          active={activeTab === 'following'} 
          onClick={() => handleTabChange('following')}
        >
          <Users size={16} />
          Following
        </FeedTab>
        
        <RefreshButton 
          onClick={handleRefresh} 
          disabled={refreshing}
          loading={refreshing}
          title="Refresh feed"
          type="button"
        >
          <RefreshCw size={16} className="icon" />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </RefreshButton>
      </FeedTabs>

      <PostsContainer>
        {refreshing && posts.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '10px',
            background: '#e3f2fd',
            borderRadius: '8px',
            marginBottom: '15px',
            color: '#1976d2',
            fontWeight: '600'
          }}>
            🔄 Refreshing feed...
          </div>
        )}
        
        {posts.length === 0 ? (
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
          <>
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post}
                onUpdate={handlePostUpdate}
              />
            ))}
            
            {hasMore && (
              <LoadMoreButton 
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading More...' : 'Load More Posts'}
              </LoadMoreButton>
            )}
            
            {!hasMore && posts.length > 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#666',
                fontStyle: 'italic'
              }}>
                You've reached the end of the feed! 🎉
              </div>
            )}
          </>
        )}
      </PostsContainer>
    </FeedContainer>
  );
};

export default FeedPage;