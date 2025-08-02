// web/src/components/layout/Sidebar.js - DOCTORS ONLY VERSION
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
  Bookmark,
  TrendingUp,
  Stethoscope,
  // GraduationCap, // COMMENTED OUT - For students
  FileText,
  MessageSquare,
  Calendar,
  Library
} from 'lucide-react';

// Styled Components (keeping all existing styles)
const SidebarContainer = styled.aside`
  width: 280px;
  background: white;
  border-right: 1px solid ${props => props.theme.colors.gray200};
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 70px;
    
    .nav-text {
      display: none;
    }
    
    .logo-text {
      display: none;
    }
  }
`;

const LogoSection = styled.div`
  padding: 1.5rem 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 0.5rem;
    color: white;
    flex-shrink: 0;
  }
  
  .logo-text {
    .title {
      font-size: 1.125rem;
      font-weight: 700;
      color: ${props => props.theme.colors.gray900};
      margin: 0;
    }
    
    .subtitle {
      font-size: 0.75rem;
      color: ${props => props.theme.colors.gray600};
      margin: 0;
    }
  }
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 1rem 0;
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.colors.gray500};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 1rem;
  margin-bottom: 0.75rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  margin: 0.25rem 0;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: ${props => props.active ? props.theme.colors.blue600 : props.theme.colors.gray700};
  text-decoration: none;
  border-radius: 0;
  margin: 0 0.5rem;
  border-radius: 0.5rem;
  background: ${props => props.active ? props.theme.colors.blue50 : 'transparent'};
  font-weight: ${props => props.active ? '600' : '500'};
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.blue50 : props.theme.colors.gray100};
    color: ${props => props.active ? props.theme.colors.blue600 : props.theme.colors.gray900};
  }
  
  .nav-icon {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .nav-text {
    font-size: 0.875rem;
  }
  
  .nav-badge {
    margin-left: auto;
    background: ${props => props.theme.colors.red500};
    color: white;
    font-size: 0.7rem;
    padding: 0.125rem 0.375rem;
    border-radius: 0.75rem;
    font-weight: 600;
    min-width: 1.25rem;
    text-align: center;
  }
`;

