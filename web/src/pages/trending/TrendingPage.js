// web/src/pages/trending/TrendingPage.js - ENHANCED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { 
  TrendingUp, 
  Hash, 
  Users, 
  Flame, 
  Clock,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  RefreshCw,
  ExternalLink,
  BarChart3,
  Target,
  Award
} from 'lucide-react';
import { fetchTrendingPosts } from '../../store/slices/postSlice';
import { postService } from '../../services/api';
import PostCard from '../../components/posts/PostCard';

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
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
    animation: pulse 3s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
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
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.gray100};
    color: ${props => props.active ? 'white' : props.theme.colors.primary};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: ${props => props.theme.colors.primary};
    border-radius: 2px;
    transition: width 0.3s ease;
    display: ${props => props.active ? 'block' : 'none'};
    width: ${props => props.active ? '60%' : '0'};
  }
`;

const RefreshButton = styled.button`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background: ${props => props.theme.colors.gray100};
  border: 1px solid ${props => props.theme.colors.gray300};
  color: ${props => props.theme.colors.gray600};
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primary};
    color: white;
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.6;
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
  min-height: 400px;
  overflow: hidden;
`;

const PostsList = styled.div`
  display: grid;
  gap: 20px;
`;

const TrendingPostCard = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const TrendingRank = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: ${props => {
    if (props.rank <= 3) return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'; // Gold for top 3
    if (props.rank <= 5) return 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)'; // Silver for 4-5
    return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)'; // Bronze for others
  }};
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const TrendingIndicator = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: ${props => props.theme.colors.success};
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
  animation: pulse-glow 2s ease-in-out infinite;
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 5px rgba(40, 167, 69, 0.5); }
    50% { box-shadow: 0 0 20px rgba(40, 167, 69, 0.8); }
  }
`;

const HashtagsList = styled.div`
  display: grid;
  gap: 12px;
  padding: 20px;
`;

const HashtagCard = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: ${props => props.theme.colors.gray50};
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.gray200};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, ${props => props.theme.colors.primary}10 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    background: ${props => props.theme.colors.primary}10;
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
    
    &::before {
      opacity: 1;
    }
  }
`;

const HashtagRank = styled.div`
  background: ${props => props.theme.colors.primary};
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  margin-right: 16px;
  position: relative;
  z-index: 1;
`;

const HashtagContent = styled.div`
  flex: 1;
  position: relative;
  z-index: 1;
  
  .hashtag-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${props => props.theme.colors.gray800};
    margin-bottom: 4px;
  }
  
  .hashtag-stats {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.gray600};
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const HashtagGrowth = styled.span`
  background: ${props => props.positive ? props.theme.colors.success : props.theme.colors.danger};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: auto;
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${props => props.theme.colors.gray200};
    border-top: 3px solid ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }
  
  .loading-text {
    color: ${props => props.theme.colors.gray600};
    font-weight: 500;
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
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    opacity: 0.3;
  }
  
  h3 {
    margin-bottom: 10px;
    color: ${props => props.theme.colors.gray700};
    font-size: 1.5rem;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.danger};
  
  .icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    opacity: 0.5;
  }
  
  h3 {
    margin-bottom: 10px;
    color: ${props => props.theme.colors.danger};
  }
  
  button {
    margin-top: 20px;
    background: ${props => props.theme.colors.danger};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${props => props.theme.colors.danger}dd;
      transform: translateY(-1px);
    }
  }
`;

