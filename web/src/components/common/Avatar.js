// src/components/common/Avatar.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { User, Camera, Upload } from 'lucide-react';

const AvatarContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const AvatarImage = styled.div`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: ${props => props.shape === 'square' ? '8px' : '50%'};
  background: ${props => props.bgColor || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  transition: all 0.2s ease;
  border: ${props => props.bordered ? `3px solid ${props.theme.colors.white}` : 'none'};
  box-shadow: ${props => props.shadow ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none'};
  
  &:hover {
    transform: ${props => props.clickable ? 'scale(1.05)' : 'none'};
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: inherit;
  }
`;

const AvatarText = styled.span`
  color: white;
  font-weight: 600;
  font-size: ${props => props.size * 0.4}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: ${props => props.size > 60 ? '8%' : '10%'};
  right: ${props => props.size > 60 ? '8%' : '10%'};
  width: ${props => Math.max(8, props.size * 0.2)}px;
  height: ${props => Math.max(8, props.size * 0.2)}px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'online': return props.theme.colors.success;
      case 'away': return props.theme.colors.warning;
      case 'busy': return props.theme.colors.danger;
      default: return props.theme.colors.gray400;
    }
  }};
  border: 2px solid white;
  z-index: 2;
`;

const UploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
  }
  
  svg {
    color: white;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const Badge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  background: ${props => props.color || props.theme.colors.danger};
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  border: 2px solid white;
  z-index: 3;
`;

const UserTypeIcon = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: ${props => Math.max(16, props.size * 0.25)}px;
  height: ${props => Math.max(16, props.size * 0.25)}px;
  border-radius: 50%;
  background: ${props => {
    switch (props.userType) {
      case 'doctor': return props.theme.colors.primary;
      case 'student': return props.theme.colors.accent;
      case 'admin': return props.theme.colors.warning;
      default: return props.theme.colors.gray500;
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  font-size: ${props => Math.max(8, props.size * 0.12)}px;
  z-index: 2;
`;

const Avatar = ({
  src,
  alt,
  name,
  size = 40,
  shape = 'circle', // 'circle' | 'square'
  status, // 'online' | 'away' | 'busy' | 'offline'
  userType, // 'doctor' | 'student' | 'admin'
  bgColor,
  clickable = false,
  editable = false,
  bordered = false,
  shadow = false,
  badge,
  badgeColor,
  className,
  style,
  onClick,
  onImageUpload,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return <User size={size * 0.5} />;
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2);
    }
    return words[0][0] + words[words.length - 1][0];
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  // Get user type emoji
  const getUserTypeEmoji = (type) => {
    switch (type) {
      case 'doctor': return '👨‍⚕️';
      case 'student': return '🎓';
      case 'admin': return '⚙️';
      default: return '👤';
    }
  };

  return (
    <AvatarContainer 
      className={className}
      style={style}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      {...props}
    >
      <AvatarImage
        size={size}
        shape={shape}
        bgColor={bgColor}
        clickable={clickable}
        bordered={bordered}
        shadow={shadow}
        onClick={handleClick}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            onError={() => setImageError(true)}
          />
        ) : (
          <AvatarText size={size}>
            {getInitials(name)}
          </AvatarText>
        )}
        
        {/* Upload overlay for editable avatars */}
        {editable && (
          <>
            <UploadOverlay>
              <Camera size={size * 0.3} />
            </UploadOverlay>
            <FileInput
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              id={`avatar-upload-${Math.random()}`}
            />
          </>
        )}
      </AvatarImage>

      {/* Status indicator */}
      {status && (
        <StatusIndicator
          size={size}
          status={status}
        />
      )}

      {/* User type indicator */}
      {userType && (
        <UserTypeIcon
          size={size}
          userType={userType}
        >
          {getUserTypeEmoji(userType)}
        </UserTypeIcon>
      )}

      {/* Badge */}
      {badge && (
        <Badge color={badgeColor}>
          {badge}
        </Badge>
      )}
    </AvatarContainer>
  );
};

// Avatar Group Component
const AvatarGroupContainer = styled.div`
  display: flex;
  align-items: center;
  
  ${AvatarContainer} {
    margin-left: ${props => -props.overlap || -8}px;
    border: 2px solid white;
    z-index: ${props => props.total - props.index};
    
    &:first-child {
      margin-left: 0;
    }
    
    &:hover {
      z-index: 999;
    }
  }
`;

const MoreIndicator = styled.div`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  border-radius: 50%;
  background: ${props => props.theme.colors.gray600};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.size * 0.3}px;
  font-weight: 600;
  margin-left: ${props => -props.overlap || -8}px;
  border: 2px solid white;
  z-index: 0;
`;

export const AvatarGroup = ({ 
  avatars = [], 
  size = 40, 
  max = 3, 
  overlap = 8,
  ...props 
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <AvatarGroupContainer overlap={overlap} total={visibleAvatars.length} {...props}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.id || index}
          src={avatar.src}
          name={avatar.name}
          size={size}
          userType={avatar.userType}
          status={avatar.status}
          index={index}
          {...avatar}
        />
      ))}
      
      {remainingCount > 0 && (
        <MoreIndicator size={size} overlap={overlap}>
          +{remainingCount}
        </MoreIndicator>
      )}
    </AvatarGroupContainer>
  );
};

export default Avatar;