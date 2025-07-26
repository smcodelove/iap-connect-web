// src/components/posts/CreatePostWidget.js
import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Image, FileText } from 'lucide-react';

const CreatePostContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
`;

const CreatePostHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const CreatePostInput = styled.div`
  flex: 1;
  padding: 12px 16px;
  background: ${props => props.theme.colors.gray100};
  border-radius: 24px;
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray200};
  }
`;

const CreatePostActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid ${props => props.theme.colors.gray200};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 15px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: none;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: 6px;
  color: ${props => props.theme.colors.gray600};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const CreatePostWidget = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const handleCreatePost = () => {
    navigate('/create-post');
  };

  return (
    <CreatePostContainer>
      <CreatePostHeader>
        <Avatar>
          {user?.profile_picture_url ? (
            <img 
              src={user.profile_picture_url} 
              alt={user.full_name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            getInitials(user?.full_name || user?.username)
          )}
        </Avatar>
        <CreatePostInput onClick={handleCreatePost}>
          What's on your mind, {user?.full_name?.split(' ')[0] || 'User'}?
        </CreatePostInput>
      </CreatePostHeader>

      <CreatePostActions>
        <ActionButtons>
          <ActionButton onClick={handleCreatePost}>
            <Image size={16} />
            Photo
          </ActionButton>
          <ActionButton onClick={handleCreatePost}>
            <FileText size={16} />
            Article
          </ActionButton>
        </ActionButtons>

        <CreateButton onClick={handleCreatePost}>
          <Plus size={16} />
          Create Post
        </CreateButton>
      </CreatePostActions>
    </CreatePostContainer>
  );
};

export default CreatePostWidget;