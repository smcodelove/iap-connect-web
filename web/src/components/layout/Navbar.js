// web/src/components/layout/Navbar.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, Settings, User, Search } from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';

const NavbarContainer = styled.header`
  background: white;
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
  padding: 15px 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 45px 12px 15px;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 25px;
  font-size: 1rem;
  background: ${props => props.theme.colors.gray50};
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.gray400};
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 10px;
  border-radius: 50%;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.primary};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    padding: 8px;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  background: ${props => props.theme.colors.danger};
  border-radius: 50%;
`;

const UserMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const UserMenuButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    gap: 0;
  }
`;

const UserAvatar = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    font-size: 0.9rem;
  }
  
  .role {
    font-size: 0.75rem;
    color: ${props => props.theme.colors.gray600};
    text-transform: capitalize;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid ${props => props.theme.colors.gray200};
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  min-width: 220px;
  z-index: 1000;
  overflow: hidden;
  transform: ${props => props.open ? 'translateY(5px)' : 'translateY(-10px)'};
  opacity: ${props => props.open ? 1 : 0};
  visibility: ${props => props.open ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const DropdownHeader = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
  background: ${props => props.theme.colors.gray50};
  
  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 2px;
  }
  
  .email {
    font-size: 0.85rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  background: none;
  border: none;
  padding: 15px 20px;
  text-align: left;
  color: ${props => props.theme.colors.textPrimary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.theme.colors.gray50};
  }
  
  &.danger {
    color: ${props => props.theme.colors.danger};
    
    &:hover {
      background: #fee;
    }
  }
`;

const WelcomeText = styled.div`
  display: flex;
  flex-direction: column;
  
  .greeting {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
  }
  
  .subtitle {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.gray600};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 8px;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    display: block;
  }
`;

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      navigate('/login');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <NavbarContainer>
      <WelcomeText>
        <div className="greeting">
          {getGreeting()}, {user?.full_name?.split(' ')[0] || user?.username}!
        </div>
        <div className="subtitle">
          Welcome to the medical community
        </div>
      </WelcomeText>

      <SearchContainer>
        <form onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="Search posts, users, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon onClick={handleSearch}>
            <Search size={20} />
          </SearchIcon>
        </form>
      </SearchContainer>

      <NavActions>
        <IconButton onClick={() => navigate('/search')}>
          <Search size={20} />
        </IconButton>

        <IconButton>
          <Bell size={20} />
          <NotificationBadge />
        </IconButton>

        <UserMenu className="user-menu">
          <UserMenuButton onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <UserAvatar>
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.full_name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(user?.full_name || user?.username)
              )}
            </UserAvatar>
            <UserInfo>
              <div className="name">{user?.full_name || user?.username}</div>
              <div className="role">{user?.specialty || user?.college || user?.user_type}</div>
            </UserInfo>
          </UserMenuButton>

          <DropdownMenu open={userMenuOpen}>
            <DropdownHeader>
              <div className="name">{user?.full_name || user?.username}</div>
              <div className="email">{user?.email}</div>
            </DropdownHeader>
            
            <DropdownItem onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}>
              <User size={16} />
              My Profile
            </DropdownItem>
            
            <DropdownItem onClick={() => setUserMenuOpen(false)}>
              <Settings size={16} />
              Settings
            </DropdownItem>
            
            {user?.user_type === 'admin' && (
              <DropdownItem onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}>
                <User size={16} />
                Admin Dashboard
              </DropdownItem>
            )}
            
            <DropdownItem className="danger" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </DropdownItem>
          </DropdownMenu>
        </UserMenu>
      </NavActions>
    </NavbarContainer>
  );
};

export default Navbar;