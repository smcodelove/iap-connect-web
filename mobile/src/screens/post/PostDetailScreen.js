// screens/post/PostDetailScreen.js - Complete Post Detail with Comments
/**
 * PostDetailScreen - Detailed view of a post with comments
 * Features: Full post display, comments list, add comment, like/unlike
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import PostCard from '../../components/posts/PostCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import { likePost, unlikePost } from '../../store/slices/postSlice';
import postService from '../../services/postService';

// Color constants
const colors = {
  primary: '#0066CC',
  white: '#FFFFFF',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
};

const PostDetailScreen = ({ route, navigation }) => {
  const { postId, openComments = false } = route.params;
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  
  const commentInputRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Load post details and comments
  useEffect(() => {
    loadPostDetails();
    loadComments();
    
    // Auto-focus comment input if opened for comments
    if (openComments) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 500);
    }
  }, [postId]);

  // Load post details
  const loadPostDetails = async () => {
    try {
      setLoading(true);
      const response = await postService.getPostById(postId);
      setPost(response.post);
    } catch (error) {
      Alert.alert('Error', 'Failed to load post details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Load comments
  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await postService.getPostComments(postId);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Handle like/unlike
  const handleLike = useCallback(async (postId, liked) => {
    try {
      if (liked) {
        await dispatch(likePost({ postId })).unwrap();
        setPost(prev => ({
          ...prev,
          is_liked: true,
          likes_count: prev.likes_count + 1
        }));
      } else {
        await dispatch(unlikePost({ postId })).unwrap();
        setPost(prev => ({
          ...prev,
          is_liked: false,
          likes_count: Math.max(0, prev.likes_count - 1)
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update like status');
    }
  }, [dispatch]);

  // Handle add comment
  const handleAddComment = useCallback(async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    if (commentText.length > 500) {
      Alert.alert('Error', 'Comment is too long (max 500 characters)');
      return;
    }

    try {
      setAddingComment(true);
      const response = await postService.addComment(postId, commentText.trim());
      
      if (response.success) {
        // Add new comment to the list
        setComments(prev => [...prev, response.comment]);
        setCommentText('');
        commentInputRef.current?.blur();
        
        // Update post comment count
        setPost(prev => ({
          ...prev,
          comments_count: prev.comments_count + 1
        }));

        // Scroll to bottom to show new comment
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  }, [commentText, postId]);

  // Handle user press
  const handleUserPress = useCallback((userId) => {
    navigation.navigate('UserProfile', { userId });
  }, [navigation]);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMs = now - commentTime;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return commentTime.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Render comment item
  const renderCommentItem = (comment, index) => (
    <View key={comment.id} style={[styles.commentItem, index < comments.length - 1 && styles.commentItemBorder]}>
      <TouchableOpacity onPress={() => handleUserPress(comment.author.id)}>
        <Avatar 
          size={36}
          uri={comment.author.profile_picture_url}
          name={comment.author.full_name}
        />
      </TouchableOpacity>

      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <TouchableOpacity onPress={() => handleUserPress(comment.author.id)}>
            <Text style={styles.commentAuthorName}>{comment.author.full_name}</Text>
            <Text style={styles.commentAuthorType}>
              {comment.author.user_type === 'doctor' 
                ? comment.author.specialty || 'Doctor'
                : comment.author.college || 'Medical Student'
              }
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.commentText}>{comment.content}</Text>
        </View>

        <View style={styles.commentActions}>
          <Text style={styles.commentTimestamp}>
            {formatTimestamp(comment.created_at)}
          </Text>
          
          <TouchableOpacity style={styles.commentLikeButton}>
            <Icon name="heart" size={14} color={colors.gray500} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.commentReplyButton}>
            <Text style={styles.commentReplyText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
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
          <Text style={styles.headerTitle}>Post</Text>
        </View>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={colors.gray700} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
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
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="share" size={20} color={colors.gray700} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Post */}
          <PostCard 
            post={post}
            onLike={handleLike}
            onUserPress={handleUserPress}
            currentUserId={user?.id}
          />

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <View style={styles.commentsSectionHeader}>
              <Text style={styles.commentsSectionTitle}>
                Comments ({post.comments_count})
              </Text>
            </View>

            {/* Comments List */}
            {commentsLoading ? (
              <View style={styles.commentsLoading}>
                <LoadingSpinner size="small" />
                <Text style={styles.loadingText}>Loading comments...</Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={styles.noComments}>
                <Icon name="message-circle" size={40} color={colors.gray400} />
                <Text style={styles.noCommentsText}>No comments yet</Text>
                <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
              </View>
            ) : (
              <View style={styles.commentsList}>
                {comments.map((comment, index) => renderCommentItem(comment, index))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Add Comment Input */}
        <View style={styles.commentInputContainer}>
          <Avatar 
            size={32}
            uri={user?.profile_picture_url}
            name={user?.full_name}
          />
          <View style={styles.commentInputWrapper}>
            <TextInput
              ref={commentInputRef}
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor={colors.gray500}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!commentText.trim() || addingComment) && styles.sendButtonDisabled
              ]}
              onPress={handleAddComment}
              disabled={!commentText.trim() || addingComment}
            >
              {addingComment ? (
                <LoadingSpinner size="small" color={colors.white} />
              ) : (
                <Icon name="send" size={18} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.gray600,
  },
  commentsSection: {
    backgroundColor: colors.gray100,
    paddingTop: 16,
  },
  commentsSectionHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  commentsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
  },
  commentsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginLeft: 12,
    color: colors.gray600,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray600,
    marginTop: 12,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 4,
  },
  commentsList: {
    paddingBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  commentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentBubble: {
    backgroundColor: colors.gray100,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  commentAuthorType: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 6,
  },
  commentText: {
    fontSize: 14,
    color: colors.gray800,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  commentTimestamp: {
    fontSize: 12,
    color: colors.gray500,
    marginRight: 16,
  },
  commentLikeButton: {
    marginRight: 16,
  },
  commentReplyButton: {
    marginRight: 16,
  },
  commentReplyText: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: '500',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  commentInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginLeft: 12,
    backgroundColor: colors.gray100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    color: colors.gray800,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray400,
  },
});

export default PostDetailScreen;