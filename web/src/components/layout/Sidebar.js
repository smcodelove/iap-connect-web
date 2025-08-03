// web/src/components/layout/Sidebar.js - ORIGINAL WORKING VERSION
import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Home, 
  Users, 
  Search, 
  PlusCircle, 
  User, 
  Settings, 
  Shield,
  Heart,
  TrendingUp
} from 'lucide-react';

const SidebarContainer = styled.div`
  width: 280px;
  background: white;
  border-right: 1px solid ${props => props.theme.colors.gray200};
  height: 100vh;
  padding: 20px;
  position: sticky;
  top: 0;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    width: 70px;
    padding: 20px 10px;
  }
`;

const Logo = styled.div`
  margin-bottom: 40px;
  text-align: center;
  
  h2 {
    color: ${props => props.theme.colors.primary};
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  p {
    color: ${props => props.theme.colors.gray600};
    font-size: 0.9rem;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    h2 { font-size: 1rem; }
    p { display: none; }
  }
`;

const Navigation = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  text-decoration: none;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray600};
  background: ${props => props.active ? `${props.theme.colors.primary}15` : 'transparent'};
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
  }
  
  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
  
  span {
    @media (max-width: ${props => props.theme.breakpoints.tablet}) {
      display: none;
    }
  }
`;

const UserSection = styled.div`
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.colors.gray200};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: ${props => props.theme.colors.gray50};
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    justify-content: center;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  flex-shrink: 0;
`;

const UserDetails = styled.div`
  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    font-size: 0.9rem;
  }
  
  .type {
    font-size: 0.8rem;
    color: ${props => props.theme.colors.gray600};
    text-transform: capitalize;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector(state => state.auth);

  const navigationItems = [
    { path: '/feed', icon: Home, label: 'Feed' },
    { path: '/trending', icon: TrendingUp, label: 'Trending' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/create-post', icon: PlusCircle, label: 'Create Post' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const adminItems = user?.user_type === 'admin' ? [
    { path: '/admin', icon: Shield, label: 'Admin Panel' }
  ] : [];

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  return (
    <SidebarContainer>
      <Logo>
        <h2>IAP Connect</h2>
        <p>Medical Community</p>
      </Logo>

      <Navigation>
        {navigationItems.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            active={location.pathname === item.path}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavItem>
        ))}

        {adminItems.map((item) => (
          <NavItem
            key={item.path}
            to={item.path}
            active={location.pathname === item.path}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavItem>
        ))}
      </Navigation>

      <UserSection>
        <UserInfo>
          <Avatar>
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              getInitials(user?.full_name || user?.username)
            )}
          </Avatar>
          <UserDetails>
            <div className="name">{user?.full_name || user?.username}</div>
            <div className="type">{user?.user_type}</div>
          </UserDetails>
        </UserInfo>
      </UserSection>
    </SidebarContainer>
  );
};

export default Sidebar;