// web/src/components/notifications/NotificationBadge.js
/**
 * Notification Badge Component for navbar
 * Shows unread notification count with real-time updates
 * FIXED: Removed duplicate React import and fixed syntax
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Bell, BellRing } from 'lucide-react';
import { notificationService } from '../../services/api';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const NotificationButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.primary};
  }
  
  ${props => props.hasNotifications && css`
    color: ${props.theme.colors.primary};
    animation: ${pulse} 2s infinite;
  `}
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: ${props => props.theme.colors.danger};
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(25%, -25%);
  border: 2px solid white;
  
  ${props => props.count > 99 && css`
    font-size: 8px;
  `}
`;

const NotificationBadge = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      // Set default count on error
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Format count display
  const getCountDisplay = () => {
    if (unreadCount === 0) return null;
    if (unreadCount > 99) return '99+';
    return unreadCount;
  };

  return (
    <NotificationButton
      onClick={onClick}
      hasNotifications={unreadCount > 0}
      title={`${unreadCount} unread notifications`}
    >
      {unreadCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}
      
      {unreadCount > 0 && (
        <Badge count={unreadCount}>
          {getCountDisplay()}
        </Badge>
      )}
    </NotificationButton>
  );
};

export default NotificationBadge;