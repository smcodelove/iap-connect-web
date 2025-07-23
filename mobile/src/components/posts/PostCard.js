// components/posts/PostCard.js
/**
 * PostCard - Individual post component with user interactions
 * Features: Like, Comment, Share, User profile navigation
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { likePost, unlikePost } from '../../store/slices/postSlice';
import { colors, typography, spacing } from '../../styles';
import { formatTimeAgo } from '../../utils/helpers';

const { width: screenWidth } = Dimensions.get('window');
const POST_IMAGE_HEIGHT = screenWidth * 0.75;

const PostCard = ({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onUserPress,
  style 
}) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector(state => state.auth);
  
  const [isLiking, setIsLiking] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Check if current user liked this post
  const isLiked = post.is_liked_by_user || false;

  // Handle like/unlike post
  const handleLike = useCallback(async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      if (isLiked) {
        await dispatch(unlikePost(post.id)).unwrap();
      } else {
        await dispatch(likePost(post.id)).unwrap();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update like');
    } finally {
      setIsLiking(false);
    }
  }, [dispatch, post.id, isLiked, isLiking]);

  // Handle hashtag press
  const handleHashtagPress = useCallback((hashtag) => {
    // Navigate to hashtag search or trending
    Alert.alert('Hashtag', `Search for ${hashtag}`);
  }, []);

  // Render post content with hashtag highlighting
  const renderContent = useCallback(() => {
    const content = post.content;
    const hashtagRegex = /#\w+/g;
    const parts = content.split(hashtagRegex);
    const hashtags = content.match(hashtagRegex) || [];

    return (
      <Text style={styles.content}>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {hashtags[index] && (
              <Text
                style={styles.hashtag}
                onPress={() => handleHashtagPress(hashtags[index])}
              >
                {hashtags[index]}
              </Text>
            )}
          </React.Fragment>
        ))}
      </Text>
    );
  }, [post.content, handleHashtagPress]);

  // Render post images
  const renderImages = useCallback(() => {
    if (!post.media_urls || post.media_urls.length === 0) return null;

    return (
      <View style={styles.mediaContainer}>
        {post.media_urls.slice(0, 4).map((url, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.imageContainer,
              post.media_urls.length > 1 && styles.multipleImages
            ]}
            onPress={() => {
              // Navigate to image viewer
              Alert.alert('Image', 'Open image viewer');
            }}
          >
            <Image
              source={{ uri: url }}
              style={styles.postImage}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
            {post.media_urls.length > 4 && index === 3 && (
              <View style={styles.moreImagesOverlay}>
                <Text style={styles.moreImagesText}>
                  +{post.media_urls.length - 4}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  }, [post.media_urls]);

  return (
    <View style={[styles.container, style]}>
      {/* User Info Header */}
      <TouchableOpacity
        style={styles.userHeader}
        onPress={onUserPress}
        activeOpacity={0.7}
      >
        <Avatar
          uri={post.user.profile_picture_url}
          name={post.user.full_name}
          size={40}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{post.user.full_name}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.userType}>
              {post.user.user_type === 'doctor' ? '👨‍⚕️ Doctor' : '👨‍🎓 Student'}
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.timestamp}>
              {formatTimeAgo(post.created_at)}
            </Text>
          </View>
        </View>
        
        {/* Post Options Menu */}
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={() => Alert.alert('Options', 'Post options menu')}
        >
          <Icon name="more-horizontal" size={20} color={colors.gray600} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Post Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* Post Images */}
      {renderImages()}

      {/* Interaction Stats */}
      {(post.likes_count > 0 || post.comments_count > 0) && (
        <View style={styles.statsContainer}>
          {post.likes_count > 0 && (
            <Text style={styles.statsText}>
              {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
            </Text>
          )}
          {post.comments_count > 0 && (
            <Text style={styles.statsText}>
              {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
          disabled={isLiking}
        >
          <Icon
            name="heart"
            size={20}
            color={isLiked ? colors.danger : colors.gray600}
            fill={isLiked ? colors.danger : 'none'}
          />
          <Text style={[
            styles.actionText,
            isLiked && styles.actionTextActive
          ]}>
            Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onComment}
        >
          <Icon name="message-circle" size={20} color={colors.gray600} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onShare}
        >
          <Icon name="share" size={20} color={colors.gray600} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.sm,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  username: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userType: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '500',
  },
  separator: {
    ...typography.small,
    color: colors.gray400,
    marginHorizontal: spacing.xs,
  },
  timestamp: {
    ...typography.small,
    color: colors.gray500,
  },
  optionsButton: {
    padding: spacing.xs,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  content: {
    ...typography.body,
    color: colors.gray800,
    lineHeight: 22,
  },
  hashtag: {
    color: colors.primary,
    fontWeight: '600',
  },
  mediaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  imageContainer: {
    width: screenWidth - 32,
    height: POST_IMAGE_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  multipleImages: {
    width: (screenWidth - 48) / 2,
    height: (screenWidth - 48) / 2,
    marginBottom: spacing.xs,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  statsText: {
    ...typography.caption,
    color: colors.gray600,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    minWidth: 80,
    justifyContent: 'center',
  },
  actionText: {
    ...typography.caption,
    color: colors.gray600,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  actionTextActive: {
    color: colors.danger,
  },
});

export default PostCard;