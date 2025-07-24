// screens/home/TrendingScreen.js - Complete Trending Screen
/**
 * TrendingScreen - Display trending posts and hashtags
 * Features: Algorithm-based trending posts, trending hashtags, time filters
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
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import PostCard from '../../components/posts/PostCard';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getTrendingPosts } from '../../store/slices/postSlice';
import api from '../../services/api';

// Color constants
const colors = {
  primary: '#0066CC',
  primaryLight: '#3385DB',
  accent: '#FF6B35',
  success: '#28A745',
  danger: '#DC3545',
  white: '#FFFFFF',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
};

const TrendingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { 
    trending: trendingPosts, 
    loading, 
    error 
  } = useSelector(state => state.posts);

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // posts, hashtags, users
  const [timeFilter, setTimeFilter] = useState('24h'); // 24h, 72h, 7d
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [loadingHashtags, setLoadingHashtags] = useState(false);

  // Mock trending users data
  const trendingUsers = [
    {
      id: 1,
      full_name: 'Dr. Sarah Johnson',
      user_type: 'doctor',
      specialty: 'Cardiology',
      followers: 1234,
      trending_score: 95.5,
      profile_picture_url: null,
    },
    {
      id: 2,
      full_name: 'Medical Student Alex',
      user_type: 'student',
      college: 'AIIMS Delhi',
      followers: 567,
      trending_score: 89.2,
      profile_picture_url: null,
    },
    {
      id: 3,
      full_name: 'Dr. Raj Patel',
      user_type: 'doctor',
      specialty: 'Surgery',
      followers: 890,
      trending_score: 87.8,
      profile_picture_url: null,
    },
  ];

  // Load trending posts
  useEffect(() => {
    loadTrendingContent();
  }, [activeTab, timeFilter]);

  // Load trending content based on active tab
  const loadTrendingContent = useCallback(async () => {
    try {
      if (activeTab === 'posts') {
        const hoursWindow = timeFilter === '24h' ? 24 : timeFilter === '72h' ? 72 : 168;
        await dispatch(getTrendingPosts({ 
          page: 1, 
          refresh: true,
          hours_window: hoursWindow 
        })).unwrap();
      } else if (activeTab === 'hashtags') {
        await loadTrendingHashtags();
      }
    } catch (error) {
      console.error('Failed to load trending content:', error);
    }
  }, [dispatch, activeTab, timeFilter]);

  // Load trending hashtags
  const loadTrendingHashtags = async () => {
    try {
      setLoadingHashtags(true);
      const response = await api.get('/posts/trending/hashtags?limit=15');
      setTrendingHashtags(response.data.trending_hashtags || []);
    } catch (error) {
      console.error('Failed to load trending hashtags:', error);
      Alert.alert('Error', 'Failed to load trending hashtags');
    } finally {
      setLoadingHashtags(false);
    }
  };

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTrendingContent();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh trending content');
    } finally {
      setRefreshing(false);
    }
  }, [loadTrendingContent]);

  // Handle post interactions
  const handleLike = useCallback((postId, liked) => {
    console.log(`Post ${postId} ${liked ? 'liked' : 'unliked'}`);
    // TODO: Implement like functionality
  }, []);

  const handleComment = useCallback((postId) => {
    navigation.navigate('PostDetail', { postId, openComments: true });
  }, [navigation]);

  const handleShare = useCallback((post) => {
    Alert.alert('Share', `Share ${post.author.full_name}'s post`);
  }, []);

  const handleUserPress = useCallback((userId) => {
    navigation.navigate('Profile', { userId });
  }, [navigation]);

  const handleHashtagPress = useCallback((hashtag) => {
    navigation.navigate('Search', { query: hashtag, type: 'hashtag' });
  }, [navigation]);

  // Render header with filters
  const renderHeader = () => (
    <View style={styles.header}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTitleContainer}>
            <Icon name="trending-up" size={28} color={colors.white} />
            <Text style={styles.headerTitle}>Trending</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            What's hot in the medical community
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

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
          <Text
            style={[
              styles.tabButtonText,
              activeTab === tab.key && styles.tabButtonTextActive,
            ]}
          >
            {tab.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render time filter (only for posts)
  const renderTimeFilter = () => {
    if (activeTab !== 'posts') return null;

    return (
      <View style={styles.timeFilterContainer}>
        <Text style={styles.filterLabel}>Time Range:</Text>
        {[
          { key: '24h', title: '24 Hours' },
          { key: '72h', title: '3 Days' },
          { key: '7d', title: '7 Days' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.timeFilterButton,
              timeFilter === filter.key && styles.timeFilterButtonActive,
            ]}
            onPress={() => setTimeFilter(filter.key)}
          >
            <Text
              style={[
                styles.timeFilterText,
                timeFilter === filter.key && styles.timeFilterTextActive,
              ]}
            >
              {filter.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render trending posts
  const renderTrendingPosts = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading trending posts...</Text>
        </View>
      );
    }

    if (trendingPosts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="trending-up" size={48} color={colors.gray400} />
          <Text style={styles.emptyTitle}>No Trending Posts</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for trending content in the medical community
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={trendingPosts}
        renderItem={({ item, index }) => (
          <View style={styles.trendingPostContainer}>
            <View style={styles.trendingRank}>
              <Text style={styles.trendingRankNumber}>#{index + 1}</Text>
              <View style={styles.trendingIndicator}>
                <Icon name="zap" size={16} color={colors.accent} />
                <Text style={styles.trendingScore}>
                  {item.trending_score || Math.floor(Math.random() * 100)}
                </Text>
              </View>
            </View>
            <View style={styles.postCardContainer}>
              <PostCard
                post={item}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                onUserPress={handleUserPress}
                onHashtagPress={handleHashtagPress}
              />
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />
    );
  };

  // Render trending hashtags
  const renderTrendingHashtags = () => {
    if (loadingHashtags) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading trending hashtags...</Text>
        </View>
      );
    }

    if (trendingHashtags.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="hash" size={48} color={colors.gray400} />
          <Text style={styles.emptyTitle}>No Trending Hashtags</Text>
          <Text style={styles.emptySubtitle}>
            Popular hashtags will appear here
          </Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.hashtagsContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {trendingHashtags.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.hashtagCard}
            onPress={() => handleHashtagPress(item.hashtag)}
          >
            <View style={styles.hashtagRank}>
              <Text style={styles.hashtagRankNumber}>#{index + 1}</Text>
            </View>
            
            <View style={styles.hashtagContent}>
              <View style={styles.hashtagHeader}>
                <Text style={styles.hashtagText}>{item.hashtag}</Text>
                <View style={styles.hashtagGrowth}>
                  <Icon name="trending-up" size={14} color={colors.success} />
                  <Text style={styles.hashtagGrowthText}>{item.growth}</Text>
                </View>
              </View>
              
              <View style={styles.hashtagStats}>
                <View style={styles.hashtagStat}>
                  <Icon name="file-text" size={16} color={colors.gray500} />
                  <Text style={styles.hashtagStatText}>
                    {item.posts_count} posts
                  </Text>
                </View>
                <View style={styles.hashtagStat}>
                  <Icon name="heart" size={16} color={colors.gray500} />
                  <Text style={styles.hashtagStatText}>
                    {item.total_engagement} engagements
                  </Text>
                </View>
              </View>
            </View>
            
            <Icon name="chevron-right" size={20} color={colors.gray400} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Render trending users
  const renderTrendingUsers = () => (
    <ScrollView 
      style={styles.usersContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {trendingUsers.map((user, index) => (
        <TouchableOpacity
          key={user.id}
          style={styles.userCard}
          onPress={() => handleUserPress(user.id)}
        >
          <View style={styles.userRank}>
            <Text style={styles.userRankNumber}>#{index + 1}</Text>
          </View>
          
          <Avatar 
            size={50}
            uri={user.profile_picture_url}
            name={user.full_name}
          />
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.full_name}</Text>
            <Text style={styles.userType}>
              {user.user_type === 'doctor' 
                ? `Dr. • ${user.specialty}` 
                : `Student • ${user.college}`
              }
            </Text>
            <View style={styles.userStats}>
              <Text style={styles.userFollowers}>
                {user.followers} followers
              </Text>
              <View style={styles.userTrendingScore}>
                <Icon name="zap" size={14} color={colors.accent} />
                <Text style={styles.userScoreText}>{user.trending_score}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
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
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabButtons()}
      {renderTimeFilter()}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  header: {
    marginBottom: 0,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    flex: 1,
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: colors.gray600,
    marginLeft: 6,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: colors.white,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  filterLabel: {
    fontSize: 14,
    color: colors.gray700,
    fontWeight: '500',
    marginRight: 12,
  },
  timeFilterButton: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  timeFilterButtonActive: {
    backgroundColor: colors.primary,
  },
  timeFilterText: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: '500',
  },
  timeFilterTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray600,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray700,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
  trendingPostContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginBottom: 12,
    shadowColor: colors.gray900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  trendingRank: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
    backgroundColor: colors.primary,
  },
  trendingRankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  trendingIndicator: {
    alignItems: 'center',
  },
  trendingScore: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
    marginTop: 4,
  },
  postCardContainer: {
    flex: 1,
  },
  hashtagsContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  hashtagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  hashtagRank: {
    width: 40,
    alignItems: 'center',
  },
  hashtagRankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  hashtagContent: {
    flex: 1,
    marginLeft: 16,
  },
  hashtagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  hashtagText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  hashtagGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hashtagGrowthText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
    marginLeft: 4,
  },
  hashtagStats: {
    flexDirection: 'row',
  },
  hashtagStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  hashtagStatText: {
    fontSize: 14,
    color: colors.gray600,
    marginLeft: 4,
  },
  usersContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  userRank: {
    width: 40,
    alignItems: 'center',
  },
  userRankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  userType: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 6,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userFollowers: {
    fontSize: 12,
    color: colors.gray600,
    marginRight: 12,
  },
  userTrendingScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userScoreText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
    marginLeft: 4,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
});

export default TrendingScreen;