// web/src/pages/trending/TrendingPage.js
import React, { useState, useEffect } from 'react';
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
  Bookmark
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

const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 6px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
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
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.gray100};
    color: ${props => props.active ? 'white' : props.theme.colors.primary};
  }
`;

const ContentArea = styled.div`
  background: white;
  border-radius: 12px;
  min-height: 400px;
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
  background: linear-gradient(135deg, ${props => props.theme.colors.accent} 0%, #ff8c00 100%);
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
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
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
  
  &:hover {
    background: ${props => props.theme.colors.primary}10;
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-1px);
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
`;

const HashtagContent = styled.div`
  flex: 1;
  
  .hashtag-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${props => props.theme.colors.gray800};
    margin-bottom: 4px;
  }
  
  .hashtag-stats {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
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
    
    &:hover {
      background: ${props => props.theme.colors.danger}dd;
    }
  }
`;

const TrendingPage = () => {
  const { user } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('posts');
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const fetchTrendingPostsDirectly = async () => {
    try {
      setLoading(true);
      setTrendingError(null);
      
      console.log('🔥 Direct API call for trending posts...');
      const response = await postService.getTrendingPosts(1, 20, 72);
      
      console.log('✅ Trending posts fetched successfully:', response);
      setTrendingPosts(response.posts || []);
      
    } catch (error) {
      console.error('❌ Error fetching trending posts:', error);
      setTrendingError(error.message);
      setTrendingPosts([]);
    } finally {
      setLoading(false);
    }
  };

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
      
      const response = await postService.getTrendingPosts(1, 20, 72);
      
      // Extract hashtags from trending posts and create mock hashtag data
      const mockHashtags = [
        { rank: 1, hashtag: '#MedicalEducation', posts: 245, engagement: 1200, growth: '+12%' },
        { rank: 2, hashtag: '#Surgery', posts: 189, engagement: 950, growth: '+8%' },
        { rank: 3, hashtag: '#Cardiology', posts: 167, engagement: 890, growth: '+15%' },
        { rank: 4, hashtag: '#Neurology', posts: 143, engagement: 720, growth: '+6%' },
        { rank: 5, hashtag: '#Pediatrics', posts: 134, engagement: 680, growth: '+10%' },
        { rank: 6, hashtag: '#Radiology', posts: 128, engagement: 650, growth: '+9%' },
        { rank: 7, hashtag: '#Pathology', posts: 121, engagement: 620, growth: '+7%' },
        { rank: 8, hashtag: '#Pharmacy', posts: 115, engagement: 580, growth: '+11%' },
        { rank: 9, hashtag: '#Nursing', posts: 108, engagement: 540, growth: '+13%' },
        { rank: 10, hashtag: '#Research', posts: 98, engagement: 490, growth: '+5%' }
      ];
      
      setHashtags(mockHashtags);
    } catch (error) {
      console.error('❌ Error fetching hashtags:', error);
      setHashtagsError(error.message);
    } finally {
      setHashtagsLoading(false);
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
          <span style={{ marginLeft: '12px' }}>Loading trending posts...</span>
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
            <TrendingRank>#{index + 1}</TrendingRank>
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
          <span style={{ marginLeft: '12px' }}>Loading trending hashtags...</span>
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
                {item.posts} posts • {item.engagement} engagements • {item.growth}
              </div>
            </HashtagContent>
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
      </TabContainer>

      <ContentArea>
        {renderTabContent()}
      </ContentArea>
    </TrendingContainer>
  );
};

export default TrendingPage;