const UserSection = styled.div`
  padding: 1rem;
  border-top: 1px solid ${props => props.theme.colors.gray200};
  margin-top: auto;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: ${props => props.theme.colors.gray50};
  
  .user-avatar {
    width: 2.5rem;
    height: 2.5rem;
    background: ${props => props.theme.colors.blue500};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .user-info {
    flex: 1;
    min-width: 0;
    
    .user-name {
      font-weight: 600;
      color: ${props => props.theme.colors.gray900};
      font-size: 0.875rem;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .user-type {
      font-size: 0.75rem;
      color: ${props => props.theme.colors.gray600};
      margin: 0;
    }
  }
  
  @media (max-width: 768px) {
    .user-info {
      display: none;
    }
  }
`;

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector(state => state.auth);

  // Check if current route is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'DR';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // UPDATED - Doctor-focused navigation items
  const navigationItems = [
    // Main Navigation
    {
      section: 'Main',
      items: [
        {
          path: '/feed',
          icon: <Home className="nav-icon" />,
          text: 'Home Feed',
          badge: null
        },
        {
          path: '/trending',
          icon: <TrendingUp className="nav-icon" />,
          text: 'Trending',
          badge: null
        },
        {
          path: '/search',
          icon: <Search className="nav-icon" />,
          text: 'Search',
          badge: null
        }
      ]
    },
    
    // Professional Features - UPDATED for doctors
    {
      section: 'Professional',
      items: [
        {
          path: '/cases',
          icon: <FileText className="nav-icon" />,
          text: 'Clinical Cases',
          badge: null
        },
        {
          path: '/knowledge',
          icon: <Library className="nav-icon" />,
          text: 'Medical Knowledge',
          badge: null
        },
        {
          path: '/discussions',
          icon: <MessageSquare className="nav-icon" />,
          text: 'Discussions',
          badge: null
        },
        {
          path: '/conferences',
          icon: <Calendar className="nav-icon" />,
          text: 'Medical Events',
          badge: null
        }
      ]
    },
    
    // Social Features
    {
      section: 'Community',
      items: [
        {
          path: '/connections',
          icon: <Users className="nav-icon" />,
          text: 'My Network',
          badge: null
        },
        {
          path: '/create',
          icon: <PlusCircle className="nav-icon" />,
          text: 'Create Post',
          badge: null
        },
        {
          path: '/bookmarks',
          icon: <Bookmark className="nav-icon" />,
          text: 'Saved Posts',
          badge: null
        }
      ]
    },

    // COMMENTED OUT - Student-specific features (for future use)
    /*
    {
      section: 'Learning', // Only for students
      items: [
        {
          path: '/study-groups',
          icon: <GraduationCap className="nav-icon" />,
          text: 'Study Groups',
          badge: null,
          userTypes: ['student']
        },
        {
          path: '/exams',
          icon: <FileText className="nav-icon" />,
          text: 'Practice Exams',
          badge: null,
          userTypes: ['student']
        },
        {
          path: '/mentorship',
          icon: <Users className="nav-icon" />,
          text: 'Find Mentors',
          badge: null,
          userTypes: ['student']
        }
      ]
    },
    */
    
    // Account & Settings
    {
      section: 'Account',
      items: [
        {
          path: '/profile',
          icon: <User className="nav-icon" />,
          text: 'My Profile',
          badge: null
        },
        {
          path: '/settings',
          icon: <Settings className="nav-icon" />,
          text: 'Settings',
          badge: null
        }
      ]
    }
  ];

  // COMMENTED OUT - Admin section (for future use)
  /*
  // Add admin section if user is admin
  if (user?.user_type === 'admin') {
    navigationItems.push({
      section: 'Administration',
      items: [
        {
          path: '/admin',
          icon: <Shield className="nav-icon" />,
          text: 'Admin Dashboard',
          badge: null
        }
      ]
    });
  }
  */

  // Filter items based on user type (currently all users are doctors)
  const getFilteredItems = (items) => {
    return items.filter(item => {
      // If no userTypes specified, show to all users
      if (!item.userTypes) return true;
      
      // Show only if user type matches
      return item.userTypes.includes(user?.user_type);
    });
  };

  return (
    <SidebarContainer>
      {/* Logo Section */}
      <LogoSection>
        <div className="logo-icon">
          <Heart size={20} />
        </div>
        <div className="logo-text">
          <h1 className="title">IAP Connect</h1>
          <p className="subtitle">Medical Professionals</p>
        </div>
      </LogoSection>

      {/* Navigation */}
      <Navigation>
        {navigationItems.map((section, index) => (
          <NavSection key={index}>
            <SectionTitle>{section.section}</SectionTitle>
            <NavList>
              {getFilteredItems(section.items).map((item, itemIndex) => (
                <NavItem key={itemIndex}>
                  <NavLink 
                    to={item.path} 
                    active={isActive(item.path)}
                  >
                    {item.icon}
                    <span className="nav-text">{item.text}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                  </NavLink>
                </NavItem>
              ))}
            </NavList>
          </NavSection>
        ))}
      </Navigation>

      {/* User Section */}
      <UserSection>
        <UserProfile>
          <div className="user-avatar">
            {user?.profile_picture_url ? (
              <img 
                src={user.profile_picture_url} 
                alt={user.full_name}
                style={{ width: '100%', height: '100%', borderRadius: '50%' }}
              />
            ) : (
              <span>{getUserInitials(user?.full_name)}</span>
            )}
          </div>
          <div className="user-info">
            <div className="user-name">
              {user?.full_name || 'Medical Professional'}
            </div>
            <div className="user-type">
              {/* UPDATED - Always show as Medical Professional */}
              {user?.specialty || 'Medical Professional'}
              {/* COMMENTED OUT - User type display logic
              {user?.user_type === 'doctor' && (user?.specialty || 'Doctor')}
              {user?.user_type === 'student' && (user?.college || 'Medical Student')}
              {user?.user_type === 'admin' && 'Administrator'}
              */}
            </div>
          </div>
        </UserProfile>
      </UserSection>
    </SidebarContainer>
  );
};

export default Sidebar;