// components/posts/CommentCard.js
/**
 * CommentCard - Individual comment component
 * Features: User info, comment content, like, reply actions
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import Avatar from '../common/Avatar';
import { colors, typography, spacing } from '../../styles';
import { formatTimeAgo } from '../../utils/helpers';

const CommentCard = ({ 
  comment, 
  onLike, 
  onReply, 
  onUserPress,
  style 
}) => {
  // Check if comment is liked (placeholder - in real app get from state)
  const isLiked = false;

  return (
    <View style={[styles.container, style]}>
      {/* User Avatar */}
      <TouchableOpacity onPress={onUserPress}>
        <Avatar
          uri={comment.user.profile_picture_url}
          name={comment.user.full_name}
          size={32}
        />
      </TouchableOpacity>

      {/* Comment Content */}
      <View style={styles.contentContainer}>
        {/* User Info & Content */}
        <View style={styles.commentBubble}>
          <TouchableOpacity onPress={onUserPress}>
            <Text style={styles.username}>{comment.user.full_name}</Text>
          </TouchableOpacity>
          
          <Text style={styles.userType}>
            {comment.user.user_type === 'doctor' ? '👨‍⚕️' : '👨‍🎓'}
          </Text>
          
          <Text style={styles.content}>{comment.content}</Text>
        </View>

        {/* Comment Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.timestamp}>
            {formatTimeAgo(comment.created_at)}
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onLike}
          >
            <Icon
              name="heart"
              size={14}
              color={isLiked ? colors.danger : colors.gray500}
              fill={isLiked ? colors.danger : 'none'}
            />
            <Text style={[
              styles.actionText,
              isLiked && styles.actionTextLiked
            ]}>
              Like
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onReply}
          >
            <Icon name="corner-up-left" size={14} color={colors.gray500} />
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'flex-start',
  },
  contentContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  commentBubble: {
    backgroundColor: colors.gray50,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  username: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  userType: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    fontSize: 12,
  },
  content: {
    ...typography.body,
    color: colors.gray800,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  timestamp: {
    ...typography.small,
    color: colors.gray500,
    marginRight: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    paddingVertical: 2,
  },
  actionText: {
    ...typography.small,
    color: colors.gray500,
    marginLeft: 4,
    fontWeight: '500',
  },
  actionTextLiked: {
    color: colors.danger,
  },
});

export default CommentCard;