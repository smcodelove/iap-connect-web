// screens/post/CreatePostScreen.js
/**
 * CreatePostScreen - Screen for creating new posts
 * Features: Text input, image picker, hashtag suggestions
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Feather';

import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import { createPost } from '../../store/slices/postSlice';
import { colors, typography, spacing } from '../../styles';

const { width: screenWidth } = Dimensions.get('window');

const CreatePostScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.posts);

  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textInputRef = useRef(null);

  // Handle post submission
  const handleSubmit = useCallback(async () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert('Error', 'Please add some content or images');
      return;
    }

    setIsSubmitting(true);
    try {
      const postData = {
        content: content.trim(),
        media_urls: images, // In real app, upload images first
      };
      
      await dispatch(createPost(postData)).unwrap();
      Alert.alert('Success', 'Post created successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  }, [content, images, dispatch, navigation]);

  // Handle image picker
  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => asset.uri);
        setImages(prev => [...prev, ...newImages].slice(0, 4)); // Max 4 images
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  }, []);

  // Handle camera
  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets[0]) {
        setImages(prev => [...prev, result.assets[0].uri].slice(0, 4));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  }, []);

  // Remove image
  const removeImage = useCallback((index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle hashtag suggestions (simple implementation)
  const getHashtagSuggestions = useCallback(() => {
    const suggestions = ['#medical', '#healthcare', '#study', '#case', '#research'];
    return suggestions;
  }, []);

  // Insert hashtag
  const insertHashtag = useCallback((hashtag) => {
    setContent(prev => prev + ` ${hashtag}`);
    textInputRef.current?.focus();
  }, []);

  // Show media options
  const showMediaOptions = useCallback(() => {
    Alert.alert(
      'Add Media',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, [takePhoto, pickImage]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Icon name="x" size={24} color={colors.gray700} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Create Post</Text>
        
        <Button
          title="Post"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!content.trim() && images.length === 0}
          size="small"
          style={styles.postButton}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Avatar
            uri={user?.profile_picture_url}
            name={user?.full_name}
            size={40}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.full_name}</Text>
            <Text style={styles.userType}>
              {user?.user_type === 'doctor' ? '👨‍⚕️ Doctor' : '👨‍🎓 Student'}
            </Text>
          </View>
        </View>

        {/* Content Input */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            placeholder="What's on your mind? Share your medical knowledge, case studies, or ask questions..."
            placeholderTextColor={colors.gray500}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={2000}
            textAlignVertical="top"
          />
          
          {/* Character Count */}
          <Text style={styles.characterCount}>
            {content.length}/2000
          </Text>
        </View>

        {/* Images Preview */}
        {images.length > 0 && (
          <View style={styles.imagesContainer}>
            <Text style={styles.sectionTitle}>Photos ({images.length}/4)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imagePreview}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Icon name="x" size={16} color={colors.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Hashtag Suggestions */}
        <View style={styles.hashtagContainer}>
          <Text style={styles.sectionTitle}>Suggested Hashtags</Text>
          <View style={styles.hashtagList}>
            {getHashtagSuggestions().map((hashtag) => (
              <TouchableOpacity
                key={hashtag}
                style={styles.hashtagChip}
                onPress={() => insertHashtag(hashtag)}
              >
                <Text style={styles.hashtagText}>{hashtag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>💡 Tips for Better Posts</Text>
          <Text style={styles.tipText}>
            • Share medical cases with proper anonymization{'\n'}
            • Use relevant hashtags to reach the right audience{'\n'}
            • Add images to make your posts more engaging{'\n'}
            • Ask questions to start meaningful discussions
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={showMediaOptions}
          disabled={images.length >= 4}
        >
          <Icon 
            name="camera" 
            size={20} 
            color={images.length >= 4 ? colors.gray400 : colors.primary} 
          />
          <Text style={[
            styles.actionText,
            images.length >= 4 && styles.actionTextDisabled
          ]}>
            Photos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => insertHashtag('#')}
        >
          <Icon name="hash" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Hashtag</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            Alert.alert('Coming Soon', 'Polls feature will be available soon!');
          }}
        >
          <Icon name="bar-chart-2" size={20} color={colors.gray400} />
          <Text style={[styles.actionText, styles.actionTextDisabled]}>
            Poll
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '600',
  },
  postButton: {
    minWidth: 60,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  userDetails: {
    marginLeft: spacing.sm,
  },
  userName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray900,
  },
  userType: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  textInput: {
    ...typography.body,
    color: colors.gray900,
    minHeight: 120,
    textAlignVertical: 'top',
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  characterCount: {
    ...typography.small,
    color: colors.gray500,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  imagesContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.sm,
  },
  imagePreview: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hashtagContainer: {
    marginBottom: spacing.lg,
  },
  hashtagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hashtagChip: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  hashtagText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  tipsContainer: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  tipText: {
    ...typography.caption,
    color: colors.gray600,
    lineHeight: 18,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.white,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  actionTextDisabled: {
    color: colors.gray400,
  },
});

export default CreatePostScreen;