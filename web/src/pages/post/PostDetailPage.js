// web/src/pages/post/PostDetailPage.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Send,
  User,
  Clock
} from 'lucide-react';

const PostDetailContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
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

const PostCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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
  font-size: 1.1rem;
`;

const AuthorDetails = styled.div`
  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 4px;
  }
  
  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const PostContent = styled.div`
  margin-bottom: 25px;
  
  h1 {
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 15px;
    font-size: 1.8rem;
    line-height: 1.3;
  }
  
  p {
    color: ${props => props.theme.colors.gray700};
    line-height: 1.7;
    font-size: 1.05rem;
    margin-bottom: 15px;
  }
`;

const PostActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
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
  gap: 8px;
  padding: 10px 15px;
  border-radius: 8px;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray600};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
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

const CommentsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
`;

const CommentsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  margin-bottom: 20px;
  
  h3 {
    color: ${props => props.theme.colors.textPrimary};
    font-size: 1.3rem;
  }
`;

const CommentForm = styled.form`
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  padding: 20px;
  background: ${props => props.theme.colors.gray50};
  border-radius: 8px;
`;

const CommentInput = styled.textarea`
  flex: 1;
  padding: 12px;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const CommentButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  height: fit-content;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.gray400};
    cursor: not-allowed;
  }
`;

const CommentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CommentItem = styled.div`
  padding: 15px;
  border: 1px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  
  &:hover {
    background: ${props => props.theme.colors.gray50};
  }
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const CommentAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
  }
  
  .time {
    font-size: 0.85rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const CommentContent = styled.div`
  color: ${props => props.theme.colors.gray700};
  line-height: 1.6;
`;

const EmptyComments = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.theme.colors.gray600};
  
  .icon {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.5;
  }
  
  h4 {
    margin-bottom: 8px;
    color: ${props => props.theme.colors.gray700};
  }
`;

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(12);

  // Mock post data - replace with actual API call
  const post = {
    id: id,
    title: 'Understanding Cardiovascular Disease Prevention',
    content: `Cardiovascular disease remains one of the leading causes of mortality worldwide. Recent research has shown that early intervention and lifestyle modifications can significantly reduce the risk of developing heart disease.

Key prevention strategies include:

1. Regular cardiovascular exercise - at least 150 minutes of moderate-intensity exercise per week
2. Maintaining a healthy diet rich in fruits, vegetables, and whole grains
3. Managing stress through meditation and relaxation techniques
4. Regular health screenings and blood pressure monitoring
5. Avoiding tobacco and limiting alcohol consumption

The latest studies indicate that these interventions can reduce cardiovascular risk by up to 80% when implemented consistently. Healthcare providers should emphasize the importance of preventive care rather than reactive treatment.

What are your thoughts on implementing these strategies in clinical practice?`,
    author: {
      id: 1,
      name: 'Dr. Sarah Johnson',
      username: 'drjohnson',
      specialty: 'Cardiology',
      avatar_url: null
    },
    created_at: '2024-01-15T10:30:00Z',
    likes_count: 24,
    comments_count: 8,
    is_liked_by_user: false
  };

  // Mock comments data
  const comments = [
    {
      id: 1,
      content: 'Excellent points about prevention! I\'ve been implementing similar strategies with my patients and seeing great results.',
      author: {
        name: 'Dr. Michael Chen',
        username: 'drchen',
        specialty: 'Internal Medicine'
      },
      created_at: '2024-01-15T11:15:00Z'
    },
    {
      id: 2,
      content: 'As a medical student, this is incredibly valuable information. The emphasis on prevention over treatment is something we should focus more on in medical school.',
      author: {
        name: 'Emma Rodriguez',
        username: 'emmamed',
        college: 'Johns Hopkins'
      },
      created_at: '2024-01-15T12:45:00Z'
    }
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      // Here you would submit the comment to your API
      console.log('Submitting comment:', comment);
      setComment('');
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <PostDetailContainer>
      <Header>
        <BackButton onClick={() => navigate('/feed')}>
          <ArrowLeft size={20} />
        </BackButton>
        <h1>Post Details</h1>
      </Header>

      <PostCard>
        <PostHeader>
          <AuthorInfo>
            <Avatar>
              {post.author.avatar_url ? (
                <img 
                  src={post.author.avatar_url} 
                  alt={post.author.name}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                getInitials(post.author.name)
              )}
            </Avatar>
            <AuthorDetails>
              <div className="name">{post.author.name}</div>
              <div className="meta">
                <span>{post.author.specialty || post.author.college}</span>
                <Clock size={14} />
                <span>{formatTimeAgo(post.created_at)}</span>
              </div>
            </AuthorDetails>
          </AuthorInfo>
          <button style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
            <MoreHorizontal size={20} />
          </button>
        </PostHeader>

        <PostContent>
          <h1>{post.title}</h1>
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </PostContent>

        <PostActions>
          <ActionGroup>
            <ActionButton active={isLiked} onClick={handleLike}>
              <Heart size={18} />
              {likesCount}
            </ActionButton>
            <ActionButton>
              <MessageCircle size={18} />
              {comments.length}
            </ActionButton>
            <ActionButton>
              <Share2 size={18} />
              Share
            </ActionButton>
          </ActionGroup>
        </PostActions>
      </PostCard>

      <CommentsSection>
        <CommentsHeader>
          <h3>Comments ({comments.length})</h3>
        </CommentsHeader>

        <CommentForm onSubmit={handleCommentSubmit}>
          <Avatar style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}>
            {getInitials(user?.full_name || user?.username)}
          </Avatar>
          <CommentInput
            placeholder="Add a thoughtful comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
          />
          <CommentButton type="submit" disabled={!comment.trim()}>
            <Send size={16} />
            Comment
          </CommentButton>
        </CommentForm>

        <CommentsList>
          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentItem key={comment.id}>
                <CommentHeader>
                  <CommentAuthor>
                    <Avatar style={{ width: '35px', height: '35px', fontSize: '0.8rem' }}>
                      {getInitials(comment.author.name)}
                    </Avatar>
                    <div>
                      <div className="name">{comment.author.name}</div>
                      <div className="time">{formatTimeAgo(comment.created_at)}</div>
                    </div>
                  </CommentAuthor>
                </CommentHeader>
                <CommentContent>
                  {comment.content}
                </CommentContent>
              </CommentItem>
            ))
          ) : (
            <EmptyComments>
              <div className="icon">💬</div>
              <h4>No comments yet</h4>
              <p>Be the first to share your thoughts!</p>
            </EmptyComments>
          )}
        </CommentsList>
      </CommentsSection>
    </PostDetailContainer>
  );
};

export default PostDetailPage;