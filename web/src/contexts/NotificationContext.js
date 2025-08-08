// web/src/contexts/NotificationContext.js
/**
 * Notification Context for global notification state management
 * Handles real-time notification updates and badge count
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      
      console.log('🔔 Fetching notifications...');
      const response = await notificationService.getNotifications(1, 20);
      
      setNotifications(response.notifications || []);
      setUnreadCount(response.unread_count || 0);
      setLastFetch(new Date());
      
      console.log(`✅ Fetched ${response.notifications?.length || 0} notifications, ${response.unread_count || 0} unread`);
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      // Don't clear existing data on error
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Fetch unread count only (lighter API call)
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      const newCount = response.unread_count || response.count || 0;
      
      // Only update if count changed
      if (newCount !== unreadCount) {
        setUnreadCount(newCount);
        console.log(`🔢 Unread count updated: ${newCount}`);
      }
    } catch (error) {
      console.error('❌ Failed to fetch unread count:', error);
    }
  }, [unreadCount]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
      
      // Decrease unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      console.log(`✅ Marked notification ${notificationId} as read`);
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
      
      console.log('✅ Marked all notifications as read');
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
    }
  }, []);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    console.log('🆕 New notification added:', notification.title);
  }, []);

  // Refresh notifications (force fetch)
  const refreshNotifications = useCallback(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  // Enhanced polling - check every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Refresh when page becomes visible (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible - refreshing notifications');
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchUnreadCount]);

  const value = {
    // State
    notifications,
    unreadCount,
    loading,
    lastFetch,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;