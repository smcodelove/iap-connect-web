// web/src/pages/user/UserPostsPage.js
/**
 * UserPostsPage - Display all posts by a specific user
 * Features: Real API integration, Like/Comment/Share, Infinite scroll
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  FileText, 
  RefreshCw,
  Calendar,
  TrendingUp
} from 'lucide-react';

import userService from '../../services/userService';
import { postService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PostCard from '../../components/posts/PostCard';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  color: white;
  padding: 30px;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
  
  h1 {
    font-size: 1.8rem;
    font-weight: bold;
    margin: 0 0 5px 0;
  }
  
  .subtitle {
    opacity: 0.9;
    font-size: 1rem;
  }
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  
  .stat {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .number {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .label {
      opacity: 0.9;
    }
  }
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    opacity: 0.5;
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

const FilterSection = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
  display: flex;
  align-items: center;
  gap: 15px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: 20px;
  background: ${props => props.active ? props.theme.colors.primary : 'white'};
  color: ${props => props.active ? 'white' : props.theme.colors.gray700};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.gray50};
    transform: translateY(-1px);
  }
`;

const PostsSection = styled.div`
  padding: 20px 0;
`;

const PostsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const PostWrapper = styled.div`
  padding: 0 30px 20px;
  
  &:last-child {
    padding-bottom: 30px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 30px;
  color: ${props => props.theme.colors.gray600};
  
  .icon {
    font-size: 3rem;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  h3 {
    margin-bottom: 10px;
    color: ${props => props.theme.colors.gray700};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 15px;
  margin: 20px 30px;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: 8px;
  background: white;
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray50};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const UserPostsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState('all'); // all, recent, popular
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Load user profile
  const loadUserProfile = async () => {
    try {
      const response = await userService.getUserProfile(id);
      
      if (response.success) {
        setUser(response.user);
      } else {
        console.error('❌ Failed to load user profile:', response.error);
        navigate('/feed');
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      navigate('/feed');
    }
  };

  // Load user posts
  const loadUserPosts = async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      console.log(`📝 Loading posts for user ${id}, page ${pageNum}`);
      
      // Get all posts and filter for this user
      // Note: In a real app, you'd have a specific endpoint for user posts
      const response = await postService.getFeed(pageNum, 20);
      const userPosts = response.posts.filter(post => post.author.id === parseInt(id));
      
      if (reset || pageNum === 1) {
        setPosts(userPosts);
      } else {
        setPosts(prev => [...prev, ...userPosts]);
      }
      
      // Check if there are more posts (simplified logic)
      setHasMore(userPosts.length === 20);
      setPage(pageNum);
      
      console.log(`✅ Loaded ${userPosts.length} posts for user ${id}`);
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      if (page === 1) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Apply filters
  const applyFilter = (filterType) => {
    setFilter(filterType);
    
    let filtered = [...posts];
    
    switch (filterType) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count));
        break;
      default:
        // 'all' - keep original order
        break;
    }
    
    setFilteredPosts(filtered);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await Promise.all([
      loadUserProfile(),
      loadUserPosts(1, true)
    ]);
    setRefreshing(false);
  };

  // Handle load more
  const handleLoadMore = async () => {
    if (!loadingMore && hasMore) {
      await loadUserPosts(page + 1);
    }
  };

  // Handle post interactions
  const handlePostUpdate = () => {
    // Refresh posts when a post is updated (liked, commented, etc.)
    loadUserPosts(1, true);
  };

  // Load data on component mount
  useEffect(() => {
    Promise.all([
      loadUserProfile(),
      loadUserPosts(1, true)
    ]);
  }, [id]);

  // Apply filter when posts change
  useEffect(() => {
    applyFilter(filter);
  }, [posts]);

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <EmptyState>
          <div className="icon">👤</div>
          <h3>User not found</h3>
          <p>The user you're looking for doesn't exist.</p>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <HeaderTop>
          <BackButton onClick={() => navigate(`/user/${id}`)}>
            <ArrowLeft size={20} />
          </BackButton>
          
          <HeaderInfo>
            <h1>Posts</h1>
            <div className="subtitle">{user.full_name || user.username}</div>
          </HeaderInfo>
          
          <RefreshButton 
            onClick={handleRefresh}
            disabled={refreshing}
            className={refreshing ? 'spinning' : ''}
          >
            <RefreshCw size={16} />
          </RefreshButton>
        </HeaderTop>
        
        <StatsRow>
          <div className="stat">
            <FileText size={20} />
            <div className="number">{posts.length}</div>
            <div className="label">Posts</div>
          </div>
          
          {posts.length > 0 && (
            <div className="stat">
              <TrendingUp size={20} />
              <div className="number">
                {posts.reduce((sum, post) => sum + (post.likes_count || 0), 0)}
              </div>
              <div className="label">Total Likes</div>
            </div>
          )}
        </StatsRow>
      </PageHeader>

      <FilterSection>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => applyFilter('all')}
        >
          All Posts
        </FilterButton>
        
        <FilterButton 
          active={filter === 'recent'} 
          onClick={() => applyFilter('recent')}
        >
          <Calendar size={14} style={{ marginRight: '6px' }} />
          Recent
        </FilterButton>
        
        <FilterButton 
          active={filter === 'popular'} 
          onClick={() => applyFilter('popular')}
        >
          <TrendingUp size={14} style={{ marginRight: '6px' }} />
          Popular
        </FilterButton>
      </FilterSection>

      <PostsSection>
        {filteredPosts.length === 0 ? (
          <EmptyState>
            <div className="icon">📝</div>
            <h3>No posts yet</h3>
            <p>
              {user.full_name || user.username} hasn't shared any posts yet.
            </p>
          </EmptyState>
        ) : (
          <>
            <PostsList>
              {filteredPosts.map(post => (
                <PostWrapper key={post.id}>
                  <PostCard 
                    post={post}
                    onUpdate={handlePostUpdate}
                    onLike={handlePostUpdate}
                    onComment={handlePostUpdate}
                    onShare={handlePostUpdate}
                    onBookmark={handlePostUpdate}
                  />
                </PostWrapper>
              ))}
            </PostsList>
            
            {hasMore && (
              <LoadMoreButton
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <RefreshCw size={16} className="spinning" style={{ marginRight: '8px' }} />
                    Loading more posts...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </LoadMoreButton>
            )}
          </>
        )}
      </PostsSection>
    </PageContainer>
  );
};

export default UserPostsPage;