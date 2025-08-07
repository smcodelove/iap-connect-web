// web/src/components/comments/CommentSection.js
/**
 * Enhanced Comment Section with nested replies and real-time interactions
 * Features: Add comments, reply to comments, like comments, delete comments
 * FIXED: Replaced confirm() with custom confirmation
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, MessageCircle, Reply, Trash2, Send, MoreHorizontal } from 'lucide-react';
import commentService from '../../services/commentService';

const CommentSectionContainer = styled.div`
  margin-top: 16px;
  border-top: 1px solid ${props => props.theme.colors.gray200};
  padding-top: 16px;
`;

const CommentForm = styled.form`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: flex-start;
`;

const CommentInput = styled.textarea`
  flex: 1;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: 8px;
  resize: vertical;
  min-height: 40px;
  max-height: 120px;
  font-family: inherit;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const CommentButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.disabled ? props.theme.colors.gray300 : props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const CommentsContainer = styled.div`
  space-y: 16px;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  
  ${props => props.isReply && `
    margin-left: 32px;
    padding-left: 16px;
    border-left: 2px solid ${props.theme.colors.gray200};
  `}
`;

const CommentAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const CommentAuthor = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.gray800};
  font-size: 14px;
`;

const CommentRole = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.gray600};
  background: ${props => props.theme.colors.gray100};
  padding: 2px 6px;
  border-radius: 4px;
`;

const CommentTime = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.gray500};
`;

const CommentText = styled.p`
  margin: 4px 0 8px 0;
  font-size: 14px;
  line-height: 1.4;
  color: ${props => props.theme.colors.gray700};
`;

const CommentActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CommentAction = styled.button`
  background: none;
  border: none;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray600};
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.primary};
  }
`;

const ReplyForm = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
  
  ${props => !props.show && 'display: none;'}
`;

const ReplyInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.gray300};
  border-radius: 6px;
  font-size: 13px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ReplyButton = styled.button`
  padding: 8px 12px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const LoadMoreReplies = styled.button`
  color: ${props => props.theme.colors.primary};
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  margin-left: 44px;
  margin-top: 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Custom confirmation modal
const ConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const ConfirmDialog = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ConfirmTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  color: ${props => props.theme.colors.gray800};
`;

const ConfirmMessage = styled.p`
  margin: 0 0 20px 0;
  color: ${props => props.theme.colors.gray600};
  line-height: 1.5;
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ConfirmButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.variant === 'danger' ? `
    background: ${props.theme.colors.danger};
    color: white;
    
    &:hover {
      background: ${props.theme.colors.danger}dd;
    }
  ` : `
    background: ${props.theme.colors.gray200};
    color: ${props.theme.colors.gray700};
    
    &:hover {
      background: ${props.theme.colors.gray300};
    }
  `}
`;

const CommentSection = ({ postId }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  // State management
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Load comments
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await commentService.getPostComments(postId);
      if (response.success) {
        setComments(response.comments);
      }
    } catch (error) {
      console.error('Load comments error:', error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Custom confirm function
  const showConfirmDialog = (message, onConfirm) => {
    setConfirmAction(() => onConfirm);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirm(false);
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setConfirmAction(null);
  };

  // Submit new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const response = await commentService.addComment(postId, newComment.trim());
      
      if (response.success) {
        setComments(prev => [response.comment, ...prev]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Submit comment error:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentId) => {
    if (!replyText.trim()) return;

    try {
      const response = await commentService.addComment(postId, replyText.trim(), parentId);
      
      if (response.success) {
        // Add reply to the parent comment
        setComments(prev => prev.map(comment => 
          comment.id === parentId 
            ? { ...comment, replies: [...(comment.replies || []), response.comment] }
            : comment
        ));
        setReplyText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Submit reply error:', error);
      alert('Failed to add reply. Please try again.');
    }
  };

  // Like/unlike comment
  const handleLikeComment = async (commentId, isLiked) => {
    try {
      const response = isLiked 
        ? await commentService.unlikeComment(commentId)
        : await commentService.likeComment(commentId);

      if (response.success) {
        // Update comment in state
        setComments(prev => prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              is_liked: response.liked,
              likes_count: response.likes_count
            };
          }
          // Also check replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === commentId
                  ? { ...reply, is_liked: response.liked, likes_count: response.likes_count }
                  : reply
              )
            };
          }
          return comment;
        }));
      }
    } catch (error) {
      console.error('Like comment error:', error);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    showConfirmDialog(
      'Are you sure you want to delete this comment? This action cannot be undone.',
      async () => {
        try {
          const response = await commentService.deleteComment(commentId);
          if (response.success) {
            setComments(prev => prev.filter(comment => comment.id !== commentId));
          }
        } catch (error) {
          console.error('Delete comment error:', error);
          alert('Failed to delete comment.');
        }
      }
    );
  };

  // Format time
  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now - time;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    
    return time.toLocaleDateString();
  };

  // Render single comment
  const renderComment = (comment, isReply = false) => (
    <CommentItem key={comment.id} isReply={isReply}>
      <CommentAvatar>
        {comment.author.full_name?.charAt(0) || 'U'}
      </CommentAvatar>
      
      <CommentContent>
        <CommentHeader>
          <CommentAuthor>{comment.author.full_name}</CommentAuthor>
          <CommentRole>
            {comment.author.user_type === 'doctor' ? 'Doctor' : 'Student'}
          </CommentRole>
          <CommentTime>{formatTime(comment.created_at)}</CommentTime>
        </CommentHeader>
        
        <CommentText>{comment.content}</CommentText>
        
        <CommentActions>
          <CommentAction
            active={comment.is_liked}
            onClick={() => handleLikeComment(comment.id, comment.is_liked)}
          >
            <Heart size={14} fill={comment.is_liked ? 'currentColor' : 'none'} />
            {comment.likes_count || 0}
          </CommentAction>
          
          {!isReply && (
            <CommentAction onClick={() => setReplyingTo(comment.id)}>
              <Reply size={14} />
              Reply
            </CommentAction>
          )}
          
          {(comment.author.id === user?.id || user?.user_type === 'admin') && (
            <CommentAction onClick={() => handleDeleteComment(comment.id)}>
              <Trash2 size={14} />
              Delete
            </CommentAction>
          )}
        </CommentActions>
        
        {/* Reply form */}
        <ReplyForm show={replyingTo === comment.id}>
          <ReplyInput
            placeholder={`Reply to ${comment.author.full_name}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitReply(comment.id);
              }
            }}
          />
          <ReplyButton onClick={() => handleSubmitReply(comment.id)}>
            Reply
          </ReplyButton>
        </ReplyForm>
        
        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div>
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </CommentContent>
    </CommentItem>
  );

  return (
    <CommentSectionContainer>
      {/* Add comment form */}
      <CommentForm onSubmit={handleSubmitComment}>
        <CommentAvatar>
          {user?.full_name?.charAt(0) || 'U'}
        </CommentAvatar>
        <CommentInput
          placeholder="Add a thoughtful comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={1}
        />
        <CommentButton type="submit" disabled={!newComment.trim() || submitting}>
          <Send size={16} />
          {submitting ? 'Posting...' : 'Post'}
        </CommentButton>
      </CommentForm>
      
      {/* Comments list */}
      <CommentsContainer>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </CommentsContainer>

      {/* Custom confirmation modal */}
      {showConfirm && (
        <ConfirmModal>
          <ConfirmDialog>
            <ConfirmTitle>Confirm Action</ConfirmTitle>
            <ConfirmMessage>
              Are you sure you want to delete this comment? This action cannot be undone.
            </ConfirmMessage>
            <ConfirmActions>
              <ConfirmButton onClick={handleCancel}>
                Cancel
              </ConfirmButton>
              <ConfirmButton variant="danger" onClick={handleConfirm}>
                Delete
              </ConfirmButton>
            </ConfirmActions>
          </ConfirmDialog>
        </ConfirmModal>
      )}
    </CommentSectionContainer>
  );
};

export default CommentSection;