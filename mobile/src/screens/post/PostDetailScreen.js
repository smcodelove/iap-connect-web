// screens/post/PostDetailScreen.js
/**
 * PostDetailScreen - Detailed view of a single post with comments
 * Features: Post details, comments list, add comment, interactions
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import PostCard from '../../components/posts/PostCard';
import CommentCard from '../../components/posts/CommentCard';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { 
  fetchPostById, 
  fetchPostComments, 
  addComment,
  likePost,
  unlikePost 
} from '../../store/slices/postSlice';
import { colors, typography, spacing } from '../../styles';

const PostDetailScreen = ({ route, navigation }) => {
  const { postId, openComments = false } = route.params;
  const dispatch = useDispatch();
  
  const { user } = useSelector(state => state.auth);
  const { 
    currentPost, 
    comments, 
    loading, 
    commenting 
  } = useSelector(state => state.posts);

  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(openComments);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const commentInputRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Load post and comments
  useEffect(() => {
    dispatch(fetchPostById(postId));
    dispatch(fetchPostComments(postId));
  }, [dispatch, postId]);

  // Auto focus comment input if opened for comments
  useEffect(() => {
    if (openComments && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current.focus();
      }, 500);
    }
  }, [openComments]);

  // Handle post interactions
  const handleLike = useCallback(() => {
    // Handle like inline since we're already on post detail
    if (currentPost?.is_liked_by_user) {
      dispatch(unlikePost(currentPost.id));
    } else {
      dispatch(likePost(currentPost.id));
    }
  }, [dispatch, currentPost]);

  const handleComment = useCallback(() => {
    setShowCommentInput(true);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  }, []);

  const handleShare = useCallback(() => {
    if (currentPost) {
      Alert.alert('Share', `Share ${currentPost.user.full_name}'s post`);
    }
  }, [currentPost]);

  const handleUserPress = useCallback((userId) => {
    navigation.navigate('Profile', { userId });
  }, [navigation]);

  // Handle comment submission
  const handleSubmitComment = useCallback(async () => {
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      await dispatch(addComment({
        postId: currentPost.id,
        content: comment.trim(),
      })).unwrap();
      
      setComment('');
      setShowCommentInput(false);
      
      // Scroll to bottom to show new comment
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  }, [dispatch, currentPost?.id, comment]);

  // Handle comment like (placeholder)
  const handleCommentLike = useCallback((commentId) => {
    Alert.alert('Coming Soon', 'Comment likes will be available soon!');
  }, []);

  // Handle comment reply (placeholder)
  const handleCommentReply = useCallback((commentId, username) => {
    setComment(`@${username} `);
    setShowCommentInput(true);
    commentInputRef.current?.focus();
  }, []);

  if (loading && !currentPost) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (!currentPost) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color={colors.gray400} />
        <Text style={styles.errorTitle}>Post not found</Text>
        <Text style={styles.errorSubtitle}>
          This post may have been deleted or you don't have permission to view it.
        </Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.goBackButton}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={colors.gray700} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Post</Text>
        
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => Alert.alert('Options', 'Post options menu')}
        >
          <Icon name="more-horizontal" size={24} color={colors.gray700} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Post Content */}
        <PostCard
          post={currentPost}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onUserPress={() => handleUserPress(currentPost.user.id)}
          style={styles.postCard}
        />

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>
              Comments ({comments.length})
            </Text>
          </View>

          {/* Comments List */}
          {comments.length === 0 ? (
            <View style={styles.noCommentsContainer}>
              <Icon name="message-circle" size={32} color={colors.gray400} />
              <Text style={styles.noCommentsText}>No comments yet</Text>
              <Text style={styles.noCommentsSubtext}>
                Be the first to share your thoughts!
              </Text>
            </View>
          ) : (
            comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                onLike={() => handleCommentLike(comment.id)}
                onReply={() => handleCommentReply(comment.id, comment.user.username)}
                onUserPress={() => handleUserPress(comment.user.id)}
              />
            ))
          )}

          {/* Loading more comments */}
          {loading && comments.length > 0 && (
            <View style={styles.loadingCommentsContainer}>
              <LoadingSpinner size="small" />
              <Text style={styles.loadingCommentsText}>Loading comments...</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      {showCommentInput && (
        <View style={styles.commentInputContainer}>
          <Avatar
            uri={user?.profile_picture_url}
            name={user?.full_name}
            size={32}
          />
          
          <View style={styles.inputRow}>
            <TextInput
              ref={commentInputRef}
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor={colors.gray500}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
            />
            
            <View style={styles.inputActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowCommentInput(false);
                  setComment('');
                }}
              >
                <Icon name="x" size={18} color={colors.gray600} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!comment.trim() || submittingComment) && styles.sendButtonDisabled
                ]}
                onPress={handleSubmitComment}
                disabled={!comment.trim() || submittingComment}
              >
                {submittingComment ? (
                  <LoadingSpinner size="small" color={colors.white} />
                ) : (
                  <Icon name="send" size={18} color={colors.white} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Floating Comment Button */}
      {!showCommentInput && (
        <TouchableOpacity
          style={styles.floatingCommentButton}
          onPress={handleComment}
        >
          <Icon name="message-circle" size={24} color={colors.white} />
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '600',
  },
  moreButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  postCard: {
    marginHorizontal: 0,
    marginBottom: 0,
    borderRadius: 0,
  },
  commentsSection: {
    backgroundColor: colors.white,
    paddingTop: spacing.md,
  },
  commentsHeader: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  commentsTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray900,
  },
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  noCommentsText: {
    ...typography.body,
    color: colors.gray700,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  noCommentsSubtext: {
    ...typography.caption,
    color: colors.gray500,
    textAlign: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.gray100,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.gray700,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorSubtitle: {
    ...typography.body,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  goBackButton: {
    minWidth: 120,
  },
  loadingCommentsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  loadingCommentsText: {
    ...typography.caption,
    color: colors.gray600,
    marginLeft: spacing.sm,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  inputRow: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  commentInput: {
    ...typography.body,
    backgroundColor: colors.gray50,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    marginBottom: spacing.sm,
  },
  inputActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cancelButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  floatingCommentButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default PostDetailScreen;