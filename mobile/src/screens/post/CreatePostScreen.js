/**
 * CreatePostScreen - Complete implementation for creating new posts
 * Features: Text input, image picker, hashtag suggestions, user-friendly UI
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
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import { createPost } from '../../store/slices/postSlice';

const { width: screenWidth } = Dimensions.get('window');

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

const CreatePostScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.posts);

  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hashtags, setHashtags] = useState([]);
  const textInputRef = useRef(null);

  // Extract hashtags from content
  const extractHashtags = useCallback((text) => {
    const hashtagRegex = /#[\w]+/g;
    const matches = text.match(hashtagRegex) || [];
    setHashtags([...new Set(matches)]); // Remove duplicates
  }, []);

  // Handle content change
  const handleContentChange = useCallback((text) => {
    setContent(text);
    extractHashtags(text);
  }, [extractHashtags]);

  // Request camera/gallery permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return false;
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.slice(0, 4 - images.length); // Max 4 images
        setImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access camera');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets) {
        setImages(prev => [...prev, ...result.assets.slice(0, 4 - prev.length)]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Show image picker options
  const showImagePicker = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Handle post submission
  const handleSubmit = useCallback(async () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert('Error', 'Please add some content or images to create a post');
      return;
    }

    if (content.length > 2000) {
      Alert.alert('Error', 'Post content is too long (max 2000 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      const postData = {
        content: content.trim(),
        media_urls: images.map(img => img.uri), // In real app, upload images first
        hashtags: hashtags
      };
      
      await dispatch(createPost(postData)).unwrap();
      
      Alert.alert(
        'Success!', 
        'Your post has been shared successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form and navigate back
              setContent('');
              setImages([]);
              setHashtags([]);
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [content, images, hashtags, dispatch, navigation]);

  // Character counter color
  const getCharacterCountColor = () => {
    const length = content.length;
    if (length > 1800) return colors.danger;
    if (length > 1500) return colors.accent;
    return colors.gray500;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Icon name="x" size={24} color={colors.gray700} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Create Post</Text>
        
        <TouchableOpacity 
          style={[
            styles.postButton,
            (!content.trim() && images.length === 0) && styles.postButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || (!content.trim() && images.length === 0)}
        >
          {isSubmitting ? (
            <LoadingSpinner size="small" color={colors.white} />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* User Info */}
          <View style={styles.userInfo}>
            <Avatar 
              size={50}
              uri={user?.profile_picture_url}
              name={user?.full_name}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.full_name}</Text>
              <Text style={styles.userType}>
                {user?.user_type === 'doctor' ? 
                  `Dr. • ${user?.specialty || 'Medical Professional'}` : 
                  `Student • ${user?.college || 'Medical Student'}`
                }
              </Text>
            </View>
          </View>

          {/* Content Input */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              placeholder="What's on your mind? Share your thoughts, medical insights, or ask questions..."
              placeholderTextColor={colors.gray500}
              value={content}
              onChangeText={handleContentChange}
              multiline
              maxLength={2000}
              textAlignVertical="top"
              autoFocus
            />
            
            {/* Character Counter */}
            <Text style={[styles.characterCount, { color: getCharacterCountColor() }]}>
              {content.length}/2000
            </Text>
          </View>

          {/* Hashtags Preview */}
          {hashtags.length > 0 && (
            <View style={styles.hashtagsContainer}>
              <Text style={styles.hashtagsLabel}>Hashtags:</Text>
              <View style={styles.hashtagsList}>
                {hashtags.map((hashtag, index) => (
                  <View key={index} style={styles.hashtagChip}>
                    <Text style={styles.hashtagText}>{hashtag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Images Preview */}
          {images.length > 0 && (
            <View style={styles.imagesContainer}>
              <Text style={styles.imagesLabel}>Photos ({images.length}/4):</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.imagesScroll}
              >
                {images.map((image, index) => (
                  <View key={index} style={styles.imageItem}>
                    <Image source={{ uri: image.uri }} style={styles.previewImage} />
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

          {/* Suggested Actions */}
          <View style={styles.suggestedActions}>
            <Text style={styles.suggestedActionsLabel}>Make your post more engaging:</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="hash" size={18} color={colors.primary} />
                <Text style={styles.actionButtonText}>Add hashtags</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Icon name="at-sign" size={18} color={colors.primary} />
                <Text style={styles.actionButtonText}>Mention someone</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Toolbar */}
        <View style={styles.toolbar}>
          <TouchableOpacity 
            style={[styles.toolbarButton, images.length >= 4 && styles.toolbarButtonDisabled]}
            onPress={showImagePicker}
            disabled={images.length >= 4}
          >
            <Icon name="image" size={24} color={images.length >= 4 ? colors.gray400 : colors.primary} />
            <Text style={[styles.toolbarButtonText, images.length >= 4 && styles.toolbarButtonTextDisabled]}>
              Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton}>
            <Icon name="file-text" size={24} color={colors.primary} />
            <Text style={styles.toolbarButtonText}>Document</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton}>
            <Icon name="map-pin" size={24} color={colors.primary} />
            <Text style={styles.toolbarButtonText}>Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolbarButton}>
            <Icon name="smile" size={24} color={colors.primary} />
            <Text style={styles.toolbarButtonText}>Feeling</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner 
            size="large" 
            color={colors.primary}
            text="Posting..."
          />
        </View>
      )}
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
    backgroundColor: colors.white,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  postButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
  },
  userType: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  textInput: {
    fontSize: 16,
    color: colors.gray800,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  hashtagsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  hashtagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 8,
  },
  hashtagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hashtagChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  hashtagText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  imagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  imagesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 12,
  },
  imagesScroll: {
    flexDirection: 'row',
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedActions: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  suggestedActionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.white,
  },
  toolbarButton: {
    alignItems: 'center',
    padding: 8,
    flex: 1,
  },
  toolbarButtonDisabled: {
    opacity: 0.5,
  },
  toolbarButtonText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  toolbarButtonTextDisabled: {
    color: colors.gray400,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CreatePostScreen;