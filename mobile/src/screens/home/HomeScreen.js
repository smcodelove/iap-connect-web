// screens/home/HomeScreen.js
/**
 * HomeScreen - Main feed displaying posts from followed users
 * Features: Pull to refresh, infinite scroll, trending posts
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
  Text
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

import PostCard from '../../components/posts/PostCard';
import CreatePostButton from '../../components/posts/CreatePostButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { fetchFeed, clearError } from '../../store/slices/postSlice';
import { colors, typography, spacing } from '../../styles';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { 
    feed, 
    loading, 
    error, 
    hasMore,
    page 
  } = useSelector(state => state.posts);
  
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load initial feed
  useFocusEffect(
    useCallback(() => {
      if (feed.length === 0) {
        dispatch(fetchFeed({ page: 1 }));
      }
    }, [dispatch, feed.length])
  );

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchFeed({ page: 1, refresh: true })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh feed');
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Handle load more posts
  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    
    setLoadingMore(true);
    try {
      await dispatch(fetchFeed({ page: page + 1 })).unwrap();
    } catch (error) {
      Alert.alert('Error', 'Failed to load more posts');
    } finally {
      setLoadingMore(false);
    }
  }, [dispatch, loadingMore, hasMore, loading, page]);

  // Handle post interactions
  const handleLike = useCallback((postId) => {
    // Navigate to post detail or handle inline like
    navigation.navigate('PostDetail', { postId });
  }, [navigation]);

  const handleComment = useCallback((postId) => {
    navigation.navigate('PostDetail', { postId, openComments: true });
  }, [navigation]);

  const handleShare = useCallback((post) => {
    // Implement share functionality
    Alert.alert('Share', `Share ${post.user.full_name}'s post`);
  }, []);

  const handleUserPress = useCallback((userId) => {
    navigation.navigate('Profile', { userId });
  }, [navigation]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  // Handle scroll to load more
  const handleScroll = useCallback(({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 20;
    
    if (layoutMeasurement.height + contentOffset.y >= 
        contentSize.height - paddingToBottom) {
      loadMorePosts();
    }
  }, [loadMorePosts]);

  if (loading && feed.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading your feed...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>IAP Connect</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back, {user?.full_name}!
          </Text>
        </View>

        {/* Posts Feed */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onScroll={handleScroll}
          scrollEventThrottle={400}
        >
          {feed.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No posts yet!</Text>
              <Text style={styles.emptySubtitle}>
                Follow some users or create your first post
              </Text>
            </View>
          ) : (
            feed.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onComment={() => handleComment(post.id)}
                onShare={() => handleShare(post)}
                onUserPress={() => handleUserPress(post.user.id)}
                style={styles.postCard}
              />
            ))
          )}

          {/* Load More Indicator */}
          {loadingMore && (
            <View style={styles.loadMoreContainer}>
              <LoadingSpinner size="small" />
              <Text style={styles.loadMoreText}>Loading more posts...</Text>
            </View>
          )}

          {/* End of Feed Indicator */}
          {!hasMore && feed.length > 0 && (
            <View style={styles.endContainer}>
              <Text style={styles.endText}>You're all caught up! 🎉</Text>
            </View>
          )}
        </ScrollView>

        {/* Floating Create Post Button */}
        <CreatePostButton
          onPress={() => navigation.navigate('CreatePost')}
          style={styles.createButton}
        />
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
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.gray600,
  },
  scrollView: {
    flex: 1,
  },
  postCard: {
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray100,
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
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loadMoreText: {
    ...typography.caption,
    color: colors.gray600,
    marginLeft: spacing.sm,
  },
  endContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  endText: {
    ...typography.caption,
    color: colors.gray500,
    fontStyle: 'italic',
  },
  createButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
  },
});

export default HomeScreen;