// web/src/pages/post/CreatePostPage.js - COMPLETE FIXED VERSION
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Image, 
  FileText, 
  Hash, 
  Users, 
  Eye,
  Send,
  Plus,
  X,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { createPost } from '../../store/slices/postSlice';
import mediaService from '../../services/mediaService';

const CreatePostContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  
  h1 {
    color: ${props => props.theme.colors.textPrimary};
    font-size: 1.8rem;
  }
`;

const BackButton = styled.button`
  background: none;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  padding: 10px;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const CreatePostCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.gray200};
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
`;

const AuthorDetails = styled.div`
  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 2px;
  }
  
  .type {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.gray600};
    display: flex;
    align-items: center;
    gap: 5px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 12px 15px;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const TextArea = styled.textarea`
  padding: 15px;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 200px;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const PostTypeSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const PostTypeButton = styled.button`
  flex: 1;
  padding: 12px;
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : props.theme.colors.gray200};
  background: ${props => props.selected ? props.theme.colors.primary + '15' : 'white'};
  color: ${props => props.selected ? props.theme.colors.primary : props.theme.colors.gray600};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Tag = styled.span`
  background: ${props => props.theme.colors.primary}15;
  color: ${props => props.theme.colors.primary};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 4px;
  
  button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
  }
`;

const CharacterCount = styled.div`
  text-align: right;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.gray500};
  margin-top: 5px;
`;

const ActionsSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.colors.gray200};
`;

const SecondaryActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: none;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  padding: 10px 15px;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray400};
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: ${props => props.theme.colors.gray400};
    cursor: not-allowed;
    transform: none;
  }
`;

const PreviewCard = styled.div`
  background: ${props => props.theme.colors.gray50};
  border: 1px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  
  .preview-title {
    font-weight: 600;
    margin-bottom: 10px;
    color: ${props => props.theme.colors.textPrimary};
  }
  
  .preview-content {
    color: ${props => props.theme.colors.gray700};
    line-height: 1.6;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 10px;
`;

const ImagePreview = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    border: 2px solid #e9ecef;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #c82333;
  }
`;

const ImageSize = styled.div`
  position: absolute;
  bottom: 5px;
  left: 5px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
`;

const UploadStatus = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  
  .progress-fill {
    height: 100%;
    background: ${props => props.theme.colors.primary};
    transition: width 0.3s ease;
    width: ${props => props.progress}%;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadMethodSelector = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: ${props => props.theme.colors.gray600};
  margin-top: 5px;
`;

