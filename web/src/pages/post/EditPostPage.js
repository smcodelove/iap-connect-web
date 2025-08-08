// web/src/pages/post/EditPostPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Image,
  Eye,
  Loader
} from 'lucide-react';
import postService from '../../services/postService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditPostContainer = styled.div`
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
  border-bottom: 2px solid ${props => props.theme.colors.gray100};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.primary};
  }
`;

const EditPostCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid ${props => props.theme.colors.gray200};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 25px;
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
    outline: none;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
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
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  
  button {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    
    &:hover {
      color: ${props => props.theme.colors.error};
    }
  }
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
    outline: none;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
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
  gap: 8px;
  font-weight: 500;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SaveButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  color: #c66;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const PreviewCard = styled.div`
  background: ${props => props.theme.colors.gray50};
  border: 1px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  padding: 20px;
  margin-top: 15px;
  
  h4 {
    margin: 0 0 10px 0;
    color: ${props => props.theme.colors.gray700};
  }
  
  .preview-content {
    white-space: pre-wrap;
    line-height: 1.6;
    color: ${props => props.theme.colors.gray800};
  }
`;

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  
  const [postData, setPostData] = useState({
    content: '',
    hashtags: []
  });
  
  const [originalPost, setOriginalPost] = useState(null);

  // Load post data on component mount
  useEffect(() => {
    loadPostData();
  }, [id]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading post for editing:', id);
      
      const response = await postService.getPostById(id);
      
      if (response.success && response.post) {
        const post = response.post;
        
        // Check if current user is the post owner
        if (post.author?.id !== user?.id && user?.user_type !== 'admin') {
          throw new Error('You can only edit your own posts');
        }
        
        setOriginalPost(post);
        setPostData({
          content: post.content || '',
          hashtags: post.hashtags || []
        });
        
        console.log('✅ Post loaded for editing:', post);
      } else {
        throw new Error('Post not found');
      }
    } catch (error) {
      console.error('❌ Error loading post:', error);
      setError(error.message || 'Failed to load post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPostData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !postData.hashtags.includes(currentTag.trim())) {
      const newTag = currentTag.trim().replace(/^#/, ''); // Remove # if added
      setPostData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, newTag]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setPostData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postData.content.trim()) {
      setError('Post content is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      console.log('💾 Updating post:', id, postData);
      
      const updateData = {
        content: postData.content.trim(),
        hashtags: postData.hashtags
      };
      
      const response = await postService.updatePost(id, updateData);
      
      if (response.success) {
        console.log('✅ Post updated successfully');
        // Navigate back to the post detail page
        navigate(`/post/${id}`, { 
          replace: true,
          state: { message: 'Post updated successfully!' }
        });
      } else {
        throw new Error(response.message || 'Failed to update post');
      }
    } catch (error) {
      console.error('❌ Error updating post:', error);
      setError(error.message || 'Failed to update post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <EditPostContainer>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </BackButton>
          <h1>Edit Post</h1>
        </Header>
        <LoadingSpinner text="Loading post..." />
      </EditPostContainer>
    );
  }

  // Error state
  if (error && !originalPost) {
    return (
      <EditPostContainer>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </BackButton>
          <h1>Edit Post</h1>
        </Header>
        <ErrorMessage>{error}</ErrorMessage>
        <ActionButton onClick={loadPostData}>
          Try Again
        </ActionButton>
      </EditPostContainer>
    );
  }

  return (
    <EditPostContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </BackButton>
        <h1>Edit Post</h1>
      </Header>

      <EditPostCard>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
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
            <Label htmlFor="tags">Hashtags</Label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                id="tags"
                type="text"
                placeholder="Add a hashtag and press Enter"
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
              {postData.hashtags.map(tag => (
                <Tag key={tag}>
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    <X size={12} />
                  </button>
                </Tag>
              ))}
            </TagsContainer>
          </InputGroup>

          {showPreview && (
            <PreviewCard>
              <h4>Preview</h4>
              <div className="preview-content">{postData.content}</div>
              {postData.hashtags.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  {postData.hashtags.map(tag => (
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
            </PreviewCard>
          )}

          <ActionsSection>
            <SecondaryActions>
              <ActionButton 
                type="button" 
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye size={16} />
                {showPreview ? 'Hide' : 'Show'} Preview
              </ActionButton>
            </SecondaryActions>

            <SaveButton 
              type="submit" 
              disabled={saving || !postData.content.trim()}
            >
              {saving ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </SaveButton>
          </ActionsSection>
        </Form>
      </EditPostCard>
    </EditPostContainer>
  );
};

export default EditPostPage;