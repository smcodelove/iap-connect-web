// components/posts/PostCard.js - Updated with Enhanced Hashtags
/**
 * PostCard - Beautiful, interactive post component with enhanced hashtags
 * Features: Clickable hashtags, trending indicators, improved UI
 */

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Alert,
  Share,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import Avatar from '../common/Avatar';
import HashtagText from '../common/HashtagText';

const { width: screenWidth } = Dimensions.get('window');
const POST_IMAGE_HEIGHT = screenWidth * 0.6;

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

const PostCard = memo(({ 
  post, 
  onLike, 
  onComment, 
  onShare, 
  onUserPress, 
  onPostPress,
  onHashtagPress,
  currentUserId 
}) => {
  const [liked, setLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [likeAnimation] = useState(new Animated.Value(1));

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMs = now - postTime;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return postTime.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Handle like with animation
  const handleLike = useCallback(() => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

    // Animate heart
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Call parent callback
    if (onLike) {
      onLike(post.id, newLiked);
    }
  }, [liked, onLike, post.id, likeAnimation]);

  // Handle comment
  const handleComment = useCallback(() => {
    if (onComment) {
      onComment(post.id);
    }
  }, [onComment, post.id]);

  // Handle share
  const handleShare = useCallback(async () => {
    try {
      const shareContent = {
        message: `Check out this post by ${post.author.full_name}:\n\n${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}\n\nShared via IAP Connect`,
        url: `https://iapconnect.com/posts/${post.id}`,
      };

      await Share.share(shareContent);
      
      if (onShare) {
        onShare(post.id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share post');
    }
  }, [post, onShare]);

  // Handle user press
  const handleUserPress = useCallback(() => {
    if (onUserPress) {
      onUserPress(post.author.id);
    }
  }, [onUserPress, post.author.id]);

  // Handle post press
  const handlePostPress = useCallback(() => {
    if (onPostPress) {
      onPostPress(post.id);
    }
  }, [onPostPress, post.id]);

  // Handle hashtag press
  const handleHashtagPress = useCallback((hashtag) => {
    console.log(`🏷️ Hashtag clicked in post: ${hashtag}`);
    if (onHashtagPress) {
      onHashtagPress(hashtag, post.id);
    }
  }, [onHashtagPress, post.id]);

  // Render images
  const renderImages = () => {
    if (!post.media_urls || post.media_urls.length === 0) return null;

    const images = post.media_urls;
    
    if (images.length === 1) {
      return (
        <TouchableOpacity 
          style={styles.singleImageContainer}
          activeOpacity={0.9}
          onPress={() => {/* Open image viewer */}}
        >
          <Image 
            source={{ uri: images[0] }} 
            style={styles.singleImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    if (images.length === 2) {
      return (
        <View style={styles.twoImagesContainer}>
          {images.map((imageUri, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.halfImageContainer}
              activeOpacity={0.9}
              onPress={() => {/* Open image viewer */}}
            >
              <Image 
                source={{ uri: imageUri }} 
                style={styles.halfImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (images.length >= 3) {
      return (
        <View style={styles.multipleImagesContainer}>
          <TouchableOpacity 
            style={styles.mainImageContainer}
            activeOpacity={0.9}
            onPress={() => {/* Open image viewer */}}
          >
            <Image 
              source={{ uri: images[0] }} 
              style={styles.mainImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          
          <View style={styles.sideImagesContainer}>
            <TouchableOpacity 
              style={styles.sideImageContainer}
              activeOpacity={0.9}
              onPress={() => {/* Open image viewer */}}
            >
              <Image 
                source={{ uri: images[1] }} 
                style={styles.sideImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.sideImageContainer, styles.lastSideImage]}
              activeOpacity={0.9}
              onPress={() => {/* Open image viewer */}}
            >
              <Image 
                source={{ uri: images[2] }} 
                style={styles.sideImage}
                resizeMode="cover"
              />
              {images.length > 3 && (
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.moreImagesOverlay}
                >
                  <Text style={styles.moreImagesText}>+{images.length - 3}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }
  };

  // Get user type display
  const getUserTypeDisplay = () => {
    const { user_type, specialty, college } = post.author;
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

  // Render hashtags section
  const renderHashtags = () => {
    if (!post.hashtags || post.hashtags.length === 0) return null;

    return (
      <View style={styles.hashtagsContainer}>
        {post.hashtags.slice(0, 5).map((hashtag, index) => (
          <TouchableOpacity
            key={index}
            style={styles.hashtagChip}
            onPress={() => handleHashtagPress(hashtag)}
            activeOpacity={0.7}
          >
            <Text style={styles.hashtagChipText}>{hashtag}</Text>
          </TouchableOpacity>
        ))}
        {post.hashtags.length > 5 && (
          <View style={styles.moreHashtagsChip}>
            <Text style={styles.moreHashtagsText}>+{post.hashtags.length - 5}</Text>
          </View>
        )}
      </View>
    );
  };

  // Check if post is trending
  const isTrending = post.is_trending || post.likes_count > 10 || post.comments_count > 5;

  return (
    <View style={styles.card}>
      {/* Trending Indicator */}
      {isTrending && (
        <View style={styles.trendingIndicator}>
          <Icon name="trending-up" size={14} color={colors.accent} />
          <Text style={styles.trendingText}>Trending</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={handleUserPress}
          activeOpacity={0.7}
        >
          <Avatar 
            size={45}
            uri={post.author.profile_picture_url}
            name={post.author.full_name}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.author.full_name}</Text>
            <View style={styles.metaInfo}>
              <Text style={styles.userType}>{getUserTypeDisplay()}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.timestamp}>
                {formatTimestamp(post.created_at)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionsButton}>
          <Icon name="more-horizontal" size={20} color={colors.gray500} />
        </TouchableOpacity>
      </View>

      {/* Content with Enhanced Hashtags */}
      <TouchableOpacity 
        style={styles.contentContainer}
        onPress={handlePostPress}
        activeOpacity={0.95}
      >
        <HashtagText 
          content={post.content}
          style={styles.content}
          onHashtagPress={handleHashtagPress}
        />
      </TouchableOpacity>

      {/* Hashtag Chips */}
      {renderHashtags()}

      {/* Images */}
      {renderImages()}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {likesCount > 0 && `${likesCount} ${likesCount === 1 ? 'like' : 'likes'}`}
        </Text>
        <Text style={styles.statsText}>
          {post.comments_count > 0 && `${post.comments_count} ${post.comments_count === 1 ? 'comment' : 'comments'}`}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, liked && styles.actionButtonLiked]}
          onPress={handleLike}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: likeAnimation }] }}>
            <Icon 
              name="heart" 
              size={20} 
              color={liked ? colors.danger : colors.gray600}
              fill={liked ? colors.danger : 'none'}
            />
          </Animated.View>
          <Text style={[styles.actionText, liked && styles.actionTextLiked]}>
            Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleComment}
          activeOpacity={0.8}
        >
          <Icon name="message-circle" size={20} color={colors.gray600} />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Icon name="share" size={20} color={colors.gray600} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          activeOpacity={0.8}
        >
          <Icon name="bookmark" size={20} color={colors.gray600} />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  trendingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 16,
    zIndex: 1,
  },
  trendingText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userType: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: colors.gray400,
    marginHorizontal: 6,
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray500,
  },
  optionsButton: {
    padding: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  content: {
    fontSize: 16,
    color: colors.gray800,
    lineHeight: 22,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  hashtagChip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  hashtagChipText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  moreHashtagsChip: {
    backgroundColor: colors.gray300,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  moreHashtagsText: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: '600',
  },
  singleImageContainer: {
    width: '100%',
    height: POST_IMAGE_HEIGHT,
    backgroundColor: colors.gray200,
  },
  singleImage: {
    width: '100%',
    height: '100%',
  },
  twoImagesContainer: {
    flexDirection: 'row',
    height: POST_IMAGE_HEIGHT,
  },
  halfImageContainer: {
    flex: 1,
    backgroundColor: colors.gray200,
    marginRight: 2,
  },
  halfImage: {
    width: '100%',
    height: '100%',
  },
  multipleImagesContainer: {
    flexDirection: 'row',
    height: POST_IMAGE_HEIGHT,
  },
  mainImageContainer: {
    flex: 2,
    backgroundColor: colors.gray200,
    marginRight: 2,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  sideImagesContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  sideImageContainer: {
    flex: 1,
    backgroundColor: colors.gray200,
    marginBottom: 2,
    position: 'relative',
  },
  lastSideImage: {
    marginBottom: 0,
  },
  sideImage: {
    width: '100%',
    height: '100%',
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    fontSize: 18,
    color: colors.white,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  statsText: {
    fontSize: 12,
    color: colors.gray600,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  actionButtonLiked: {
    backgroundColor: '#FFE8E8',
  },
  actionText: {
    fontSize: 12,
    color: colors.gray600,
    marginLeft: 6,
    fontWeight: '500',
  },
  actionTextLiked: {
    color: colors.danger,
  },
});

export default PostCard;