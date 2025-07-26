// web/src/components/common/FollowButton.js
/**
 * Follow Button Component with animations and real API integration
 * Features: Follow/unfollow functionality, loading states, optimistic updates
 */

import React, { useState, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { UserPlus, UserMinus, UserCheck } from 'lucide-react';
import { userService } from '../../services/api';

// Success animation
const successPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const FollowButtonContainer = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid;
  min-width: 100px;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  ${props => props.following ? css`
    background: ${props.theme.colors.gray100};
    border-color: ${props.theme.colors.gray300};
    color: ${props.theme.colors.gray700};
    
    &:hover {
      background: ${props.theme.colors.danger};
      border-color: ${props.theme.colors.danger};
      color: white;
      transform: translateY(-1px);
    }
  ` : css`
    background: ${props.theme.colors.primary};
    border-color: ${props.theme.colors.primary};
    color: white;
    
    &:hover {
      background: ${props.theme.colors.primaryDark};
      border-color: ${props.theme.colors.primaryDark};
      transform: translateY(-1px);
      box-shadow: 0 4px 12px ${props.theme.colors.primary}40;
    }
  `}
  
  ${props => props.disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  `}
  
  ${props => props.animate && css`
    animation: ${successPulse} 0.4s ease;
  `}
`;

const ButtonText = styled.span`
  transition: all 0.2s ease;
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const FollowButton = ({ 
  userId, 
  initialFollowing = false,
  initialFollowersCount = 0,
  size = 'medium',
  variant = 'default',
  disabled = false,
  onFollowChange
}) => {
  const [following, setFollowing] = useState(initialFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFollow = useCallback(async () => {
    if (disabled || isLoading) return;

    // Optimistic update
    const newFollowing = !following;
    const newCount = newFollowing 
      ? followersCount + 1 
      : Math.max(0, followersCount - 1);
    
    setFollowing(newFollowing);
    setFollowersCount(newCount);
    setIsLoading(true);

    // Trigger success animation for follow action
    if (newFollowing) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 400);
    }

    try {
      let response;
      if (newFollowing) {
        response = await userService.followUser(userId);
      } else {
        response = await userService.unfollowUser(userId);
      }

      if (response.success) {
        // Update with server response if available
        if (response.followersCount !== undefined) {
          setFollowersCount(response.followersCount);
        }
        
        // Notify parent component
        if (onFollowChange) {
          onFollowChange({
            userId,
            following: newFollowing,
            followersCount: response.followersCount || newCount
          });
        }
      } else {
        // Revert optimistic update on failure
        setFollowing(!newFollowing);
        setFollowersCount(following ? followersCount + 1 : Math.max(0, followersCount - 1));
        console.error('Follow action failed');
      }
    } catch (error) {
      // Revert optimistic update on error
      setFollowing(!newFollowing);
      setFollowersCount(following ? followersCount + 1 : Math.max(0, followersCount - 1));
      console.error('Follow action error:', error);
      
      // Show user-friendly error
      if (error.message.includes('yourself')) {
        alert("You can't follow yourself!");
      } else {
        alert('Failed to update follow status. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [following, followersCount, userId, disabled, isLoading, onFollowChange]);

  // Get button content based on state
  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <LoadingSpinner />
          <ButtonText>
            {following ? 'Unfollowing...' : 'Following...'}
          </ButtonText>
        </>
      );
    }

    if (following) {
      return (
        <>
          {isHovered ? (
            <>
              <UserMinus size={16} />
              <ButtonText>Unfollow</ButtonText>
            </>
          ) : (
            <>
              <UserCheck size={16} />
              <ButtonText>Following</ButtonText>
            </>
          )}
        </>
      );
    }

    return (
      <>
        <UserPlus size={16} />
        <ButtonText>Follow</ButtonText>
      </>
    );
  };

  // Size variants
  const sizeStyles = {
    small: { padding: '6px 12px', fontSize: '12px', minWidth: '80px' },
    medium: { padding: '8px 16px', fontSize: '14px', minWidth: '100px' },
    large: { padding: '10px 20px', fontSize: '16px', minWidth: '120px' }
  };

  return (
    <FollowButtonContainer
      onClick={handleFollow}
      following={following}
      disabled={disabled || isLoading}
      animate={isAnimating}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={sizeStyles[size]}
      title={following ? 'Click to unfollow' : 'Click to follow'}
    >
      {getButtonContent()}
    </FollowButtonContainer>
  );
};

export default FollowButton;