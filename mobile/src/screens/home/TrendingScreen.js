// screens/home/TrendingScreen.js
/**
 * TrendingScreen - Display trending posts and hashtags
 * Features: Trending posts, popular hashtags, trending users
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import PostCard from '../../components/posts/PostCard';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { fetchTrendingPosts } from '../../store/slices/postSlice';
import { colors, typography, spacing } from '../../styles';

const TrendingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { 
    trendingPosts, 
    loading, 
    error 
  } = useSelector(state => state.posts);

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // posts, hashtags, users

  // Mock data for hashtags and users (in real app, fetch from API)
  const trendingHashtags = [
    { tag: '#cardiology', posts: 245, growth: '+12%' },
    { tag: '#surgery', posts: 189, growth: '+8%' },
    { tag: '#pediatrics', posts: 167, growth: '+15%' },
    { tag: '#neurology', posts: 143, growth: '+6%' },
    { tag: '#radiology', posts: 134, growth: '+10%' },
    { tag: '#oncology', posts: 129, growth: '+5%' },
  ];

  const trendingUsers = [
    {
      id: 1,
      full_name: 'Dr. Sarah Johnson',
      user_type: 'doctor',
      specialty: 'Cardiology',
      followers: 1234,
      profile_picture_url: null,
    },
    {
      id: 2,
      full_name: 'Medical Student Alex',
      user_type: 'student',
      college: 'AIIMS Delhi',
      followers: 567,
      profile_picture_url: null,
    },
    {
      id: 3,
      full_name: 'Dr. Raj Patel',
      user_type: 'doctor',
      specialty: 'Surgery',
      followers: 890,
      profile_picture_url: null,
    },
  ];

  // Load trending posts
  useEffect(() => {
    if (activeTab === 'posts' && trendingPosts.length === 0) {
      dispatch(fetchTrendingPosts());
    }
  }, [dispatch, activeTab, trendingPosts.length]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (activeTab === 'posts') {
        await dispatch(fetchTrendingPosts()).unwrap();
      }
      // Refresh other tabs data here
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh trending content');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, activeTab]);

  // Handle post interactions
  const handleLike = useCallback((postId) => {
    navigation.navigate('PostDetail', { postId });
  }, [navigation]);

  const handleComment = useCallback((postId) => {
    navigation.navigate('PostDetail', { postId, openComments: true });
  }, [navigation]);

  const handleShare = useCallback((post) => {
    Alert.alert('Share', `Share ${post.user.full_name}'s post`);
  }, []);

  const handleUserPress = useCallback((userId) => {
    navigation.navigate('Profile', { userId });
  }, [navigation]);

  const handleHashtagPress = useCallback((hashtag) => {
    navigation.navigate('Search', { query: hashtag });
  }, [navigation]);

  // Render tab buttons
  const renderTabButtons = () => (
    <View style={styles.tabContainer}>
      {[
        { key: 'posts', title: 'Posts', icon: 'trending-up' },
        { key: 'hashtags', title: 'Hashtags', icon: 'hash' },
        { key: 'users', title: 'Users', icon: 'users' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            activeTab === tab.key && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab(tab.key)}
        >
          <Icon
            name={tab.icon}
            size={18}
            color={activeTab === tab.key ? colors.white : colors.gray600}
          />
          <Text style={[
            styles.tabText,
            activeTab === tab.key && styles.tabTextActive,
          ]}>
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render trending posts
  const renderTrendingPosts = () => {
    if (loading && trendingPosts.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading trending posts...</Text>
        </View>
      );
    }

    if (trendingPosts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="trending-up" size={48} color={colors.gray400} />
          <Text style={styles.emptyTitle}>No trending posts yet</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for popular content
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {trendingPosts.map((post, index) => (
          <View key={post.id} style={styles.postContainer}>
            <View style={styles.trendingBadge}>
              <Icon name="trending-up" size={14} color={colors.accent} />
              <Text style={styles.trendingText}>#{index + 1} Trending</Text>
            </View>
            <PostCard
              post={post}
              onLike={() => handleLike(post.id)}
              onComment={() => handleComment(post.id)}
              onShare={() => handleShare(post)}
              onUserPress={() => handleUserPress(post.user.id)}
            />
          </View>
        ))}
      </ScrollView>
    );
  };

  // Render trending hashtags
  const renderTrendingHashtags = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.hashtagsContainer}>
        {trendingHashtags.map((item, index) => (
          <TouchableOpacity
            key={item.tag}
            style={styles.hashtagCard}
            onPress={() => handleHashtagPress(item.tag)}
          >
            <View style={styles.hashtagHeader}>
              <View style={styles.hashtagRank}>
                <Text style={styles.rankNumber}>#{index + 1}</Text>
              </View>
              <View style={styles.hashtagInfo}>
                <Text style={styles.hashtagTitle}>{item.tag}</Text>
                <Text style={styles.hashtagStats}>
                  {item.posts} posts • {item.growth}
                </Text>
              </View>
              <View style={styles.growthIndicator}>
                <Icon name="trending-up" size={16} color={colors.success} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // Render trending users
  const renderTrendingUsers = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.usersContainer}>
        {trendingUsers.map((user, index) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userCard}
            onPress={() => handleUserPress(user.id)}
          >
            <View style={styles.userRank}>
              <Text style={styles.rankNumber}>#{index + 1}</Text>
            </View>
            
            <Avatar
              uri={user.profile_picture_url}
              name={user.full_name}
              size={50}
            />
            
            <View style={styles.userInfo}>
              <Text style={styles.userFullName}>{user.full_name}</Text>
              <Text style={styles.userSpecialty}>
                {user.user_type === 'doctor' 
                  ? `👨‍⚕️ ${user.specialty}` 
                  : `👨‍🎓 ${user.college}`
                }
              </Text>
              <Text style={styles.userFollowers}>
                {user.followers} followers
              </Text>
            </View>
            
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'posts':
        return renderTrendingPosts();
      case 'hashtags':
        return renderTrendingHashtags();
      case 'users':
        return renderTrendingUsers();
      default:
        return renderTrendingPosts();
    }
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trending</Text>
          <Text style={styles.headerSubtitle}>
            Discover what's popular in the medical community
          </Text>
        </View>

        {/* Tab Navigation */}
        {renderTabButtons()}

        {/* Content */}
        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.gray600,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    marginHorizontal: spacing.xs,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.caption,
    color: colors.gray600,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.caption,
    color: colors.gray600,
    marginTop: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.gray700,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 24,
  },
  postContainer: {
    marginBottom: spacing.sm,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginLeft: spacing.sm,
    marginBottom: spacing.xs,
  },
  trendingText: {
    ...typography.small,
    color: colors.accent,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  hashtagsContainer: {
    padding: spacing.md,
  },
  hashtagCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  hashtagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hashtagRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  rankNumber: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  hashtagInfo: {
    flex: 1,
  },
  hashtagTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  hashtagStats: {
    ...typography.small,
    color: colors.gray600,
  },
  growthIndicator: {
    padding: spacing.xs,
  },
  usersContainer: {
    padding: spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  userFullName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  userSpecialty: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: 2,
  },
  userFollowers: {
    ...typography.small,
    color: colors.gray600,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  followButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
});

export default TrendingScreen;