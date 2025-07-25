// screens/bookmarks/BookmarksScreen.js - User's Saved Posts
/**
 * BookmarksScreen - Display user's saved/bookmarked posts
 * Features: List saved posts, unsave functionality, navigation to post detail
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';

// Enhanced PostCard Component for Bookmarks
import PostCard from '../../components/posts/PostCard';

// Color constants
const colors = {
  primary: '#0066CC',
  white: '#FFFFFF',
  gray100: '#F8F9FA',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
};

export default function BookmarksScreen({ navigation }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useSelector(state => state.auth.user);

  // Load bookmarked posts
  const loadBookmarks = async () => {
    try {
      console.log('📚 Fetching bookmarked posts...');
      const response = await api.get('/posts/bookmarks');
      console.log('✅ Bookmarks fetched:', response.data);
      
      // Extract posts from bookmark objects
      const posts = response.data.bookmarks.map(bookmark => ({
        ...bookmark.post,
        is_bookmarked: true // Ensure all posts show as bookmarked
      }));
      
      setBookmarks(posts);
    } catch (error) {
      console.error('❌ Error fetching bookmarks:', error);
      Alert.alert('Error', 'Failed to load saved posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookmarks();
    setRefreshing(false);
  };

  // Handle like
  const handleLike = async (postId, liked) => {
    console.log(`💖 ${liked ? 'Liked' : 'Unliked'} post: ${postId}`);
    // Update local state
    setBookmarks(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, is_liked: liked, likes_count: liked ? post.likes_count + 1 : post.likes_count - 1 }
        : post
    ));
  };

  // Handle comment navigation
  const handleComment = (postId) => {
    console.log('🏃‍♂️ Navigating to PostDetail for comments...');
    navigation.navigate('PostDetail', { 
      postId: postId,
      openComments: true 
    });
  };

  // Handle share
  const handleShare = (postId) => {
    console.log('📤 Sharing post:', postId);
  };

  // Handle unsave (remove from bookmarks)
  const handleUnsave = (postId) => {
    console.log('🗑️ Removing post from bookmarks:', postId);
    // Remove from local state immediately for better UX
    setBookmarks(prev => prev.filter(post => post.id !== postId));
  };

  // Handle user press
  const handleUserPress = (userId) => {
    console.log('👤 Navigating to user profile:', userId);
    // navigation.navigate('UserProfile', { userId });
  };

  // Handle post press (navigate to detail)
  const handlePostPress = (postId) => {
    console.log('📖 Opening post detail:', postId);
    navigation.navigate('PostDetail', { postId });
  };

  // Handle hashtag press
  const handleHashtagPress = (hashtag, postId) => {
    console.log(`🏷️ Clicked hashtag ${hashtag} in post ${postId}`);
    // navigation.navigate('HashtagFeed', { hashtag });
  };

  // Render item
  const renderItem = ({ item }) => (
    <PostCard 
      post={item}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
      onUserPress={handleUserPress}
      onPostPress={handlePostPress}
      onHashtagPress={handleHashtagPress}
      onUnsave={handleUnsave} // NEW: Unsave callback
      currentUserId={user?.id}
    />
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="bookmark" size={64} color={colors.gray400} />
      <Text style={styles.emptyStateTitle}>No Saved Posts</Text>
      <Text style={styles.emptyStateSubtitle}>
        Posts you save will appear here
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.exploreButtonText}>Explore Posts</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={colors.gray700} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Posts</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading saved posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Posts</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Bookmarks List */}
      <FlatList
        data={bookmarks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={[
          styles.postsContainer,
          bookmarks.length === 0 && styles.emptyContainer
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  headerSpacer: {
    width: 40,
  },
  postsContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray600,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray700,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});