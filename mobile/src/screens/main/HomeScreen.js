import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl,
  Alert,
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { colors } from '../../utils/constants';
import api from '../../services/api';

// Post Card Component
const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    // TODO: API call for like/unlike
  };

  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {post.author?.full_name?.charAt(0) || 'A'}
          </Text>
        </View>
        <View style={styles.postInfo}>
          <Text style={styles.authorName}>
            {post.author?.full_name || 'Admin'}
          </Text>
          <Text style={styles.userType}>
            {post.author?.user_type || 'ADMIN'}
          </Text>
          <Text style={styles.postTime}>
            {new Date(post.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Post Content */}
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <View style={styles.hashtagContainer}>
          {post.hashtags.map((tag, index) => (
            <Text key={index} style={styles.hashtag}>
              {tag}
            </Text>
          ))}
        </View>
      )}

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={[styles.actionButton, liked && styles.likedButton]}
          onPress={handleLike}
        >
          <Text style={[styles.actionText, liked && styles.likedText]}>
            ❤️ {likesCount}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>
            💬 {post.comments_count || 0}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>
            🔄 {post.shares_count || 0}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = useSelector(state => state.auth.user);

  const fetchPosts = async () => {
    try {
      console.log('🚀 Fetching posts from feed...');
      const response = await api.get('/posts/feed');
      console.log('✅ Posts fetched:', response.data);
      
      // Handle different response structures
      const postsData = response.data.posts || response.data || [];
      setPosts(postsData);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      Alert,
  TouchableOpacity.alert('Error', 'Failed to load posts');
      
      // Fallback to sample data for testing
      setPosts([
        {
          id: 1,
          content: "Welcome to IAP Connect! 🎉 This is our first post on this amazing platform for medical professionals.",
          hashtags: ["#IAPConnect", "#MedicalCommunity", "#Welcome"],
          likes_count: 5,
          comments_count: 2,
          shares_count: 1,
          created_at: new Date().toISOString(),
          author: {
            full_name: "System Administrator",
            user_type: "ADMIN"
          }
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const renderPost = ({ item }) => <PostCard post={item} />;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>IAP Connect</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {user?.full_name || 'User'}!
        </Text>
      </View>

      {/* Posts Feed */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share something!</Text>
          </View>
        }
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
    backgroundColor: colors.primary,
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
  },
  feedContainer: {
    padding: 16,
  },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  postInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 2,
  },
  userType: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  postTime: {
    fontSize: 12,
    color: colors.gray500,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray800,
    marginBottom: 12,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  hashtag: {
    color: colors.primary,
    fontSize: 14,
    marginRight: 8,
    marginBottom: 4,
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '500',
  },
  likedButton: {
    backgroundColor: colors.accent + '20',
    borderRadius: 8,
  },
  likedText: {
    color: colors.accent,
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
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray600,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray500,
  },
});
