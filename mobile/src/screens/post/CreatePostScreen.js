import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { colors } from '../../utils/constants';
import api from '../../services/api';

export default function CreatePostScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useSelector(state => state.auth.user);

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something in your post!');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Creating new post...');
      
      // Process hashtags
      const hashtagArray = hashtags
        .split(' ')
        .filter(tag => tag.trim())
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

      const postData = {
        content: content.trim(),
        hashtags: hashtagArray,
        media_urls: [] // TODO: Add media upload later
      };

      const response = await api.post('/posts', postData);
      console.log('✅ Post created successfully:', response.data);

      Alert.alert(
        'Success!', 
        'Your post has been shared successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error creating post:', error);
      Alert.alert(
        'Error', 
        'Failed to create post. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() || hashtags.trim()) {
      Alert.alert(
        'Discard Post?',
        'Are you sure you want to discard your post?',
        [
          { text: 'Keep Writing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleCancel}
          >
            <Ionicons name="close" size={24} color={colors.gray600} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Create Post</Text>
          
          <TouchableOpacity 
            style={[
              styles.postButton,
              (!content.trim() || loading) && styles.postButtonDisabled
            ]}
            onPress={handleCreatePost}
            disabled={!content.trim() || loading}
          >
            <Text style={[
              styles.postButtonText,
              (!content.trim() || loading) && styles.postButtonTextDisabled
            ]}>
              {loading ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.full_name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
              <Text style={styles.userType}>
                {user?.user_type || 'ADMIN'} • Posting publicly
              </Text>
            </View>
          </View>

          {/* Post Content Input */}
          <TextInput
            style={styles.contentInput}
            placeholder="What's on your mind? Share your thoughts with the medical community..."
            placeholderTextColor={colors.gray500}
            value={content}
            onChangeText={setContent}
            multiline
            autoFocus
            textAlignVertical="top"
          />

          {/* Hashtags Input */}
          <View style={styles.hashtagSection}>
            <Text style={styles.sectionLabel}>Hashtags (optional)</Text>
            <TextInput
              style={styles.hashtagInput}
              placeholder="MedicalEducation Surgery Innovation"
              placeholderTextColor={colors.gray500}
              value={hashtags}
              onChangeText={setHashtags}
            />
            <Text style={styles.hashtagHint}>
              Separate hashtags with spaces. # will be added automatically.
            </Text>
          </View>

          {/* Post Preview */}
          {(content.trim() || hashtags.trim()) && (
            <View style={styles.previewSection}>
              <Text style={styles.sectionLabel}>Preview</Text>
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewAvatar}>
                    <Text style={styles.previewAvatarText}>
                      {user?.full_name?.charAt(0) || 'U'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.previewName}>
                      {user?.full_name || 'User'}
                    </Text>
                    <Text style={styles.previewType}>
                      {user?.user_type || 'ADMIN'}
                    </Text>
                  </View>
                </View>
                
                {content.trim() && (
                  <Text style={styles.previewContent}>{content}</Text>
                )}
                
                {hashtags.trim() && (
                  <View style={styles.previewHashtags}>
                    {hashtags.split(' ').filter(tag => tag.trim()).map((tag, index) => (
                      <Text key={index} style={styles.previewHashtag}>
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
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
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  postButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: colors.gray500,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 2,
  },
  userType: {
    fontSize: 14,
    color: colors.gray500,
  },
  contentInput: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.gray800,
    minHeight: 150,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  hashtagSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 8,
  },
  hashtagInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.gray800,
    marginBottom: 6,
  },
  hashtagHint: {
    fontSize: 12,
    color: colors.gray500,
    fontStyle: 'italic',
  },
  previewSection: {
    marginTop: 20,
  },
  previewCard: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  previewAvatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray800,
  },
  previewType: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  previewContent: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.gray800,
    marginBottom: 8,
  },
  previewHashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewHashtag: {
    color: colors.primary,
    fontSize: 14,
    marginRight: 8,
    marginBottom: 4,
    fontWeight: '500',
  },
});
