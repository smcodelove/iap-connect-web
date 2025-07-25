// screens/post/PostDetailScreen.js - Enhanced with Reply & Like Comments
/**
 * PostDetailScreen - Detailed view of a post with advanced comments
 * Features: Nested replies, comment likes, enhanced UI
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
import CommentItem from '../../components/comments/CommentItem';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import { likePost, unlikePost } from '../../store/slices/postSlice';
import postService from '../../services/postService';

// Color constants
const colors = {
  primary: '#0066CC',
  primaryLight: '#3385DB',
  accent: '#FF6B35',
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
  const [replyingTo, setReplyingTo] = useState(null); // For reply functionality
  
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

  // Handle like/unlike post
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

  // Handle share post
  const handleShare = useCallback(async (postId) => {
    try {
      await postService.sharePost(postId);
      Alert.alert('Success', 'Post shared successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to share post');
    }
  }, []);

  // Handle add comment or reply
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
      const parentId = replyingTo?.parentId || replyingTo?.id || null;
      const response = await postService.addComment(postId, commentText.trim(), parentId);
      
      if (response.success) {
        // If it's a reply, update the parent comment's replies
        if (parentId) {
          setComments(prev => prev.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response.comment],
                replies_count: comment.replies_count + 1
              };
            }
            return comment;
          }));
        } else {
          // Top-level comment
          setComments(prev => [response.comment, ...prev]);
          setPost(prev => ({
            ...prev,
            comments_count: prev.comments_count + 1
          }));
        }

        setCommentText('');
        setReplyingTo(null);
        commentInputRef.current?.blur();

        // Scroll to show new comment
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  }, [commentText, postId, replyingTo]);

  // Handle reply to comment
  const handleReply = useCallback((comment, parentId = null) => {
    setReplyingTo({
      id: comment.id,
      parentId: parentId,
      authorName: comment.author.full_name
    });
    setCommentText(`@${comment.author.username} `);
    commentInputRef.current?.focus();
  }, []);

  // Handle load replies for a comment
  const handleLoadReplies = useCallback(async (commentId) => {
    try {
      const response = await postService.getCommentReplies(commentId);
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: response.comments
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Failed to load replies:', error);
      throw error;
    }
  }, []);

  // Handle user press
  const handleUserPress = useCallback((userId) => {
    navigation.navigate('UserProfile', { userId });
  }, [navigation]);

  // Cancel reply
  const cancelReply = useCallback(() => {
    setReplyingTo(null);
    setCommentText('');
  }, []);

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
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => handleShare(post.id)}
        >
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
            onShare={handleShare}
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
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={handleReply}
                    onUserPress={handleUserPress}
                    onLoadReplies={handleLoadReplies}
                    currentUserId={user?.id}
                    depth={0}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Reply Indicator */}
        {replyingTo && (
          <View style={styles.replyIndicator}>
            <Text style={styles.replyText}>
              Replying to {replyingTo.authorName}
            </Text>
            <TouchableOpacity onPress={cancelReply}>
              <Icon name="x" size={16} color={colors.gray600} />
            </TouchableOpacity>
          </View>
        )}

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
              placeholder={replyingTo ? `Reply to ${replyingTo.authorName}...` : "Write a comment..."}
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
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primaryLight,
  },
  replyText: {
    fontSize: 14,
    color: colors.white,
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