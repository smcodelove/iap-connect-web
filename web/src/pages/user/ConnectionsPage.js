// web/src/pages/user/ConnectionsPage.js
/**
 * ConnectionsPage - Overview of current user's connections
 * Shows followers and following with quick navigation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  Users, 
  UserPlus, 
  Heart,
  ArrowRight,
  Search,
  RefreshCw
} from 'lucide-react';

import userService from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  color: white;
  padding: 40px;
  text-align: center;
`;

const HeaderTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0 0 10px 0;
`;

const HeaderSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  padding: 40px;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.gray50};
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  border: 1px solid ${props => props.theme.colors.gray200};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.theme.colors.primary};
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 20px;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.gray800};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const StatLabel = styled.div`
  font-size: 1.1rem;
  color: ${props => props.theme.colors.gray600};
  margin-bottom: 15px;
`;

const StatDescription = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.gray500};
  margin-bottom: 20px;
  line-height: 1.4;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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

const QuickActionsSection = styled.div`
  padding: 30px 40px;
  border-top: 1px solid ${props => props.theme.colors.gray200};
  background: ${props => props.theme.colors.gray25};
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.gray800};
  margin-bottom: 20px;
  text-align: center;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
`;

const ActionCard = styled.button`
  background: white;
  border: 1px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .icon {
    margin-bottom: 12px;
    color: ${props => props.theme.colors.primary};
  }
  
  .title {
    font-weight: 600;
    color: ${props => props.theme.colors.gray800};
    margin-bottom: 4px;
  }
  
  .description {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
`;

const ConnectionsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const [stats, setStats] = useState({
    followers_count: 0,
    following_count: 0,
    posts_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load user stats
  const loadStats = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading connection stats');
      
      const response = await userService.getMyProfile();
      
      if (response.success) {
        setStats({
          followers_count: response.user.followers_count || 0,
          following_count: response.user.following_count || 0,
          posts_count: response.user.posts_count || 0
        });
        
        console.log('✅ Stats loaded:', response.user);
      } else {
        console.error('❌ Failed to load stats:', response.error);
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  // Navigation handlers
  const handleViewFollowers = () => {
    navigate(`/user/${user.id}/followers`);
  };

  const handleViewFollowing = () => {
    navigate(`/user/${user.id}/following`);
  };

  const handleViewPosts = () => {
    navigate(`/user/${user.id}/posts`);
  };

  const handleSearchUsers = () => {
    navigate('/search');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  // Load stats on mount
  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner text="Loading connections..." />
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <HeaderTitle>
          My Connections
          <RefreshButton 
            onClick={handleRefresh}
            disabled={refreshing}
            className={refreshing ? 'spinning' : ''}
            style={{ marginLeft: '15px' }}
          >
            <RefreshCw size={20} />
          </RefreshButton>
        </HeaderTitle>
        <HeaderSubtitle>
          Manage your network and discover new connections
        </HeaderSubtitle>
      </PageHeader>

      <StatsSection>
        <StatCard onClick={handleViewFollowers}>
          <StatIcon>
            <Heart size={24} />
          </StatIcon>
          <StatNumber>
            {stats.followers_count}
          </StatNumber>
          <StatLabel>Followers</StatLabel>
          <StatDescription>
            People who follow your updates and posts
          </StatDescription>
          <ViewButton>
            View Followers
            <ArrowRight size={16} />
          </ViewButton>
        </StatCard>

        <StatCard onClick={handleViewFollowing}>
          <StatIcon>
            <UserPlus size={24} />
          </StatIcon>
          <StatNumber>
            {stats.following_count}
          </StatNumber>
          <StatLabel>Following</StatLabel>
          <StatDescription>
            Medical professionals and students you follow
          </StatDescription>
          <ViewButton>
            View Following
            <ArrowRight size={16} />
          </ViewButton>
        </StatCard>

        <StatCard onClick={handleViewPosts}>
          <StatIcon>
            <Users size={24} />
          </StatIcon>
          <StatNumber>
            {stats.posts_count}
          </StatNumber>
          <StatLabel>Posts</StatLabel>
          <StatDescription>
            Your contributions to the medical community
          </StatDescription>
          <ViewButton>
            View Posts
            <ArrowRight size={16} />
          </ViewButton>
        </StatCard>
      </StatsSection>

      <QuickActionsSection>
        <SectionTitle>Quick Actions</SectionTitle>
        <ActionGrid>
          <ActionCard onClick={handleSearchUsers}>
            <div className="icon">
              <Search size={24} />
            </div>
            <div className="title">Find Users</div>
            <div className="description">
              Search for doctors and medical students
            </div>
          </ActionCard>

          <ActionCard onClick={handleViewProfile}>
            <div className="icon">
              <Users size={24} />
            </div>
            <div className="title">My Profile</div>
            <div className="description">
              View and edit your profile information
            </div>
          </ActionCard>

          <ActionCard onClick={() => navigate('/feed')}>
            <div className="icon">
              <Heart size={24} />
            </div>
            <div className="title">Activity Feed</div>
            <div className="description">
              See updates from people you follow
            </div>
          </ActionCard>
        </ActionGrid>
      </QuickActionsSection>
    </PageContainer>
  );
};

export default ConnectionsPage;