// web/src/components/common/ImageUpload.js
/**
 * Image Upload Component - Images Only
 * Supports drag & drop, preview, and progress tracking
 */

import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { FiUpload, FiX, FiImage, FiCheck, FiAlertCircle } from 'react-icons/fi';
import mediaService from '../../services/mediaService';

const UploadContainer = styled.div`
  border: 2px dashed ${props => 
    props.isDragOver ? props.theme.colors.primary : 
    props.hasError ? props.theme.colors.danger : 
    props.theme.colors.border
  };
  border-radius: 12px;
  padding: 32px;
  background: ${props => 
    props.isDragOver ? `${props.theme.colors.primary}08` : 
    props.theme.colors.background
  };
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}05;
  }

  ${props => props.disabled && `
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  `}

  ${props => props.compact && `
    padding: 16px;
    
    .upload-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
    
    .upload-text {
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .upload-subtext {
      font-size: 12px;
      margin-bottom: 8px;
    }
  `}
`;

const UploadIcon = styled.div`
  font-size: 48px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 16px;
`;

const UploadText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 8px;
`;

const UploadSubtext = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 16px;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 20px;
`;

const ImageItem = styled.div`
  position: relative;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
  background: ${props => props.theme.colors.background};
  aspect-ratio: 1;
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 120px;
  background: ${props => props.theme.colors.backgroundSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder-icon {
    font-size: 32px;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const ImageInfo = styled.div`
  padding: 8px;
  background: ${props => props.theme.colors.background};
`;

const ImageName = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ImageSize = styled.div`
  font-size: 10px;
  color: ${props => props.theme.colors.textSecondary};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 3px;
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;

  .progress-fill {
    height: 100%;
    background: ${props => props.theme.colors.primary};
    border-radius: 2px;
    transition: width 0.3s ease;
    width: ${props => props.progress}%;
  }
`;

const StatusIcon = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  background: ${props => 
    props.status === 'success' ? props.theme.colors.success : 
    props.status === 'error' ? props.theme.colors.danger : 
    props.theme.colors.primary
  };
  color: white;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 6px;
  left: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${ImageItem}:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba(255, 0, 0, 0.8);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  font-size: 12px;
  margin-top: 8px;
  text-align: left;
  padding: 8px;
  background: ${props => props.theme.colors.danger}10;
  border-radius: 4px;
`;

const ImageUpload = ({
  multiple = true,
  maxFiles = 5,
  maxSizeMB = 10,
  onUploadComplete,
  onUploadError,
  onFilesChange,
  disabled = false,
  showPreview = true,
  autoUpload = true,
  variant = 'default', // 'default', 'avatar', 'compact'
  accept = "image/jpeg,image/png,image/webp,image/gif"
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadConfig, setUploadConfig] = useState(null);
  const fileInputRef = useRef(null);

  // Load upload config
  React.useEffect(() => {
    mediaService.getUploadConfig().then(setUploadConfig);
  }, []);

  // Validate image
  const validateImage = (file) => {
    const validation = mediaService.validateImage(file, variant === 'avatar' ? 'avatar' : 'image');
    return validation;
  };

  // Handle file selection
  const handleFiles = useCallback(async (fileList) => {
    if (disabled) return;
    
    const newFiles = Array.from(fileList);
    const totalFiles = images.length + newFiles.length;
    
    if (totalFiles > maxFiles) {
      if (onUploadError) {
        onUploadError(`Maximum ${maxFiles} images allowed`);
      }
      return;
    }

    const processedImages = [];

    for (const file of newFiles) {
      const validation = validateImage(file);
      const imageId = Date.now() + Math.random();
      
      const imageData = {
        id: imageId,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl: null,
        progress: 0,
        status: validation.isValid ? 'pending' : 'error',
        errors: validation.errors,
        uploadResult: null
      };

      // Create preview URL
      if (validation.isValid && showPreview) {
        imageData.previewUrl = mediaService.createPreviewUrl(file);
      }

      processedImages.push(imageData);

      // Auto upload if enabled and file is valid
      if (autoUpload && validation.isValid) {
        uploadImage(imageData);
      }
    }

    const updatedImages = multiple ? [...images, ...processedImages] : processedImages;
    setImages(updatedImages);
    
    if (onFilesChange) {
      onFilesChange(updatedImages);
    }
  }, [images, maxFiles, disabled, autoUpload, showPreview, onFilesChange, onUploadError, multiple]);

  // Upload single image
  const uploadImage = async (imageData) => {
    // Update status to uploading
    updateImageStatus(imageData.id, { status: 'uploading', progress: 0 });

    try {
      let uploadResult;
      
      if (variant === 'avatar') {
        uploadResult = await mediaService.uploadAvatar(imageData.file, (progress) => {
          updateImageStatus(imageData.id, { progress });
        });
      } else {
        uploadResult = await mediaService.uploadImage(imageData.file, (progress) => {
          updateImageStatus(imageData.id, { progress });
        });
      }

      // Update with success
      updateImageStatus(imageData.id, {
        status: 'success',
        progress: 100,
        uploadResult
      });

      if (onUploadComplete) {
        onUploadComplete(uploadResult, imageData);
      }

    } catch (error) {
      updateImageStatus(imageData.id, {
        status: 'error',
        errors: [error.message]
      });

      if (onUploadError) {
        onUploadError(error.message, imageData);
      }
    }
  };

  // Update image status
  const updateImageStatus = (imageId, updates) => {
    setImages(prevImages => 
      prevImages.map(image => 
        image.id === imageId ? { ...image, ...updates } : image
      )
    );
  };

  // Remove image
  const removeImage = (imageId) => {
    const image = images.find(img => img.id === imageId);
    if (image?.previewUrl) {
      mediaService.revokePreviewUrl(image.previewUrl);
    }

    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    
    if (onFilesChange) {
      onFilesChange(updatedImages);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
  };

  // Render status icon
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <FiCheck />;
      case 'error':
        return <FiAlertCircle />;
      default:
        return null;
    }
  };

  const getUploadText = () => {
    switch (variant) {
      case 'avatar':
        return 'Upload Profile Picture';
      case 'compact':
        return 'Add Images';
      default:
        return 'Drop images here or click to browse';
    }
  };

  const getUploadSubtext = () => {
    const maxSize = variant === 'avatar' ? 2 : maxSizeMB;
    const fileText = multiple ? `Max ${maxFiles} files` : '1 file';
    return `${fileText} • JPG, PNG, WebP, GIF • Up to ${maxSize}MB each`;
  };

  return (
    <div>
      <UploadContainer
        isDragOver={isDragOver}
        disabled={disabled}
        compact={variant === 'compact'}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <UploadIcon className="upload-icon">
          <FiUpload />
        </UploadIcon>
        
        <UploadText className="upload-text">
          {getUploadText()}
        </UploadText>
        
        <UploadSubtext className="upload-subtext">
          {getUploadSubtext()}
        </UploadSubtext>

        <HiddenInput
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
        />
      </UploadContainer>

      {showPreview && images.length > 0 && (
        <ImageGrid>
          {images.map((imageData) => (
            <ImageItem key={imageData.id}>
              <ImagePreview>
                {imageData.previewUrl ? (
                  <img src={imageData.previewUrl} alt={imageData.name} />
                ) : (
                  <FiImage className="placeholder-icon" />
                )}
                
                <RemoveButton onClick={() => removeImage(imageData.id)}>
                  <FiX />
                </RemoveButton>

                {imageData.status !== 'pending' && (
                  <StatusIcon status={imageData.status}>
                    {renderStatusIcon(imageData.status)}
                  </StatusIcon>
                )}
              </ImagePreview>

              <ImageInfo>
                <ImageName title={imageData.name}>
                  {imageData.name}
                </ImageName>
                <ImageSize>
                  {mediaService.formatFileSize(imageData.size)}
                </ImageSize>

                {imageData.status === 'uploading' && (
                  <ProgressBar progress={imageData.progress}>
                    <div className="progress-fill" />
                  </ProgressBar>
                )}

                {imageData.errors?.length > 0 && (
                  <ErrorMessage>
                    {imageData.errors[0]}
                  </ErrorMessage>
                )}
              </ImageInfo>
            </ImageItem>
          ))}
        </ImageGrid>
      )}
    </div>
  );
};

export default ImageUpload;