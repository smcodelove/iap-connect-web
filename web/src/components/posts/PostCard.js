// web/src/components/posts/PostCard.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { Heart, MessageCircle, Share2, MoreHorizontal, Clock, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { likePost, unlikePost } from '../../store/slices/postSlice';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
`;

const UserDetails = styled.div`
  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 2px;
  }
  
  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const UserType = styled.span`
  background: ${props => {
    if (props.type === 'doctor') return props.theme.colors.primary;
    if (props.type === 'student') return props.theme.colors.success;
    return props.theme.colors.gray400;
  }};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  border-radius: 50%;
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.gray700};
  }
`;

const PostContent = styled.div`
  margin-bottom: 15px;
  
  h3 {
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 8px;
    font-size: 1.1rem;
  }
  
  p {
    color: ${props => props.theme.colors.gray700};
    line-height: 1.6;
    margin-bottom: 10px;
  }
`;

const PostImage = styled.img`
  width: 100%;
  border-radius: 8px;
  margin: 10px 0;
  object-fit: cover;
  max-height: 400px;
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 15px;
  border-top: 1px solid ${props => props.theme.colors.gray200};
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray600};
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.primary};
  }
  
  svg {
    width: 18px;
    height: 18px;
    fill: ${props => props.active ? 'currentColor' : 'none'};
  }
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray600};
`;

const formatTimeAgo = (date) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await dispatch(unlikePost(post.id)).unwrap();
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await dispatch(likePost(post.id)).unwrap();
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  return (
    <Card>
      <PostHeader>
        <UserInfo>
          <Avatar>
            {post.user?.avatar_url ? (
              <img 
                src={post.user.avatar_url} 
                alt={post.user.full_name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              getInitials(post.user?.full_name || post.user?.username)
            )}
          </Avatar>
          <UserDetails>
            <div className="name">
              <Link to={`/user/${post.user?.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {post.user?.full_name || post.user?.username}
              </Link>
            </div>
            <div className="meta">
              <UserType type={post.user?.user_type}>
                {post.user?.user_type}
              </UserType>
              <Clock size={14} />
              {formatTimeAgo(post.created_at)}
            </div>
          </UserDetails>
        </UserInfo>
        <MenuButton>
          <MoreHorizontal size={20} />
        </MenuButton>
      </PostHeader>

      <PostContent>
        {post.title && <h3>{post.title}</h3>}
        <p>{post.content}</p>
        {post.image_url && (
          <PostImage src={post.image_url} alt="Post content" />
        )}
      </PostContent>

      <PostActions>
        <ActionGroup>
          <ActionButton active={isLiked} onClick={handleLike}>
            <Heart size={18} />
            {likesCount}
          </ActionButton>
          <ActionButton as={Link} to={`/post/${post.id}`}>
            <MessageCircle size={18} />
            {post.comments_count || 0}
          </ActionButton>
          <ActionButton>
            <Share2 size={18} />
            Share
          </ActionButton>
        </ActionGroup>
        
        <Stats>
          {likesCount > 0 && <span>{likesCount} likes</span>}
          {post.comments_count > 0 && <span>{post.comments_count} comments</span>}
        </Stats>
      </PostActions>
    </Card>
  );
};

export default PostCard;