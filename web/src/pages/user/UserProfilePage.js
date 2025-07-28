// web/src/pages/user/UserProfilePage.js - FIXED SYNTAX ERROR
/**
 * UserProfilePage - View other user's profile
 * Similar to ProfilePage but for viewing other users with follow functionality
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  ArrowLeft,
  Users, 
  Stethoscope, 
  GraduationCap, 
  Mail, 
  Calendar,
  Shield,
  Heart,
  Bookmark,
  MessageCircle,
  UserPlus,
  UserCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

import userService from '../../services/userService';
import { postService } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PostCard from '../../components/posts/PostCard';

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

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
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

const ProfileTop = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
  flex: 1;
  
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
  }
  
  .label {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FollowButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid white;
  border-radius: 8px;
  background: ${props => props.following ? 'rgba(255, 255, 255, 0.2)' : 'white'};
  color: ${props => props.following ? 'white' : props.theme.colors.primary};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.following ? props.theme.colors.danger : props.theme.colors.gray100};
    color: ${props => props.following ? 'white' : props.theme.colors.primary};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid white;
  border-radius: 8px;
  background: transparent;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: white;
    color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
`;

const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector(state => state.auth);
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Load user profile and posts
  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log(`👤 Loading profile for user ${id}`);
      
      // Load user profile
      const profileResponse = await userService.getUserProfile(id);
      
      if (profileResponse.success) {
        setUser(profileResponse.user);
        setFollowing(profileResponse.user.is_following || false);
        
        // Load user posts
        const postsResponse = await postService.getFeed(1, 20);
        const userPosts = postsResponse.posts.filter(post => post.author.id === parseInt(id));
        setPosts(userPosts);
        
        console.log(`✅ Loaded profile for ${profileResponse.user.full_name}`);
      } else {
        console.error('❌ Failed to load user profile:', profileResponse.error);
        navigate('/feed');
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (followLoading) return;
    
    try {
      setFollowLoading(true);
      console.log(`👥 ${following ? 'Unfollowing' : 'Following'} user ${id}`);
      
      let response;
      if (following) {
        response = await userService.unfollowUser(id);
      } else {
        response = await userService.followUser(id);
      }
      
      if (response.success) {
        setFollowing(!following);
        // Update follower count
        setUser(prev => ({
          ...prev,
          followers_count: following ? prev.followers_count - 1 : prev.followers_count + 1
        }));
        
        console.log(`✅ ${following ? 'Unfollowed' : 'Followed'} user successfully`);
      } else {
        console.error('❌ Follow action failed:', response.error);
        alert('Failed to update follow status. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error toggling follow:', error);
      alert('Failed to update follow status. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  // Handle stats navigation
  const handleStatsClick = (type) => {
    switch (type) {
      case 'posts':
        navigate(`/user/${id}/posts`);
        break;
      case 'followers':
        navigate(`/user/${id}/followers`);
        break;
      case 'following':
        navigate(`/user/${id}/following`);
        break;
    }
  };

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

  // Load data on mount
  useEffect(() => {
    if (id) {
      loadUserData();
    }
  }, [id]);

  if (loading) {
    return (
      <ProfileContainer>
        <LoadingContainer>
          <LoadingSpinner text="Loading profile..." />
        </LoadingContainer>
      </ProfileContainer>
    );
  }

  if (!user) {
    return (
      <ProfileContainer>
        <EmptyContent>
          <div className="icon">👤</div>
          <h3>User not found</h3>
          <p>The user you're looking for doesn't exist.</p>
        </EmptyContent>
      </ProfileContainer>
    );
  }

  // Check if viewing own profile
  const isOwnProfile = currentUser && currentUser.id === parseInt(id);

  return (
    <ProfileContainer>
      <ProfileHeader>
        <HeaderTop>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </BackButton>
          
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
        </HeaderTop>

        <StatsSection>
          <StatCard clickable onClick={() => handleStatsClick('posts')}>
            <div className="number">{posts.length}</div>
            <div className="label">Posts</div>
          </StatCard>
          
          <StatCard clickable onClick={() => handleStatsClick('followers')}>
            <div className="number">{user.followers_count || 0}</div>
            <div className="label">Followers</div>
          </StatCard>
          
          <StatCard clickable onClick={() => handleStatsClick('following')}>
            <div className="number">{user.following_count || 0}</div>
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
          {!isOwnProfile && (
            <FollowButton
              following={following}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {following ? <UserCheck size={16} /> : <UserPlus size={16} />}
              {followLoading ? 'Loading...' : following ? 'Following' : 'Follow'}
            </FollowButton>
          )}
          
          <ActionButton onClick={() => navigate(`/user/${id}/followers`)}>
            <Users size={16} />
            View Connections
          </ActionButton>
          
          {isOwnProfile && (
            <ActionButton onClick={() => navigate('/edit-profile')}>
              <Users size={16} />
              Edit Profile
            </ActionButton>
          )}
        </ActionButtons>
      </ProfileHeader>

      <ContentSection>
        <ContentTabs>
          <ContentTab 
            active={activeTab === 'posts'} 
            onClick={() => setActiveTab('posts')}
          >
            Posts ({posts.length})
          </ContentTab>
        </ContentTabs>

        <ContentArea>
          {posts.length === 0 ? (
            <EmptyContent>
              <div className="icon">📝</div>
              <h3>No posts yet</h3>
              <p>
                {user.full_name || user.username} hasn't shared any posts yet.
              </p>
            </EmptyContent>
          ) : (
            <PostGrid>
              {posts.slice(0, 3).map(post => (
                <PostCard 
                  key={post.id}
                  post={post}
                  onUpdate={loadUserData}
                />
              ))}
              {posts.length > 3 && (
                <ViewAllButton onClick={() => handleStatsClick('posts')}>
                  <ExternalLink size={16} />
                  View All {posts.length} Posts
                </ViewAllButton>
              )}
            </PostGrid>
          )}
        </ContentArea>
      </ContentSection>
    </ProfileContainer>
  );
};

export default UserProfilePage;