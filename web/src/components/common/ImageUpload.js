// web/src/components/common/ImageUpload.js
/**
 * Image Upload Component with preview, compression, and progress
 * Features: Drag & drop, multiple files, progress tracking, validation
 */

import React, { useState, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  Upload, 
  X, 
  Camera, 
  Image as ImageIcon, 
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { mediaService } from '../../services/api';

const uploadAnimation = keyframes`
  0% { transform: translateY(10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const UploadContainer = styled.div`
  position: relative;
`;

const DropZone = styled.div`
  border: 2px dashed ${props => props.isDragOver ? props.theme.colors.primary : props.theme.colors.gray300};
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: ${props => props.isDragOver ? `${props.theme.colors.primary}10` : props.theme.colors.gray50};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}10;
  }
  
  ${props => props.disabled && `
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      border-color: ${props.theme.colors.gray300};
      background: ${props.theme.colors.gray50};
    }
  `}
`;

const UploadIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${props => props.theme.colors.primary};
`;

const UploadText = styled.div`
  h3 {
    margin: 0 0 8px 0;
    color: ${props => props.theme.colors.gray800};
    font-size: 18px;
    font-weight: 600;
  }
  
  p {
    margin: 0;
    color: ${props => props.theme.colors.gray600};
    font-size: 14px;
  }
`;

const UploadButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid ${props => props.theme.colors.primary};
  background: ${props => props.primary ? props.theme.colors.primary : 'white'};
  color: ${props => props.primary ? 'white' : props.theme.colors.primary};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.primary ? props.theme.colors.primaryDark : props.theme.colors.primary};
    color: white;
    transform: translateY(-1px);
  }
`;

const ImagePreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
  animation: ${uploadAnimation} 0.3s ease;
`;

const ImagePreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: ${props => props.theme.colors.gray100};
  border: 2px solid ${props => props.error ? props.theme.colors.danger : 'transparent'};
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.danger};
    transform: scale(1.1);
  }
`;

const ProgressOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ProgressBar = styled.div`
  width: 80%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.success};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const StatusIcon = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.success ? props.theme.colors.success : props.theme.colors.danger};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.danger};
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ImageUpload = ({
  multiple = true,
  maxFiles = 5,
  maxSizeMB = 10,
  accept = "image/jpeg,image/png,image/gif,image/webp",
  onUploadComplete,
  onUploadError,
  disabled = false,
  showPreview = true,
  variant = 'default' // 'default', 'avatar', 'compact'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [completedFiles, setCompletedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Validate file
  const validateFile = (file) => {
    const errors = [];
    
    // Check file type
    if (!accept.split(',').some(type => file.type.includes(type.trim()))) {
      errors.push('Invalid file type');
    }
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      errors.push(`File size must be less than ${maxSizeMB}MB`);
    }
    
    return errors;
  };

  // Handle file selection
  const handleFiles = useCallback(async (files) => {
    if (disabled) return;
    
    const fileList = Array.from(files);
    const totalFiles = completedFiles.length + fileList.length;
    
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    for (const file of fileList) {
      const errors = validateFile(file);
      
      if (errors.length > 0) {
        if (onUploadError) {
          onUploadError(file.name, errors[0]);
        }
        continue;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      const fileId = Date.now() + Math.random();
      
      // Add to uploading files
      setUploadingFiles(prev => [...prev, {
        id: fileId,
        file,
        previewUrl,
        progress: 0,
        status: 'uploading'
      }]);

      try {
        // Upload file
        const result = await mediaService.uploadImage(file, (progress) => {
          setUploadingFiles(prev => prev.map(item =>
            item.id === fileId ? { ...item, progress } : item
          ));
        });

        if (result.success) {
          // Move to completed files
          const completedFile = {
            id: fileId,
            url: result.url,
            thumbnailUrl: result.thumbnailUrl,
            filename: result.filename,
            previewUrl,
            status: 'completed'
          };

          setCompletedFiles(prev => [...prev, completedFile]);
          setUploadingFiles(prev => prev.filter(item => item.id !== fileId));

          if (onUploadComplete) {
            onUploadComplete(completedFile);
          }
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        // Mark as error
        setUploadingFiles(prev => prev.map(item =>
          item.id === fileId ? { ...item, status: 'error' } : item
        ));

        if (onUploadError) {
          onUploadError(file.name, error.message);
        }

        // Remove after 3 seconds
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(item => item.id !== fileId));
        }, 3000);
      }
    }
  }, [disabled, maxFiles, maxSizeMB, accept, completedFiles.length, onUploadComplete, onUploadError]);

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  // Handle file input
  const handleFileInput = useCallback((e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  // Remove file
  const removeFile = useCallback((fileId) => {
    setCompletedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
    
    setUploadingFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  // Open file dialog
  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const allFiles = [...uploadingFiles, ...completedFiles];

  return (
    <UploadContainer>
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
      />

      <DropZone
        isDragOver={isDragOver}
        disabled={disabled}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <UploadIcon>
          <Upload size={24} />
        </UploadIcon>
        
        <UploadText>
          <h3>Upload Images</h3>
          <p>Drag & drop images here, or click to browse</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>
            Max {maxFiles} files, {maxSizeMB}MB each
          </p>
        </UploadText>

        <UploadButtons>
          <UploadButton primary onClick={(e) => { e.stopPropagation(); openFileDialog(); }}>
            <ImageIcon size={16} />
            Browse Files
          </UploadButton>
          
          {navigator.mediaDevices && (
            <UploadButton onClick={(e) => { e.stopPropagation(); /* Handle camera */ }}>
              <Camera size={16} />
              Camera
            </UploadButton>
          )}
        </UploadButtons>
      </DropZone>

      {showPreview && allFiles.length > 0 && (
        <ImagePreviewContainer>
          {allFiles.map((file) => (
            <ImagePreview key={file.id} error={file.status === 'error'}>
              <PreviewImage 
                src={file.previewUrl} 
                alt="Upload preview" 
              />
              
              <RemoveButton onClick={() => removeFile(file.id)}>
                <X size={14} />
              </RemoveButton>

              {file.status === 'uploading' && (
                <ProgressOverlay>
                  <Loader size={20} className="animate-spin" />
                  <ProgressBar>
                    <ProgressFill progress={file.progress} />
                  </ProgressBar>
                </ProgressOverlay>
              )}

              {file.status === 'completed' && (
                <StatusIcon success>
                  <CheckCircle size={12} />
                </StatusIcon>
              )}

              {file.status === 'error' && (
                <StatusIcon>
                  <AlertCircle size={12} />
                </StatusIcon>
              )}
            </ImagePreview>
          ))}
        </ImagePreviewContainer>
      )}
    </UploadContainer>
  );
};

export default ImageUpload;