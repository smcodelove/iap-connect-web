// web/src/pages/profile/EditProfilePage.js - UPDATED WITH REAL AVATAR UPLOAD
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Camera, 
  User, 
  Mail, 
  FileText,
  Stethoscope,
  GraduationCap,
  AlertCircle,
  Upload,
  Loader,
  CheckCircle
} from 'lucide-react';

import { updateUser } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import mediaService from '../../services/mediaService';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid ${props => props.theme.colors.gray200};
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray600};
  font-size: 1rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.primary};
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.gray800};
  margin: 0;
  font-size: 1.8rem;
`;

const Form = styled.form`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  margin-bottom: 30px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.gray800};
  margin-bottom: 20px;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
`;

const AvatarContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: bold;
  position: relative;
  overflow: hidden;
  border: 3px solid ${props => props.theme.colors.gray200};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  font-size: 12px;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const AvatarUpload = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${props => props.uploading ? props.theme.colors.gray400 : props.theme.colors.primary};
  border: none;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: ${props => props.uploading ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    transform: none;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadProgress = styled.div`
  background: ${props => props.theme.colors.gray100};
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  min-width: 200px;
  
  .progress-bar {
    background: ${props => props.theme.colors.gray200};
    height: 4px;
    border-radius: 2px;
    overflow: hidden;
    margin-top: 8px;
    
    .progress-fill {
      background: ${props => props.theme.colors.primary};
      height: 100%;
      transition: width 0.3s ease;
    }
  }
  
  .progress-text {
    font-size: 12px;
    color: ${props => props.theme.colors.gray600};
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${props => props.theme.colors.gray700};
  font-size: 0.9rem;
  
  .required {
    color: ${props => props.theme.colors.danger};
    margin-left: 4px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.error ? props.theme.colors.danger : props.theme.colors.gray300};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? props.theme.colors.danger : props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.error ? 
      props.theme.colors.danger + '20' : 
      props.theme.colors.primary + '20'};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props => props.error ? props.theme.colors.danger : props.theme.colors.gray300};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? props.theme.colors.danger : props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.error ? 
      props.theme.colors.danger + '20' : 
      props.theme.colors.primary + '20'};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${props => props.theme.colors.danger};
  font-size: 0.85rem;
  margin-top: 6px;
