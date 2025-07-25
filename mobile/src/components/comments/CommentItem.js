// components/comments/CommentItem.js - Enhanced Comment with Replies and Likes
/**
 * CommentItem - Interactive comment component with nested replies and likes
 * Features: Like/unlike comments, reply functionality, timestamp formatting
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Avatar from '../common/Avatar';
import postService from '../../services/postService';

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

const CommentItem = memo(({ 
  comment, 
  onReply, 
  onUserPress, 
  onLoadReplies,
  currentUserId,
  isReply = false,
  depth = 0 
}) => {
  const [liked, setLiked] = useState(comment.is_liked || false);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
  const [likeAnimation] = useState(new Animated.Value(1));
  const [showingReplies, setShowingReplies] = useState(comment.replies?.length > 0);
  const [loadingReplies, setLoadingReplies] = useState(false);

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

  // Handle like with animation
  const handleLike = useCallback(async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    // Animate heart
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      if (newLiked) {
        await postService.likeComment(comment.id);
      } else {
        await postService.unlikeComment(comment.id);
      }
    } catch (error) {
      // Revert on error
      setLiked(!newLiked);
      setLikesCount(prev => newLiked ? prev - 1 : prev + 1);
      Alert.alert('Error', error.message || 'Failed to update like status');
    }
  }, [liked, comment.id, likeAnimation]);

  // Handle reply
  const handleReply = useCallback(() => {
    if (onReply) {
      onReply(comment, isReply ? comment.parent_id : comment.id);
    }
  }, [onReply, comment, isReply]);

  // Handle user press
  const handleUserPress = useCallback(() => {
    if (onUserPress) {
      onUserPress(comment.author.id);
    }
  }, [onUserPress, comment.author.id]);

  // Handle load more replies
  const handleLoadReplies = useCallback(async () => {
    if (comment.replies_count === 0 || comment.replies?.length >= comment.replies_count) {
      return;
    }

    try {
      setLoadingReplies(true);
      if (onLoadReplies) {
        await onLoadReplies(comment.id);
      }
      setShowingReplies(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load replies');
    } finally {
      setLoadingReplies(false);
    }
  }, [comment.id, comment.replies_count, comment.replies?.length, onLoadReplies]);

  // Toggle replies visibility
  const toggleReplies = useCallback(() => {
    if (comment.replies_count === 0) return;
    
    if (!showingReplies && comment.replies?.length === 0) {
      handleLoadReplies();
    } else {
      setShowingReplies(!showingReplies);
    }
  }, [showingReplies, comment.replies_count, comment.replies?.length, handleLoadReplies]);

  // Get user type display
  const getUserTypeDisplay = () => {
    const { user_type, specialty, college } = comment.author;
    if (user_type === 'doctor') {
      return specialty || 'Doctor';
    }
    if (user_type === 'student') {
      return college || 'Medical Student';
    }
    if (user_type === 'admin') {
      return 'System Administrator';
    }
    return 'Medical Professional';
  };

  // Calculate indentation for nested replies (max 3 levels)
  const indentationLevel = Math.min(depth, 3);
  const indentationStyle = {
    marginLeft: indentationLevel * 20,
    borderLeftWidth: indentationLevel > 0 ? 2 : 0,
    borderLeftColor: colors.gray300,
    paddingLeft: indentationLevel > 0 ? 12 : 0,
  };

  return (
    <View style={[styles.container, indentationStyle]}>
      {/* Comment Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={handleUserPress}
          activeOpacity={0.7}
        >
          <Avatar 
            size={isReply ? 32 : 36}
            uri={comment.author.profile_picture_url}
            name={comment.author.full_name}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{comment.author.full_name}</Text>
            <View style={styles.metaInfo}>
              <Text style={styles.userType}>{getUserTypeDisplay()}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.timestamp}>
                {formatTimestamp(comment.created_at)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Comment Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{comment.content}</Text>
      </View>

      {/* Comment Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, liked && styles.actionButtonLiked]}
          onPress={handleLike}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
            <Icon 
              name="heart" 
              size={14} 
              color={liked ? colors.danger : colors.gray600}
              fill={liked ? colors.danger : 'none'}
            />
          </Animated.View>
          {likesCount > 0 && (
            <Text style={[styles.actionText, liked && styles.actionTextLiked]}>
              {likesCount}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleReply}
          activeOpacity={0.8}
        >
          <Icon name="corner-up-left" size={14} color={colors.gray600} />
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>

        {comment.replies_count > 0 && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={toggleReplies}
            activeOpacity={0.8}
          >
            <Icon 
              name={showingReplies ? "chevron-up" : "chevron-down"} 
              size={14} 
              color={colors.gray600} 
            />
            <Text style={styles.actionText}>
              {comment.replies_count} {comment.replies_count === 1 ? 'reply' : 'replies'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Replies Section */}
      {showingReplies && comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply, index) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onUserPress={onUserPress}
              onLoadReplies={onLoadReplies}
              currentUserId={currentUserId}
              isReply={true}
              depth={depth + 1}
            />
          ))}
          
          {/* Load More Replies Button */}
          {comment.replies.length < comment.replies_count && (
            <TouchableOpacity 
              style={styles.loadMoreButton}
              onPress={handleLoadReplies}
              disabled={loadingReplies}
              activeOpacity={0.7}
            >
              <Text style={styles.loadMoreText}>
                {loadingReplies ? 'Loading...' : `Load ${comment.replies_count - comment.replies.length} more replies`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userType: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '500',
  },
  separator: {
    fontSize: 11,
    color: colors.gray400,
    marginHorizontal: 4,
  },
  timestamp: {
    fontSize: 11,
    color: colors.gray500,
  },
  contentContainer: {
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: colors.gray800,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 16,
  },
  actionButtonLiked: {
    backgroundColor: '#FFE8E8',
  },
  actionText: {
    fontSize: 12,
    color: colors.gray600,
    marginLeft: 4,
    fontWeight: '500',
  },
  actionTextLiked: {
    color: colors.danger,
  },
  repliesContainer: {
    marginTop: 12,
  },
  loadMoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  loadMoreText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default CommentItem;