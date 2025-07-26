// web/src/components/layout/Navbar.js
/**
 * Enhanced Navbar with notification system integration
 * Features: Search, notifications, user menu, mobile responsiveness
 * FIXED: Import issues and auth slice integration
 */

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Home,
  TrendingUp,
  Bookmark,
  MessageCircle
} from 'lucide-react';

import NotificationBadge from '../notifications/NotificationBadge';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { logoutUser } from '../../store/slices/authSlice'; // FIXED: Changed from logout to logoutUser
import { resetSearch } from '../../store/slices/postSlice';

const NavbarContainer = styled.nav`
  background: white;
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Logo = styled(Link)`
  font-size: 24px;
  font-weight: 800;
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    color: ${props => props.theme.colors.primaryDark};
  }
`;

const NavCenter = styled.div`
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: 24px;
  background: ${props => props.theme.colors.gray50};
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    background: white;
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.gray500};
  z-index: 1;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.primary};
  }
  
  @media (max-width: 768px) {
    display: ${props => props.hideOnMobile ? 'none' : 'flex'};
  }
`;

const CreateButton = styled(Link)`
  background: ${props => props.theme.colors.primary};
  color: white;
  padding: 10px 20px;
  border-radius: 24px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${props => props.theme.colors.primary}40;
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    span {
      display: none;
    }
  }
`;

const UserMenuContainer = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 24px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.gray800};
  font-size: 14px;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 220px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid ${props => props.theme.colors.gray200};
  z-index: 1000;
  overflow: hidden;
  margin-top: 8px;
`;

const UserDropdownItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.theme.colors.gray700};
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray50};
    color: ${props => props.theme.colors.primary};
  }
  
  &.danger {
    color: ${props => props.theme.colors.danger};
    
    &:hover {
      background: ${props => props.theme.colors.danger}10;
    }
  }
`;

const MobileMenu = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileSearchOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.show ? 'block' : 'none'};
`;

const MobileSearchContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
  z-index: 1000;
  display: ${props => props.show ? 'block' : 'none'};
`;

const NotificationContainer = styled.div`
  position: relative;
`;

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  const userMenuRef = useRef(null);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  };

  // Handle logout - FIXED: Using correct action name
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    
    // Navigate based on notification type
    if (notification.data) {
      const data = notification.data;
      if (data.post_id) {
        navigate(`/post/${data.post_id}`);
      } else if (data.user_id) {
        navigate(`/user/${data.user_id}`);
      }
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <NavbarContainer>
        <NavLeft>
          <Logo to="/feed">
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #0066CC, #3385DB)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '800',
              fontSize: '16px'
            }}>
              IAP
            </div>
            <span>Connect</span>
          </Logo>
        </NavLeft>

        <NavCenter>
          <SearchContainer>
            <form onSubmit={handleSearch}>
              <SearchIcon size={18} />
              <SearchInput
                type="text"
                placeholder="Search posts, users, medical topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </SearchContainer>
        </NavCenter>

        <NavRight>
          {/* Mobile search button */}
          <MobileMenu>
            <NavButton onClick={() => setShowMobileSearch(true)}>
              <Search size={20} />
            </NavButton>
          </MobileMenu>

          {/* Create post button */}
          <CreateButton to="/create-post">
            <Plus size={18} />
            <span>Create</span>
          </CreateButton>

          {/* Navigation buttons */}
          <NavButton 
            as={Link} 
            to="/feed" 
            hideOnMobile
            title="Home Feed"
          >
            <Home size={20} />
          </NavButton>

          <NavButton 
            as={Link} 
            to="/trending" 
            hideOnMobile
            title="Trending Posts"
          >
            <TrendingUp size={20} />
          </NavButton>

          <NavButton 
            as={Link} 
            to="/bookmarks" 
            hideOnMobile
            title="Saved Posts"
          >
            <Bookmark size={20} />
          </NavButton>

          {/* Notifications */}
          <NotificationContainer>
            <NotificationBadge 
              onClick={() => setShowNotifications(!showNotifications)}
            />
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onNotificationClick={handleNotificationClick}
            />
          </NotificationContainer>

          {/* User menu */}
          <UserMenuContainer ref={userMenuRef}>
            <UserButton onClick={() => setShowUserMenu(!showUserMenu)}>
              <UserAvatar>
                {user?.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt={user.full_name} />
                ) : (
                  user?.full_name?.charAt(0) || 'U'
                )}
              </UserAvatar>
              <UserName>{user?.full_name}</UserName>
            </UserButton>

            {showUserMenu && (
              <UserDropdown>
                <UserDropdownItem 
                  as={Link} 
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User size={16} />
                  Profile
                </UserDropdownItem>
                
                <UserDropdownItem 
                  as={Link} 
                  to="/bookmarks"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Bookmark size={16} />
                  Saved Posts
                </UserDropdownItem>
                
                <UserDropdownItem 
                  as={Link} 
                  to="/messages"
                  onClick={() => setShowUserMenu(false)}
                >
                  <MessageCircle size={16} />
                  Messages
                </UserDropdownItem>
                
                <UserDropdownItem 
                  as={Link} 
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings size={16} />
                  Settings
                </UserDropdownItem>
                
                {user?.user_type === 'admin' && (
                  <UserDropdownItem 
                    as={Link} 
                    to="/admin"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={16} />
                    Admin Dashboard
                  </UserDropdownItem>
                )}
                
                <UserDropdownItem 
                  className="danger"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Sign out
                </UserDropdownItem>
              </UserDropdown>
            )}
          </UserMenuContainer>
        </NavRight>
      </NavbarContainer>

      {/* Mobile search overlay */}
      <MobileSearchOverlay 
        show={showMobileSearch}
        onClick={() => setShowMobileSearch(false)}
      />
      
      <MobileSearchContainer show={showMobileSearch}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <form onSubmit={handleSearch}>
              <SearchIcon size={18} />
              <SearchInput
                type="text"
                placeholder="Search posts, users, medical topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </form>
          </div>
          <button
            onClick={() => setShowMobileSearch(false)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>
      </MobileSearchContainer>
    </>
  );
};

export default Navbar;