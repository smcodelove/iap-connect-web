// web/src/pages/post/CreatePostPage.js
import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { createPost } from '../../store/slices/postSlice';

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
    visibility: 'public'
  });
  const [currentTag, setCurrentTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postData.content.trim()) {
      alert('Please enter some content for your post');
      return;
    }

    try {
      const postPayload = {
        content: postData.content,
        // Add other fields as supported by backend
        hashtags: postData.tags.map(tag => `#${tag}`).join(' ')
      };

      await dispatch(createPost(postPayload)).unwrap();
      navigate('/feed');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
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

          {showPreview && (
            <PreviewCard>
              <div className="preview-title">
                <strong>Preview:</strong>
              </div>
              <div className="preview-content">
                {postData.title && <h3>{postData.title}</h3>}
                <p>{postData.content}</p>
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
              <ActionButton type="button">
                <Image size={16} />
                Add Image
              </ActionButton>
              <ActionButton 
                type="button" 
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye size={16} />
                {showPreview ? 'Hide' : 'Show'} Preview
              </ActionButton>
            </SecondaryActions>

            <SubmitButton type="submit" disabled={loading || !postData.content.trim()}>
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