// web/src/pages/user/UserFollowingPage.js
/**
 * UserFollowingPage - Display list of users that this user follows
 * Features: Real API integration, Follow/Unfollow, Search, Pagination
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  UserPlus, 
  UserCheck,
  Stethoscope,
  GraduationCap,
  Shield,
  RefreshCw
} from 'lucide-react';

import userService from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

const SearchSection = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
`;

const SearchInput = styled.div`
  position: relative;
  
  input {
    width: 100%;
    padding: 12px 16px 12px 48px;
    border: 1px solid ${props => props.theme.colors.gray300};
    border-radius: 8px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
    }
  }
  
  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.gray500};
  }
`;

const UsersSection = styled.div`
  padding: 20px 0;
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserItem = styled.div`
  padding: 20px 30px;
  border-bottom: 1px solid ${props => props.theme.colors.gray100};
  display: flex;
  align-items: center;
  gap: 15px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray50};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserAvatar = styled(Link)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  text-decoration: none;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  overflow: hidden;
  
  &:hover {
    transform: scale(1.05);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled(Link)`
  font-weight: 600;
  color: ${props => props.theme.colors.gray800};
  text-decoration: none;
  font-size: 1rem;
  display: block;
  margin-bottom: 4px;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const UserMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
`;

const UserType = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  background: ${props => 
    props.type === 'doctor' ? '#e3f2fd' : 
    props.type === 'admin' ? '#ffebe6' : '#f3e5f5'};
  color: ${props => 
    props.type === 'doctor' ? '#1976d2' : 
    props.type === 'admin' ? '#d84315' : '#7b1fa2'};
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
`;

const UserStats = styled.div`
  font-size: 13px;
  color: ${props => props.theme.colors.gray600};
  display: flex;
  gap: 15px;
`;

const FollowButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
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

const UserFollowingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState([]);
  const [filteredFollowing, setFilteredFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [followLoading, setFollowLoading] = useState({});

  // Load user profile and following
  const loadData = async () => {
    try {
      setLoading(true);
      console.log(`👥 Loading following for user ${id}`);
      
      // Load user profile and following in parallel
      const [profileResponse, followingResponse] = await Promise.all([
        userService.getUserProfile(id),
        userService.getUserFollowing(id, 1, 100)
      ]);
      
      if (profileResponse.success) {
        setUser(profileResponse.user);
      } else {
        console.error('❌ Failed to load user profile:', profileResponse.error);
        navigate('/feed');
        return;
      }
      
      if (followingResponse.success) {
        setFollowing(followingResponse.following);
        setFilteredFollowing(followingResponse.following);
        console.log(`✅ Loaded ${followingResponse.following.length} following`);
      } else {
        console.error('❌ Failed to load following:', followingResponse.error);
        setFollowing([]);
        setFilteredFollowing([]);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredFollowing(following);
      return;
    }
    
    const filtered = following.filter(user =>
      user.full_name.toLowerCase().includes(query.toLowerCase()) ||
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      (user.specialty && user.specialty.toLowerCase().includes(query.toLowerCase())) ||
      (user.college && user.college.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredFollowing(filtered);
  };

  // Handle follow/unfollow
  const handleFollow = async (userId, isCurrentlyFollowing) => {
    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }));
      
      let response;
      if (isCurrentlyFollowing) {
        response = await userService.unfollowUser(userId);
      } else {
        response = await userService.followUser(userId);
      }
      
      if (response.success) {
        // Update following list
        setFollowing(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, is_following: !isCurrentlyFollowing }
            : user
        ));
        
        setFilteredFollowing(prev => prev.map(user => 
          user.id === userId 
            ? { ...user, is_following: !isCurrentlyFollowing }
            : user
        ));
      }
    } catch (error) {
      console.error('❌ Error toggling follow:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Helper functions
  const getUserInitials = (user) => {
    return (user.full_name || user.username || 'U').split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserTypeIcon = (userType) => {
    switch (userType) {
      case 'doctor':
        return <Stethoscope size={12} />;
      case 'admin':
        return <Shield size={12} />;
      default:
        return <GraduationCap size={12} />;
    }
  };

  const getUserTypeDisplay = (userType) => {
    switch (userType) {
      case 'doctor':
        return 'Doctor';
      case 'admin':
        return 'Admin';
      default:
        return 'Student';
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [id]);

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
            <h1>Following</h1>
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
            <Users size={20} />
            <div className="number">{following.length}</div>
            <div className="label">Following</div>
          </div>
        </StatsRow>
      </PageHeader>

      <SearchSection>
        <SearchInput>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search following..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </SearchInput>
      </SearchSection>

      <UsersSection>
        {filteredFollowing.length === 0 ? (
          <EmptyState>
            <div className="icon">👥</div>
            <h3>
              {searchQuery ? 'No users found' : 'Not following anyone'}
            </h3>
            <p>
              {searchQuery 
                ? 'Try adjusting your search terms.'
                : `${user.full_name} isn't following anyone yet.`
              }
            </p>
          </EmptyState>
        ) : (
          <UsersList>
            {filteredFollowing.map(followedUser => (
              <UserItem key={followedUser.id}>
                <UserAvatar to={`/user/${followedUser.id}`}>
                  {followedUser.profile_picture_url ? (
                    <img 
                      src={followedUser.profile_picture_url} 
                      alt={followedUser.full_name}
                    />
                  ) : (
                    getUserInitials(followedUser)
                  )}
                </UserAvatar>
                
                <UserInfo>
                  <UserName to={`/user/${followedUser.id}`}>
                    {followedUser.full_name || followedUser.username}
                  </UserName>
                  
                  <UserMeta>
                    <UserType type={followedUser.user_type}>
                      {getUserTypeIcon(followedUser.user_type)}
                      {getUserTypeDisplay(followedUser.user_type)}
                    </UserType>
                  </UserMeta>
                  
                  <UserStats>
                    <span>{followedUser.followers_count} followers</span>
                    <span>{followedUser.posts_count} posts</span>
                  </UserStats>
                </UserInfo>
                
                <FollowButton
                  following={followedUser.is_following}
                  onClick={() => handleFollow(followedUser.id, followedUser.is_following)}
                  disabled={followLoading[followedUser.id]}
                >
                  {followedUser.is_following ? (
                    <>
                      <UserCheck size={14} />
                      {followLoading[followedUser.id] ? 'Loading...' : 'Following'}
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      {followLoading[followedUser.id] ? 'Loading...' : 'Follow'}
                    </>
                  )}
                </FollowButton>
              </UserItem>
            ))}
          </UsersList>
        )}
      </UsersSection>
    </PageContainer>
  );
};

export default UserFollowingPage;