const MethodBadge = styled.span`
  background: ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray200};
  color: ${props => props.active ? 'white' : props.theme.colors.gray600};
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.danger}15;
  border: 1px solid ${props => props.theme.colors.danger};
  color: ${props => props.theme.colors.danger};
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CreatePostPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.posts);
  
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    type: 'discussion',
    tags: [],
    visibility: 'public',
    media_urls: []
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [s3Available, setS3Available] = useState(false);
  
  // File input ref for image upload
  const fileInputRef = useRef(null);

  // FIXED: Check S3 availability on component mount - PROPER STATE SYNC
  React.useEffect(() => {
    const checkS3Availability = async () => {
      try {
        console.log('🔧 CreatePostPage: Checking S3 availability...');
        
        // Initialize S3 and get actual status
        const isAvailable = await mediaService.initializeS3();
        
        console.log('🔧 CreatePostPage: S3 initialized, available:', isAvailable);
        console.log('🔧 CreatePostPage: MediaService S3 check:', mediaService.isS3Available());
        
        // Use the actual S3 status from mediaService
        const s3Status = mediaService.isS3Available();
        setS3Available(s3Status);
        
        if (s3Status) {
          console.log('✅ CreatePostPage: S3 available, using S3 upload');
        } else {
          console.log('❌ CreatePostPage: S3 not available, using local upload');
        }
        
      } catch (error) {
        console.log('❌ CreatePostPage: S3 check failed, using local upload:', error);
        setS3Available(false);
      }
    };
    
    checkS3Availability();
  }, []);

  const postTypes = [
    { id: 'discussion', label: 'Discussion', icon: Users },
    { id: 'article', label: 'Article', icon: FileText },
    { id: 'case-study', label: 'Case Study', icon: Eye }
  ];

  const handleInputChange = (field, value) => {
    setPostData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !postData.tags.includes(currentTag.trim())) {
      setPostData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setPostData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle image upload
  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  // FIXED: Enhanced file change handler with proper upload logic
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setUploadErrors([]);
    
    try {
      const imageFiles = [];
      
      for (const file of files) {
        // FIXED: Safe validation with fallback
        let validation;
        
        try {
          // Check if mediaService has validation methods
          if (mediaService && typeof mediaService.validateImage === 'function') {
            validation = mediaService.validateImage(file, 'image');
          } else if (mediaService && typeof mediaService.validateFile === 'function') {
            validation = mediaService.validateFile(file, 'image');
          } else {
            // Fallback validation
            console.warn('MediaService validation methods not found, using fallback');
            validation = {
              valid: file && 
                     file.type && 
                     file.type.startsWith('image/') && 
                     file.size <= 10 * 1024 * 1024,
              errors: []
            };
            
            if (!validation.valid) {
              if (!file.type || !file.type.startsWith('image/')) {
                validation.errors.push('Invalid file type. Please select an image file.');
              }
              if (file.size > 10 * 1024 * 1024) {
                validation.errors.push('File size too large. Maximum 10MB allowed.');
              }
            }
          }
        } catch (validationError) {
          console.error('Validation error:', validationError);
          validation = {
            valid: false,
            errors: ['File validation failed']
          };
        }
          
        const imageId = Math.random().toString(36).substr(2, 9);
        
        // Safe preview URL creation
        let previewUrl = null;
        try {
          if (mediaService && typeof mediaService.createPreviewUrl === 'function') {
            previewUrl = mediaService.createPreviewUrl(file);
          } else {
            previewUrl = URL.createObjectURL(file);
          }
        } catch (previewError) {
          console.error('Preview URL creation failed:', previewError);
          previewUrl = null;
        }
        
        const imageFile = {
          file,
          id: imageId,
          name: file.name,
          size: file.size,
          previewUrl,
          progress: 0,
          status: validation.valid ? 'pending' : 'error',
          error: validation.valid ? null : (validation.errors && validation.errors[0]) || 'Validation failed',
          uploaded: false,
          url: null
        };
        
        imageFiles.push(imageFile);
      }
      
      setSelectedImages(prev => [...prev, ...imageFiles]);
      
      // FIXED: Upload images one by one with proper error handling
      for (const imageFile of imageFiles) {
        if (imageFile.status === 'error') {
          console.log(`⏭️ Skipping invalid file: ${imageFile.name}`);
          continue;
        }
        
        try {
          console.log(`🔄 Processing image: ${imageFile.name}`);
          
          // Update status to uploading
          setSelectedImages(prev => prev.map(img => 
            img.id === imageFile.id ? { ...img, status: 'uploading' } : img
          ));
          
          // FIXED: Use uploadPostMedia for consistent upload
          console.log('📤 Uploading single image for post...');
          const uploadResult = await mediaService.uploadPostMedia([imageFile.file], (progress) => {
            console.log(`📊 Upload progress for ${imageFile.name}: ${progress}%`);
            setSelectedImages(prev => prev.map(img => 
              img.id === imageFile.id ? { ...img, progress } : img
            ));
          });
          
          console.log('✅ Upload result:', uploadResult);
          
          // FIXED: Handle different response formats with comprehensive extraction
          let finalResult = uploadResult;
          if (uploadResult.uploaded_files && uploadResult.uploaded_files.length > 0) {
            finalResult = uploadResult.uploaded_files[0];
          } else if (uploadResult.media_files && uploadResult.media_files.length > 0) {
            finalResult = uploadResult.media_files[0];
          } else if (uploadResult.files && uploadResult.files.length > 0) {
            finalResult = { url: uploadResult.files[0] };
          } else if (uploadResult.data) {
            if (Array.isArray(uploadResult.data) && uploadResult.data.length > 0) {
              finalResult = uploadResult.data[0];
            } else if (uploadResult.data.files && uploadResult.data.files.length > 0) {
              finalResult = uploadResult.data.files[0];
            }
          }
          
          // Extract URL from various possible formats
          const imageUrl = finalResult.url || 
                          finalResult.file_url || 
                          finalResult.media_url ||
                          uploadResult.url ||
                          uploadResult.file_url ||
                          (uploadResult.media_urls && uploadResult.media_urls[0]) ||
                          (uploadResult.files && uploadResult.files[0]);
          
          console.log('🔍 Extracted image URL:', imageUrl);
          
          if (!imageUrl) {
            console.error('❌ No URL found in upload result:', uploadResult);
            throw new Error('No URL returned from upload');
          }
          
          // Update with success
          setSelectedImages(prev => prev.map(img => 
            img.id === imageFile.id ? { 
              ...img, 
              status: 'success', 
              progress: 100,
              uploaded: true,
              url: imageUrl
            } : img
          ));
          
          // Add to post media URLs
          setPostData(prev => ({
            ...prev,
            media_urls: [...prev.media_urls, imageUrl]
          }));
          
          console.log('✅ Image upload completed successfully:', imageUrl);
          
        } catch (error) {
          console.error('❌ Image upload failed:', error);
          
          // Update with error
          setSelectedImages(prev => prev.map(img => 
            img.id === imageFile.id ? { 
              ...img, 
              status: 'error',
              error: error.message || 'Upload failed'
            } : img
          ));
          
          setUploadErrors(prev => [...prev, `${imageFile.name}: ${error.message || 'Upload failed'}`]);
        }
      }

    } catch (error) {
      console.error('Error processing images:', error);
      setUploadErrors(['Failed to process images. Please try again.']);
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };

  const handleRemoveImage = (imageId) => {
    setSelectedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        // Revoke preview URL
        if (imageToRemove.previewUrl) {
          if (mediaService && typeof mediaService.revokePreviewUrl === 'function') {
            mediaService.revokePreviewUrl(imageToRemove.previewUrl);
          } else {
            URL.revokeObjectURL(imageToRemove.previewUrl);
          }
        }
        
        // Remove from media_urls if uploaded
        if (imageToRemove.uploaded && imageToRemove.url) {
          setPostData(current => ({
            ...current,
            media_urls: current.media_urls.filter(url => url !== imageToRemove.url)
          }));
        }
      }
      
      return prev.filter(img => img.id !== imageId);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postData.content.trim()) {
      alert('Please enter some content for your post');
      return;
    }

    // Check if any images are still uploading
    const uploadingCount = selectedImages.filter(img => img.status === 'uploading').length;
    if (uploadingCount > 0) {
      alert('Please wait for all images to finish uploading');
      return;
    }

    try {
      const postPayload = {
        content: postData.content,
        hashtags: postData.tags,
        media_urls: postData.media_urls
      };

      console.log('🚀 Sending post payload:', postPayload);
      console.log('📊 Media URLs count:', postPayload.media_urls.length);
      
      await dispatch(createPost(postPayload)).unwrap();
      
      // Clean up image URLs
      selectedImages.forEach(image => {
        if (image.previewUrl) {
          if (mediaService && typeof mediaService.revokePreviewUrl === 'function') {
            mediaService.revokePreviewUrl(image.previewUrl);
          } else {
            URL.revokeObjectURL(image.previewUrl);
          }
        }
      });
      
      navigate('/feed');
    } catch (error) {
      console.error('Failed to create post:', error);
      const errorMessage = error.message || 'Failed to create post. Please try again.';
      alert(`Post creation failed: ${errorMessage}`);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const getUploadStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <Upload size={12} />;
      case 'success':
        return <CheckCircle size={12} />;
      case 'error':
        return <AlertCircle size={12} />;
      default:
        return null;
    }
  };

  const getUploadStatusText = (image) => {
    switch (image.status) {
      case 'uploading':
        return `Uploading... ${image.progress}%`;
      case 'success':
        return 'Uploaded';
      case 'error':
        return 'Failed';
      default:
        return '';
    }
  };

  return (
    <CreatePostContainer>
      <Header>
        <BackButton onClick={() => navigate('/feed')}>
          <ArrowLeft size={20} />
        </BackButton>
        <h1>Create New Post</h1>
      </Header>

      <CreatePostCard>
        <AuthorInfo>
          <Avatar>
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              getInitials(user?.full_name || user?.username)
            )}
          </Avatar>
          <AuthorDetails>
            <div className="name">{user?.full_name || user?.username}</div>
            <div className="type">
              {user?.user_type === 'doctor' ? '👨‍⚕️' : '🎓'} 
              {user?.specialty || user?.college || user?.user_type?.toUpperCase()}
            </div>
          </AuthorDetails>
        </AuthorInfo>

        <Form onSubmit={handleSubmit}>
          <PostTypeSelector>
            {postTypes.map(type => {
              const Icon = type.icon;
              return (
                <PostTypeButton
                  key={type.id}
                  type="button"
                  selected={postData.type === type.id}
                  onClick={() => handleInputChange('type', type.id)}
                >
                  <Icon size={16} />
                  {type.label}
                </PostTypeButton>
              );
            })}
          </PostTypeSelector>

          <InputGroup>
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              type="text"
              placeholder="Give your post a title..."
              value={postData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              maxLength={200}
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="content">Content *</Label>
            <TextArea
              id="content"
              placeholder="Share your thoughts, ask a question, or start a discussion..."
              value={postData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              maxLength={5000}
              required
            />
            <CharacterCount>
              {postData.content.length}/5000 characters
            </CharacterCount>
          </InputGroup>

          <InputGroup>
            <Label htmlFor="tags">Tags</Label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                id="tags"
                type="text"
                placeholder="Add a tag and press Enter"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                style={{ flex: 1 }}
              />
              <ActionButton type="button" onClick={handleAddTag}>
                <Plus size={16} />
              </ActionButton>
            </div>
            <TagsContainer>
              {postData.tags.map(tag => (
                <Tag key={tag}>
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    <X size={12} />
                  </button>
                </Tag>
              ))}
            </TagsContainer>
          </InputGroup>

          {/* Hidden File Input */}
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />

          {/* Selected Images Display */}
          {selectedImages.length > 0 && (
            <InputGroup>
              <Label>Selected Images ({selectedImages.length})</Label>
              <UploadMethodSelector>
                <span>Upload method:</span>
                <MethodBadge active={s3Available}>
                  {s3Available ? 'AWS S3 (Mumbai)' : 'Local Upload'}
                </MethodBadge>
                {s3Available && <span>✨ Optimized & Fast</span>}
              </UploadMethodSelector>
              
              <ImageGrid>
                {selectedImages.map(image => (
                  <ImagePreview key={image.id}>
                    <img src={image.previewUrl} alt={image.name} />
                    
                    <RemoveImageButton onClick={() => handleRemoveImage(image.id)}>
                      <X size={12} />
                    </RemoveImageButton>
                    
                    {image.status !== 'pending' && (
                      <UploadStatus>
                        {getUploadStatusIcon(image.status)}
                        {getUploadStatusText(image)}
                      </UploadStatus>
                    )}
                    
                    {image.status === 'uploading' && (
                      <ProgressBar progress={image.progress}>
                        <div className="progress-fill" />
                      </ProgressBar>
                    )}
                    
                    <ImageSize>
                      {(image.size / 1024 / 1024).toFixed(1)}MB
                    </ImageSize>
                  </ImagePreview>
                ))}
              </ImageGrid>
              
              {uploadErrors.length > 0 && (
                <div>
                  {uploadErrors.map((error, index) => (
                    <ErrorMessage key={index}>
                      <AlertCircle size={14} />
                      {error}
                    </ErrorMessage>
                  ))}
                </div>
              )}
            </InputGroup>
          )}

          {showPreview && (
            <PreviewCard>
              <div className="preview-title">
                <strong>Preview:</strong>
              </div>
              <div className="preview-content">
                {postData.title && <h3>{postData.title}</h3>}
                <p>{postData.content}</p>
                
                {/* Image Preview */}
                {selectedImages.filter(img => img.status === 'success').length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <ImageGrid>
                      {selectedImages
                        .filter(img => img.status === 'success')
                        .map(image => (
                          <div key={image.id}>
                            <img 
                              src={image.url || image.previewUrl} 
                              alt={image.name}
                              style={{ 
                                width: '100%', 
                                height: '150px', 
                                objectFit: 'cover', 
                                borderRadius: '8px' 
                              }} 
                            />
                          </div>
                        ))}
                    </ImageGrid>
                  </div>
                )}
                
                {postData.tags.length > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    {postData.tags.map(tag => (
                      <span key={tag} style={{ 
                        color: '#0066CC', 
                        marginRight: '8px',
                        fontSize: '0.9rem'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </PreviewCard>
          )}

          <ActionsSection>
            <SecondaryActions>
              <ActionButton 
                type="button" 
                onClick={handleImageUpload}
                disabled={uploadingImages}
              >
                <Image size={16} />
                {uploadingImages ? 'Uploading...' : 'Add Images'}
              </ActionButton>
              <ActionButton 
                type="button" 
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye size={16} />
                {showPreview ? 'Hide' : 'Show'} Preview
              </ActionButton>
            </SecondaryActions>

            <SubmitButton 
              type="submit" 
              disabled={
                loading || 
                !postData.content.trim() || 
                selectedImages.some(img => img.status === 'uploading')
              }
            >
              {loading ? (
                'Publishing...'
              ) : (
                <>
                  <Send size={16} />
                  Publish Post
                </>
              )}
            </SubmitButton>
          </ActionsSection>
        </Form>
      </CreatePostCard>
    </CreatePostContainer>
  );
};

export default CreatePostPage;