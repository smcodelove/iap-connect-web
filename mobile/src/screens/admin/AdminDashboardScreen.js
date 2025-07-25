// mobile/src/screens/admin/AdminDashboardScreen.js
/**
 * Admin Dashboard Screen for IAP Connect mobile app
 * Provides admin functionalities and platform overview
 * MOBILE VERSION - Optimized for touch and smaller screens
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Modal,
  TextInput
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors, typography } from '../../utils/constants';

const { width: screenWidth } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  
  // State management
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
    loadAdminAlerts();
    if (user?.user_type !== 'admin') {
      Alert.alert('Access Denied', 'Admin privileges required');
      navigation.goBack();
    }
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setError('');
      const response = await adminService.getDashboardStats();
      setDashboardData(response.data);
      
      if (activeTab === 'users') {
        await loadUsers();
      }
    } catch (error) {
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      const response = await adminService.getAllUsers(1, 50, searchQuery);
      setUsers(response.users);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    }
  }, [searchQuery]);

  // Load admin alerts
  const loadAdminAlerts = useCallback(async () => {
    try {
      const response = await adminService.getAdminAlerts();
      setAlerts(response.alerts);
    } catch (error) {
      console.log('Could not load alerts:', error.message);
    }
  }, []);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  // Handle user deletion
  const handleDeleteUser = useCallback(async (userId) => {
    try {
      await adminService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      setDeleteModal(null);
      Alert.alert('Success', 'User deleted successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, []);

  // Handle post deletion
  const handleDeletePost = useCallback(async (postId) => {
    try {
      await adminService.deletePost(postId);
      await loadDashboardData(); // Refresh dashboard
      setDeleteModal(null);
      Alert.alert('Success', 'Post deleted successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }, [loadDashboardData]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (activeTab === 'users') {
      await loadUsers();
    }
    setSearchVisible(false);
  }, [activeTab, loadUsers]);

  // Format numbers for display
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Render stats card
  const renderStatCard = (title, value, color, icon) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <Icon name={icon} size={24} color="white" style={styles.statIcon} />
      <Text style={styles.statNumber}>{formatNumber(value)}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </View>
  );

  // Render alert card
  const renderAlert = (alert, index) => (
    <View key={index} style={[styles.alertCard, { borderLeftColor: 
      alert.type === 'danger' ? colors.danger : 
      alert.type === 'warning' ? colors.warning : colors.primary 
    }]}>
      <View style={styles.alertContent}>
        <Text style={styles.alertMessage}>{alert.message}</Text>
        <Text style={styles.alertValue}>{alert.value}</Text>
        <Text style={styles.alertAction}>{alert.action}</Text>
      </View>
    </View>
  );

  // Render user item
  const renderUserItem = (user) => (
    <View key={user.id} style={styles.userItem}>
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>
            {user.full_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user.full_name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={[styles.userTypeBadge, { backgroundColor: 
            user.user_type === 'doctor' ? colors.primary : 
            user.user_type === 'student' ? colors.accent : colors.warning 
          }]}>
            <Text style={styles.userTypeText}>
              {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
            </Text>
          </View>
        </View>
      </View>
      {user.user_type !== 'admin' && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setDeleteModal({
            type: 'user',
            id: user.id,
            name: user.full_name
          })}
        >
          <Icon name="trash-2" size={16} color={colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );

  // Render top post item
  const renderPostItem = (post) => (
    <View key={post.id} style={styles.postItem}>
      <View style={styles.postContent}>
        <Text style={styles.postText} numberOfLines={2}>
          {post.content}
        </Text>
        <Text style={styles.postAuthor}>by {post.author}</Text>
        <View style={styles.postStats}>
          <Text style={styles.postStat}>👍 {post.likes_count}</Text>
          <Text style={styles.postStat}>💬 {post.comments_count}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => setDeleteModal({
          type: 'post',
          id: post.id,
          name: post.content.substring(0, 30) + '...'
        })}
      >
        <Icon name="trash-2" size={16} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner visible={true} text="Loading Admin Dashboard..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>IAP Connect</Text>
          </View>
          <TouchableOpacity onPress={() => setSearchVisible(true)}>
            <Icon name="search" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Icon name="bar-chart-2" size={16} color={activeTab === 'overview' ? colors.white : colors.gray600} />
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              Overview
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => {
              setActiveTab('users');
              if (!users.length) loadUsers();
            }}
          >
            <Icon name="users" size={16} color={activeTab === 'users' ? colors.white : colors.gray600} />
            <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>
              Users
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'content' && styles.activeTab]}
            onPress={() => setActiveTab('content')}
          >
            <Icon name="file-text" size={16} color={activeTab === 'content' ? colors.white : colors.gray600} />
            <Text style={[styles.tabText, activeTab === 'content' && styles.activeTabText]}>
              Content
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'alerts' && styles.activeTab]}
            onPress={() => setActiveTab('alerts')}
          >
            <Icon name="bell" size={16} color={activeTab === 'alerts' ? colors.white : colors.gray600} />
            <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>
              Alerts {alerts.length > 0 && `(${alerts.length})`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Overview Tab */}
        {activeTab === 'overview' && dashboardData && (
          <View>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {renderStatCard('Total Users', dashboardData.user_stats.total_users, colors.primary, 'users')}
              {renderStatCard('Doctors', dashboardData.user_stats.total_doctors, colors.accent, 'user-plus')}
              {renderStatCard('Students', dashboardData.user_stats.total_students, colors.success, 'book-open')}
              {renderStatCard('Posts', dashboardData.content_stats.total_posts, colors.warning, 'file-text')}
            </View>

            {/* Engagement Metrics */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Engagement Metrics</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Avg Likes per Post:</Text>
                <Text style={styles.metricValue}>{dashboardData.engagement_metrics.avg_likes_per_post}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Avg Comments per Post:</Text>
                <Text style={styles.metricValue}>{dashboardData.engagement_metrics.avg_comments_per_post}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total Engagement:</Text>
                <Text style={styles.metricValue}>
                  {dashboardData.content_stats.total_likes + dashboardData.content_stats.total_comments}
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setActiveTab('users')}
                >
                  <Icon name="users" size={20} color={colors.primary} />
                  <Text style={styles.actionText}>Manage Users</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setActiveTab('content')}
                >
                  <Icon name="shield" size={20} color={colors.accent} />
                  <Text style={styles.actionText}>Moderate Content</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={onRefresh}
                >
                  <Icon name="refresh-cw" size={20} color={colors.success} />
                  <Text style={styles.actionText}>Refresh Data</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Coming Soon', 'Export functionality will be available soon!')}
                >
                  <Icon name="download" size={20} color={colors.warning} />
                  <Text style={styles.actionText}>Export Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>User Management</Text>
              <Text style={styles.cardSubtitle}>{users.length} users</Text>
            </View>
            
            {users.length > 0 ? (
              users.map(renderUserItem)
            ) : (
              <View style={styles.emptyState}>
                <Icon name="users" size={48} color={colors.gray400} />
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            )}
          </View>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && dashboardData && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Content Statistics</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total Posts:</Text>
                <Text style={styles.metricValue}>{dashboardData.content_stats.total_posts}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total Comments:</Text>
                <Text style={styles.metricValue}>{dashboardData.content_stats.total_comments}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total Likes:</Text>
                <Text style={styles.metricValue}>{dashboardData.content_stats.total_likes}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Top Engaging Posts</Text>
              {dashboardData.top_posts && dashboardData.top_posts.length > 0 ? (
                dashboardData.top_posts.map(renderPostItem)
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="file-text" size={48} color={colors.gray400} />
                  <Text style={styles.emptyText}>No posts found</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>System Alerts</Text>
            {alerts.length > 0 ? (
              alerts.map(renderAlert)
            ) : (
              <View style={styles.emptyState}>
                <Icon name="check-circle" size={48} color={colors.success} />
                <Text style={styles.emptyText}>All systems are running smoothly!</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={searchVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSearchVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.searchModal}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchTitle}>Search Users</Text>
              <TouchableOpacity onPress={() => setSearchVisible(false)}>
                <Icon name="x" size={24} color={colors.gray600} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, or username..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            
            <View style={styles.searchActions}>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearch}
              >
                <Text style={styles.searchButtonText}>Search</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.searchButton, styles.clearButton]}
                onPress={() => {
                  setSearchQuery('');
                  handleSearch();
                }}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDeleteModal(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.deleteModal}>
              <Text style={styles.deleteTitle}>
                Confirm {deleteModal.type === 'user' ? 'User' : 'Post'} Deletion
              </Text>
              
              <Text style={styles.deleteMessage}>
                Are you sure you want to delete {deleteModal.type === 'user' ? 'user' : 'post'}:{'\n'}
                <Text style={styles.deleteName}>"{deleteModal.name}"</Text>
              </Text>
              
              <Text style={styles.deleteWarning}>
                This action cannot be undone and will permanently remove all associated data.
              </Text>
              
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setDeleteModal(null)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => {
                    if (deleteModal.type === 'user') {
                      handleDeleteUser(deleteModal.id);
                    } else {
                      handleDeletePost(deleteModal.id);
                    }
                  }}
                >
                  <Text style={styles.confirmText}>
                    Delete {deleteModal.type === 'user' ? 'User' : 'Post'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: colors.white,
    fontSize: 12,
    opacity: 0.8,
  },
  tabContainer: {
    backgroundColor: colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (screenWidth - 60) / 2,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: colors.white,
    fontSize: 12,
    opacity: 0.9,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.gray600,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.gray600,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (screenWidth - 80) / 2,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.gray100,
    marginBottom: 10,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray700,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
  },
  userEmail: {
    fontSize: 12,
    color: colors.gray600,
    marginVertical: 2,
  },
  userTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  userTypeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.gray100,
  },
  postItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  postContent: {
    flex: 1,
    marginRight: 12,
  },
  postText: {
    fontSize: 14,
    color: colors.gray800,
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: 12,
    color: colors.gray600,
    marginBottom: 4,
  },
  postStats: {
    flexDirection: 'row',
  },
  postStat: {
    fontSize: 12,
    color: colors.gray600,
    marginRight: 15,
  },
  alertCard: {
    backgroundColor: colors.gray50,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 4,
  },
  alertValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  alertAction: {
    fontSize: 12,
    color: colors.gray600,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray500,
    marginTop: 12,
  },
  errorContainer: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    color: colors.white,
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: colors.danger,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModal: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    width: screenWidth - 40,
    maxWidth: 400,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray800,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  searchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  searchButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: colors.gray300,
  },
  clearButtonText: {
    color: colors.gray700,
    fontWeight: '600',
  },
  deleteModal: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 25,
    width: screenWidth - 40,
    maxWidth: 400,
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.danger,
    marginBottom: 15,
    textAlign: 'center',
  },
  deleteMessage: {
    fontSize: 14,
    color: colors.gray700,
    textAlign: 'center',
    marginBottom: 10,
  },
  deleteName: {
    fontWeight: 'bold',
    color: colors.gray800,
  },
  deleteWarning: {
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 25,
  },
  deleteActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: colors.gray300,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.gray700,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  confirmText: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;