`;

const CharCount = styled.div`
  text-align: right;
  font-size: 0.85rem;
  color: ${props => props.over ? props.theme.colors.danger : props.theme.colors.gray500};
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid;
  min-width: 120px;
  
  ${props => props.variant === 'primary' && `
    background: ${props.theme.colors.primary};
    border-color: ${props.theme.colors.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${props.theme.colors.primaryDark};
      border-color: ${props.theme.colors.primaryDark};
      transform: translateY(-1px);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: white;
    border-color: ${props.theme.colors.gray300};
    color: ${props.theme.colors.gray700};
    
    &:hover:not(:disabled) {
      background: ${props.theme.colors.gray50};
      border-color: ${props.theme.colors.gray400};
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuccessMessage = styled.div`
  background: ${props => props.theme.colors.success}20;
  border: 1px solid ${props => props.theme.colors.success};
  color: ${props => props.theme.colors.success};
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EditProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    specialty: '',
    college: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Initialize form data
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        bio: user.bio || '',
        specialty: user.specialty || '',
        college: user.college || ''
      });
    }
  }, [user]);

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Clear success message
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }
    
    // Bio validation
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }
    
    // User type specific validations
    if (user?.user_type === 'doctor') {
      if (!formData.specialty.trim()) {
        newErrors.specialty = 'Specialty is required for doctors';
      }
    }
    
    if (user?.user_type === 'student') {
      if (!formData.college.trim()) {
        newErrors.college = 'College is required for students';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle avatar upload
  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = mediaService.validateFile(file, 'avatar');
    if (!validation.isValid) {
      setErrors({ ...errors, avatar: validation.errors[0] });
      return;
    }

    try {
      setUploadingAvatar(true);
      setUploadProgress(0);
      setErrors({ ...errors, avatar: '' });

      // Create preview
      const previewUrl = mediaService.createPreviewUrl(file);
      setAvatarPreview(previewUrl);

      console.log('📤 Uploading avatar...', validation.fileInfo);

      // Upload avatar
      const result = await mediaService.uploadAvatar(file, (progress) => {
        setUploadProgress(progress);
      });

      console.log('✅ Avatar uploaded successfully:', result);

      // Update user in Redux store
      const updatedUser = { 
        ...user, 
        profile_picture_url: result.url,
        avatar_url: result.url // For compatibility
      };
      
      dispatch(updateUser(updatedUser));
      
      // Update authService user data
      authService.setUserData(updatedUser);
      
      setSuccessMessage('Avatar updated successfully!');
      
      // Clean up preview URL
      if (previewUrl) {
        mediaService.revokePreviewUrl(previewUrl);
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('❌ Avatar upload failed:', error);
      setErrors({ ...errors, avatar: error.message || 'Failed to upload avatar' });
      
      // Clean up preview on error
      if (avatarPreview) {
        mediaService.revokePreviewUrl(avatarPreview);
        setAvatarPreview(null);
      }
    } finally {
      setUploadingAvatar(false);
      setUploadProgress(0);
      // Reset file input
      event.target.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log('💾 Updating profile...', formData);
      
      // Prepare update data
      const updateData = {
        full_name: formData.full_name.trim(),
        bio: formData.bio.trim()
      };
      
      // Add user-type specific fields
      if (user?.user_type === 'doctor' && formData.specialty) {
        updateData.specialty = formData.specialty.trim();
      } else if (user?.user_type === 'student' && formData.college) {
        updateData.college = formData.college.trim();
      }
      
      // TODO: Replace with actual API call
      // const response = await authService.updateProfile(updateData);
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update Redux state
      const updatedUser = { ...user, ...updateData };
      dispatch(updateUser(updatedUser));
      
      // Update authService user data
      authService.setUserData(updatedUser);
      
      setSuccessMessage('Profile updated successfully!');
      
      // Auto redirect after success
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      setErrors({ submit: error.message || 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Get user initials
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  if (!user) {
    return (
      <Container>
        <div>Loading...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
          Back to Profile
        </BackButton>
        <Title>Edit Profile</Title>
      </Header>

      <Form onSubmit={handleSubmit}>
        {successMessage && (
          <SuccessMessage>
            <CheckCircle size={16} />
            {successMessage}
          </SuccessMessage>
        )}

        {/* Profile Picture Section */}
        <Section>
          <SectionTitle>
            <Camera size={20} />
            Profile Picture
          </SectionTitle>
          <AvatarContainer>
            <Avatar>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" />
              ) : user.profile_picture_url || user.avatar_url ? (
                <img 
                  src={user.profile_picture_url || user.avatar_url} 
                  alt={user.full_name}
                />
              ) : (
                getInitials(user.full_name || user.username)
              )}
              <UploadOverlay show={uploadingAvatar}>
                <Loader size={20} />
              </UploadOverlay>
            </Avatar>
            
            <AvatarUpload 
              type="button" 
              onClick={handleAvatarUpload}
              disabled={uploadingAvatar}
              uploading={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <>
                  <Loader size={16} />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera size={16} />
                  Change Photo
                </>
              )}
            </AvatarUpload>
            
            {uploadingAvatar && (
              <UploadProgress>
                <div className="progress-text">
                  <Upload size={12} />
                  Uploading avatar... {uploadProgress}%
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </UploadProgress>
            )}
            
            {errors.avatar && (
              <ErrorMessage>
                <AlertCircle size={14} />
                {errors.avatar}
              </ErrorMessage>
            )}
          </AvatarContainer>
          
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
          />
        </Section>

        {/* Basic Information */}
        <Section>
          <SectionTitle>
            <User size={20} />
            Basic Information
          </SectionTitle>
          
          <FormGroup>
            <Label htmlFor="full_name">
              Full Name <span className="required">*</span>
            </Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              error={errors.full_name}
            />
            {errors.full_name && (
              <ErrorMessage>
                <AlertCircle size={14} />
                {errors.full_name}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="bio">Bio</Label>
            <TextArea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              error={errors.bio}
              maxLength={500}
            />
            <CharCount over={formData.bio.length > 500}>
              {formData.bio.length}/500 characters
            </CharCount>
            {errors.bio && (
              <ErrorMessage>
                <AlertCircle size={14} />
                {errors.bio}
              </ErrorMessage>
            )}
          </FormGroup>
        </Section>

        {/* Professional Information */}
        <Section>
          <SectionTitle>
            {user.user_type === 'doctor' ? <Stethoscope size={20} /> : <GraduationCap size={20} />}
            Professional Information
          </SectionTitle>
          
          {user.user_type === 'doctor' && (
            <FormGroup>
              <Label htmlFor="specialty">
                Medical Specialty <span className="required">*</span>
              </Label>
              <Input
                id="specialty"
                type="text"
                value={formData.specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
                placeholder="e.g., Cardiology, Pediatrics, Surgery"
                error={errors.specialty}
              />
              {errors.specialty && (
                <ErrorMessage>
                  <AlertCircle size={14} />
                  {errors.specialty}
                </ErrorMessage>
              )}
            </FormGroup>
          )}

          {user.user_type === 'student' && (
            <FormGroup>
              <Label htmlFor="college">
                Medical College <span className="required">*</span>
              </Label>
              <Input
                id="college"
                type="text"
                value={formData.college}
                onChange={(e) => handleInputChange('college', e.target.value)}
                placeholder="e.g., Harvard Medical School"
                error={errors.college}
              />
              {errors.college && (
                <ErrorMessage>
                  <AlertCircle size={14} />
                  {errors.college}
                </ErrorMessage>
              )}
            </FormGroup>
          )}
        </Section>

        {errors.submit && (
          <ErrorMessage style={{ marginBottom: '20px' }}>
            <AlertCircle size={16} />
            {errors.submit}
          </ErrorMessage>
        )}

        <ButtonGroup>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => navigate('/profile')}
            disabled={loading || uploadingAvatar}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading || uploadingAvatar}
          >
            {loading ? (
              <>
                <Loader size={16} />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default EditProfilePage;