const TrendingPage = () => {
  const { user } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('posts');
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [trendingError, setTrendingError] = useState(null);
  const [hashtags, setHashtags] = useState([]);
  const [hashtagsLoading, setHashtagsLoading] = useState(false);
  const [hashtagsError, setHashtagsError] = useState(null);

  // Fetch trending posts
  useEffect(() => {
    if (activeTab === 'posts') {
      fetchTrendingPostsDirectly();
    }
  }, [activeTab]);

  const fetchTrendingPostsDirectly = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setTrendingError(null);
      
      console.log('🔥 Fetching trending posts...');
      const response = await postService.getTrendingPosts(1, 20, 72);
      
      console.log('✅ Trending posts fetched successfully:', response);
      setTrendingPosts(response.posts || []);
      
    } catch (error) {
      console.error('❌ Error fetching trending posts:', error);
      setTrendingError(error.message);
      setTrendingPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch trending hashtags
  useEffect(() => {
    if (activeTab === 'hashtags') {
      fetchHashtags();
    }
  }, [activeTab]);

  const fetchHashtags = async () => {
    try {
      setHashtagsLoading(true);
      setHashtagsError(null);
      
      // Enhanced mock hashtag data with better metrics
      const mockHashtags = [
        { rank: 1, hashtag: '#MedicalEducation', posts: 245, engagement: 1200, growth: '+12%', positive: true },
        { rank: 2, hashtag: '#Surgery', posts: 189, engagement: 950, growth: '+8%', positive: true },
        { rank: 3, hashtag: '#Cardiology', posts: 167, engagement: 890, growth: '+15%', positive: true },
        { rank: 4, hashtag: '#Neurology', posts: 143, engagement: 720, growth: '+6%', positive: true },
        { rank: 5, hashtag: '#Pediatrics', posts: 134, engagement: 680, growth: '+10%', positive: true },
        { rank: 6, hashtag: '#Radiology', posts: 128, engagement: 650, growth: '+9%', positive: true },
        { rank: 7, hashtag: '#Pathology', posts: 121, engagement: 620, growth: '-2%', positive: false },
        { rank: 8, hashtag: '#Pharmacy', posts: 115, engagement: 580, growth: '+11%', positive: true },
        { rank: 9, hashtag: '#Nursing', posts: 108, engagement: 540, growth: '+13%', positive: true },
        { rank: 10, hashtag: '#Research', posts: 98, engagement: 490, growth: '+5%', positive: true }
      ];
      
      setHashtags(mockHashtags);
    } catch (error) {
      console.error('❌ Error fetching hashtags:', error);
      setHashtagsError(error.message);
    } finally {
      setHashtagsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'posts') {
      fetchTrendingPostsDirectly(true);
    } else if (activeTab === 'hashtags') {
      fetchHashtags();
    }
  };

  const handleRetry = () => {
    if (activeTab === 'posts') {
      fetchTrendingPostsDirectly();
    } else if (activeTab === 'hashtags') {
      fetchHashtags();
    }
  };

  const handleHashtagClick = (hashtag) => {
    // Navigate to search with hashtag
    window.location.href = `/search?q=${encodeURIComponent(hashtag)}`;
  };

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
          <p>{trendingError}</p>
          <button onClick={handleRetry}>Try Again</button>
        </ErrorState>
      );
    }

    if (!trendingPosts || trendingPosts.length === 0) {
      return (
        <EmptyState>
          <TrendingUp className="icon" />
          <h3>No trending posts yet</h3>
          <p>Check back later for trending content in the medical community.</p>
        </EmptyState>
      );
    }

    return (
      <PostsList>
        {trendingPosts.map((post, index) => (
          <TrendingPostCard key={post.id}>
            <TrendingRank rank={index + 1}>#{index + 1}</TrendingRank>
            <TrendingIndicator>
              <Flame size={14} />
              Hot
            </TrendingIndicator>
            <PostCard 
              post={post}
              showComments={false}
            />
          </TrendingPostCard>
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
          <p>{hashtagsError}</p>
          <button onClick={handleRetry}>Try Again</button>
        </ErrorState>
      );
    }

    if (!hashtags || hashtags.length === 0) {
      return (
        <EmptyState>
          <Hash className="icon" />
          <h3>No trending hashtags yet</h3>
          <p>Hashtags will appear here as they become popular.</p>
        </EmptyState>
      );
    }

    return (
      <HashtagsList>
        {hashtags.map((item) => (
          <HashtagCard 
            key={item.hashtag} 
            onClick={() => handleHashtagClick(item.hashtag)}
          >
            <HashtagRank>{item.rank}</HashtagRank>
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

  const renderUsers = () => {
    return (
      <EmptyState>
        <Users className="icon" />
        <h3>Trending users coming soon</h3>
        <p>This feature will show trending medical professionals and students.</p>
      </EmptyState>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return renderPosts();
      case 'hashtags':
        return renderHashtags();
      case 'users':
        return renderUsers();
      default:
        return renderPosts();
    }
  };

  // Calculate stats
  const totalEngagement = hashtags.reduce((sum, h) => sum + h.engagement, 0);
  const totalPosts = trendingPosts.length;
  const avgGrowth = hashtags.length > 0 ? 
    Math.round(hashtags.reduce((sum, h) => sum + parseInt(h.growth.replace('%', '').replace('+', '')), 0) / hashtags.length) : 0;

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
        
        <StatCard color="#FD7E14">
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-number">{hashtags.length}</div>
          <div className="stat-label">Trending Topics</div>
        </StatCard>
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
        
        <TabButton 
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} />
          Users
        </TabButton>
        
        <RefreshButton 
          onClick={handleRefresh}
          disabled={refreshing}
          refreshing={refreshing}
          title="Refresh trending data"
        >
          <RefreshCw size={16} className="icon" />
        </RefreshButton>
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