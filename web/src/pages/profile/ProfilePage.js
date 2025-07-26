// web/src/pages/profile/ProfilePage.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { 
  Edit, 
  Mail, 
  Calendar, 
  Users, 
  FileText, 
  Stethoscope,
  GraduationCap
} from 'lucide-react';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const ProfileHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
`;

const ProfileTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 25px;
  margin-bottom: 25px;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 2.5rem;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
`;

const ProfileInfo = styled.div`
  flex: 1;
  
  .name {
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 8px;
  }
  
  .username {
    font-size: 1.1rem;
    color: ${props => props.theme.colors.gray600};
    margin-bottom: 12px;
  }
  
  .bio {
    font-size: 1rem;
    color: ${props => props.theme.colors.gray700};
    line-height: 1.6;
    margin-bottom: 15px;
  }
`;

const UserTypeBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${props => {
    if (props.type === 'doctor') return props.theme.colors.primary;
    if (props.type === 'student') return props.theme.colors.success;
    return props.theme.colors.gray400;
  }};
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 15px;
`;

const ProfileDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: ${props => props.theme.colors.gray700};
  
  .icon {
    color: ${props => props.theme.colors.primary};
  }
  
  .label {
    font-weight: 600;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  margin-top: 25px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 20px;
  background: ${props => props.theme.colors.gray50};
  border-radius: 10px;
  
  .number {
    font-size: 1.8rem;
    font-weight: bold;
    color: ${props => props.theme.colors.primary};
    margin-bottom: 5px;
  }
  
  .label {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 25px;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    justify-content: center;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? props.theme.colors.primary : 'white'};
  color: ${props => props.primary ? 'white' : props.theme.colors.primary};
  border: 2px solid ${props => props.theme.colors.primary};
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.primary ? props.theme.colors.primaryDark : props.theme.colors.primary};
    color: white;
  }
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
`;

const ContentTabs = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  border-bottom: 2px solid ${props => props.theme.colors.gray200};
`;

const ContentTab = styled.button`
  background: none;
  border: none;
  padding: 12px 0;
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

const ProfilePage = () => {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('posts');

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (!user) {
    return (
      <ProfileContainer>
        <div>Loading profile...</div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <ProfileTop>
          <Avatar>
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              getInitials(user.full_name || user.username)
            )}
          </Avatar>
          
          <ProfileInfo>
            <div className="name">{user.full_name || user.username}</div>
            <div className="username">@{user.username}</div>
            
            <UserTypeBadge type={user.user_type}>
              {user.user_type === 'doctor' && <Stethoscope size={16} />}
              {user.user_type === 'student' && <GraduationCap size={16} />}
              {user.user_type === 'doctor' ? 'Medical Doctor' : 'Medical Student'}
            </UserTypeBadge>
            
            {user.bio && <div className="bio">{user.bio}</div>}
            
            <ProfileDetails>
              <DetailItem>
                <Mail size={16} className="icon" />
                <span>{user.email}</span>
              </DetailItem>
              
              {user.specialty && (
                <DetailItem>
                  <Stethoscope size={16} className="icon" />
                  <span className="label">Specialty:</span>
                  <span>{user.specialty}</span>
                </DetailItem>
              )}
              
              {user.college && (
                <DetailItem>
                  <GraduationCap size={16} className="icon" />
                  <span className="label">College:</span>
                  <span>{user.college}</span>
                </DetailItem>
              )}
              
              <DetailItem>
                <Calendar size={16} className="icon" />
                <span>Joined {formatJoinDate(user.created_at)}</span>
              </DetailItem>
            </ProfileDetails>
          </ProfileInfo>
        </ProfileTop>

        <StatsSection>
          <StatCard>
            <div className="number">{user.posts_count || 0}</div>
            <div className="label">Posts</div>
          </StatCard>
          <StatCard>
            <div className="number">{user.followers_count || 0}</div>
            <div className="label">Followers</div>
          </StatCard>
          <StatCard>
            <div className="number">{user.following_count || 0}</div>
            <div className="label">Following</div>
          </StatCard>
          <StatCard>
            <div className="number">
              {user.user_type === 'doctor' ? 'MD' : 'Student'}
            </div>
            <div className="label">Role</div>
          </StatCard>
        </StatsSection>

        <ActionButtons>
          <ActionButton primary>
            <Edit size={16} />
            Edit Profile
          </ActionButton>
          <ActionButton>
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
            My Posts
          </ContentTab>
          <ContentTab 
            active={activeTab === 'likes'} 
            onClick={() => setActiveTab('likes')}
          >
            Liked Posts
          </ContentTab>
          <ContentTab 
            active={activeTab === 'saved'} 
            onClick={() => setActiveTab('saved')}
          >
            Saved
          </ContentTab>
        </ContentTabs>

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
      </ContentSection>
    </ProfileContainer>
  );
};

export default ProfilePage;