// screens/profile/EditProfileScreen.js
/**
 * EditProfileScreen component allows users to update their profile information
 * Includes form validation and image upload functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Save, 
  Camera, 
  X,
  User,
  Mail,
  FileText,
  Stethoscope,
  GraduationCap
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { colors, typography } from '../../styles';
import { userService } from '../../services/userService';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';

const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.user);
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    specialty: '',
    college: '',
    profile_picture_url: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || '',
        bio: currentUser.bio || '',
        specialty: currentUser.specialty || '',
        college: currentUser.college || '',
        profile_picture_url: currentUser.profile_picture_url || ''
      });
    }
  }, [currentUser]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }
    
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
    if (currentUser?.user_type === 'doctor' && !formData.specialty.trim()) {
      newErrors.specialty = 'Specialty is required for doctors';
    }
    
    if (currentUser?.user_type === 'student' && !formData.college.trim()) {
      newErrors.college = 'College is required for students';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const updateData = {
        full_name: formData.full_name.trim(),
        bio: formData.bio.trim(),
        profile_picture_url: formData.profile_picture_url
      };
      
      // Add specialty or college based on user type
      if (currentUser?.user_type === 'doctor') {
        updateData.specialty = formData.specialty.trim();
      } else if (currentUser?.user_type === 'student') {
        updateData.college = formData.college.trim();
      }
      
      const updatedUser = await userService.updateProfile(updateData);
      
      // Update Redux store
      dispatch(updateUser(updatedUser));
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => pickImage('camera')
        },
        {
          text: 'Photo Library',
          onPress: () => pickImage('library')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const pickImage = async (source) => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant permission to access photos');
        return;
      }

      let result;
      if (source === 'camera') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert('Permission required', 'Please grant permission to access camera');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        await uploadProfilePicture(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadProfilePicture = async (imageAsset) => {
    try {
      setUploadingImage(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'profile-picture.jpg'
      });
      
      const response = await userService.uploadAvatar(formData);
      
      // Update local form data with new image URL
      setFormData(prev => ({
        ...prev,
        profile_picture_url: response.file_url
      }));
      
      Alert.alert('Success', 'Profile picture uploaded successfully!');
      
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const renderProfilePicture = () => (
    <View style={styles.profilePictureSection}>
      <Text style={styles.sectionTitle}>Profile Picture</Text>
      <View style={styles.avatarContainer}>
        <Avatar
          uri={formData.profile_picture_url}
          size={100}
          name={formData.full_name}
          showBorder={true}
          borderColor={colors.primary}
          borderWidth={3}
        />
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleImagePicker}
          disabled={uploadingImage}
        >
          <Camera size={20} color={colors.white} />
        </TouchableOpacity>
        {uploadingImage && (
          <View style={styles.uploadingOverlay}>
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderBasicInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <Input
        label="Full Name"
        value={formData.full_name}
        onChangeText={(value) => handleInputChange('full_name', value)}
        placeholder="Enter your full name"
        icon={<User size={20} color={colors.gray600} />}
        error={errors.full_name}
        maxLength={100}
        required
      />
      
      <Input
        label="Email"
        value={currentUser?.email || ''}
        placeholder="Email address"
        icon={<Mail size={20} color={colors.gray600} />}
        editable={false}
        style={styles.disabledInput}
      />
      
      <Input
        label="Bio"
        value={formData.bio}
        onChangeText={(value) => handleInputChange('bio', value)}
        placeholder="Tell us about yourself..."
        icon={<FileText size={20} color={colors.gray600} />}
        multiline={true}
        numberOfLines={4}
        maxLength={500}
        error={errors.bio}
        showCharCount={true}
      />
    </View>
  );

  const renderProfessionalInfo = () => {
    if (currentUser?.user_type === 'doctor') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          
          <Input
            label="Specialty"
            value={formData.specialty}
            onChangeText={(value) => handleInputChange('specialty', value)}
            placeholder="e.g., Cardiology, Pediatrics, Surgery"
            icon={<Stethoscope size={20} color={colors.gray600} />}
            error={errors.specialty}
            maxLength={100}
            required
          />
        </View>
      );
    }
    
    if (currentUser?.user_type === 'student') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educational Information</Text>
          
          <Input
            label="College/University"
            value={formData.college}
            onChangeText={(value) => handleInputChange('college', value)}
            placeholder="e.g., AIIMS Delhi, JIPMER"
            icon={<GraduationCap size={20} color={colors.gray600} />}
            error={errors.college}
            maxLength={100}
            required
          />
        </View>
      );
    }
    
    return null;
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <Button
        title="Cancel"
        onPress={() => navigation.goBack()}
        variant="secondary"
        style={styles.cancelButton}
      />
      <Button
        title="Save Changes"
        onPress={handleSave}
        loading={loading}
        variant="primary"
        icon={<Save size={16} color={colors.white} />}
        style={styles.saveButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <X size={24} color={colors.gray700} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderProfilePicture()}
          {renderBasicInfo()}
          {renderProfessionalInfo()}
          
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {renderActionButtons()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...typography.h3,
    fontWeight: 'bold',
    color: colors.gray900,
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profilePictureSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginTop: 12,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: colors.primary,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  sectionTitle: {
    ...typography.h3,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 16,
  },
  disabledInput: {
    backgroundColor: colors.gray100,
    color: colors.gray500,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: colors.gray200,
  },
  saveButton: {
    flex: 2,
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
};

export default EditProfileScreen;