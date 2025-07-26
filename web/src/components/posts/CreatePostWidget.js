// web/src/components/posts/CreatePostWidget.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Image, FileText } from 'lucide-react';
import { createPost } from '../../store/slices/postSlice';

const Widget = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
`;

const QuickPost = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const UserAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  flex-shrink: 0;
`;

const QuickInput = styled.button`
  flex: 1;
  background: ${props => props.theme.colors.gray50};
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 25px;
  padding: 12px 20px;
  text-align: left;
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: white;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  padding-top: 15px;
  border-top: 1px solid ${props => props.theme.colors.gray200};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 10px;
  padding: 10px 15px;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}05;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const QuickPostForm = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid ${props => props.theme.colors.gray200};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 15px;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  margin-bottom: 15px;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const PostActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PostButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
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

const CancelButton = styled.button`
  background: none;
  color: ${props => props.theme.colors.gray600};
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  
  &:hover {
    color: ${props => props.theme.colors.danger};
  }
`;

const CreatePostWidget = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.posts);
  
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');

  const handleQuickPost = async () => {
    if (!content.trim()) return;
    
    try {
      await dispatch(createPost({ content: content.trim() })).unwrap();
      setContent('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  return (
    <Widget>
      <QuickPost>
        <UserAvatar>
          {user?.avatar_url ? (
            <img 
              src={user.avatar_url} 
              alt={user.full_name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            getInitials(user?.full_name || user?.username)
          )}
        </UserAvatar>
        <QuickInput onClick={() => setShowForm(true)}>
          What's on your mind, {user?.full_name?.split(' ')[0] || user?.username}?
        </QuickInput>
      </QuickPost>

      {showForm && (
        <QuickPostForm>
          <TextArea
            placeholder="Share your thoughts with the medical community..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />
          <PostActions>
            <div>
              <CancelButton onClick={() => {
                setShowForm(false);
                setContent('');
              }}>
                Cancel
              </CancelButton>
            </div>
            <PostButton 
              onClick={handleQuickPost}
              disabled={!content.trim() || loading}
            >
              {loading ? 'Posting...' : 'Post'}
            </PostButton>
          </PostActions>
        </QuickPostForm>
      )}

      {!showForm && (
        <ActionButtons>
          <ActionButton onClick={() => navigate('/create-post')}>
            <FileText />
            Write Article
          </ActionButton>
          <ActionButton onClick={() => navigate('/create-post?type=image')}>
            <Image />
            Add Photo
          </ActionButton>
          <ActionButton onClick={() => setShowForm(true)}>
            <PlusCircle />
            Quick Post
          </ActionButton>
        </ActionButtons>
      )}
    </Widget>
  );
};

export default CreatePostWidget;