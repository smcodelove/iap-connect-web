// web/src/components/common/LikeButton.js
/**
 * Enhanced Like Button with animations and real API integration
 * Features: Heart animation, optimistic updates, error handling
 */

import React, { useState, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Heart } from 'lucide-react';
import { postService } from '../../services/api';

// Heart bounce animation
const heartBounce = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

// Heart particles animation
const heartParticles = keyframes`
  0% {
    opacity: 1;
    transform: scale(0) translate(0, 0);
  }
  50% {
    opacity: 1;
    transform: scale(1) translate(var(--x), var(--y));
  }
  100% {
    opacity: 0;
    transform: scale(0) translate(var(--x), var(--y));
  }
`;

const LikeButtonContainer = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: ${props => props.liked ? '#fecaca' : props.theme.colors.gray100};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  ${props => props.disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      background: none;
    }
  `}
`;

const HeartIcon = styled(Heart)`
  transition: all 0.3s ease;
  color: ${props => props.liked ? '#dc2626' : props.theme.colors.gray600};
  fill: ${props => props.liked ? '#dc2626' : 'none'};
  
  ${props => props.animate && css`
    animation: ${heartBounce} 0.6s ease;
  `}
`;

const LikeCount = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.liked ? '#dc2626' : props.theme.colors.gray600};
  transition: all 0.2s ease;
  min-width: 20px;
  text-align: left;
`;

const ParticleContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
  z-index: 1;
`;

const Particle = styled.div`
  position: absolute;
  width: 6px;
  height: 6px;
  background: #dc2626;
  border-radius: 50%;
  animation: ${heartParticles} 0.8s ease-out forwards;
  
  ${props => css`
    --x: ${props.x}px;
    --y: ${props.y}px;
    animation-delay: ${props.delay}ms;
  `}
`;

const PulseRing = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  border: 2px solid #dc2626;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  
  ${props => props.animate && css`
    animation: pulseRing 0.6s ease-out;
  `}
`;

const pulseRing = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
`;

const LikeButton = ({ 
  postId, 
  initialLiked = false, 
  initialCount = 0,
  size = 20,
  showCount = true,
  disabled = false,
  onLikeChange
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Generate particle positions
  const generateParticles = () => {
    const particles = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const distance = 20 + Math.random() * 10;
      particles.push({
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        delay: i * 50
      });
    }
    return particles;
  };

  const [particles, setParticles] = useState([]);

  const handleLike = useCallback(async () => {
    if (disabled || isLoading) return;

    // Optimistic update
    const newLiked = !liked;
    const newCount = newLiked ? count + 1 : Math.max(0, count - 1);
    
    setLiked(newLiked);
    setCount(newCount);
    setIsLoading(true);

    // Trigger animations for like action
    if (newLiked) {
      setIsAnimating(true);
      setShowPulse(true);
      setParticles(generateParticles());
      setShowParticles(true);

      // Reset animations
      setTimeout(() => {
        setIsAnimating(false);
        setShowPulse(false);
        setShowParticles(false);
      }, 800);
    }

    try {
      let response;
      if (newLiked) {
        response = await postService.likePost(postId);
      } else {
        response = await postService.unlikePost(postId);
      }

      if (response.success) {
        // Update with server response
        setLiked(response.liked);
        setCount(response.likes_count);
        
        // Notify parent component
        if (onLikeChange) {
          onLikeChange({
            postId,
            liked: response.liked,
            likesCount: response.likes_count
          });
        }
      } else {
        // Revert optimistic update on failure
        setLiked(!newLiked);
        setCount(liked ? count + 1 : Math.max(0, count - 1));
        console.error('Like action failed');
      }
    } catch (error) {
      // Revert optimistic update on error
      setLiked(!newLiked);
      setCount(liked ? count + 1 : Math.max(0, count - 1));
      console.error('Like action error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [liked, count, postId, disabled, isLoading, onLikeChange]);

  return (
    <LikeButtonContainer
      onClick={handleLike}
      liked={liked}
      disabled={disabled || isLoading}
      title={liked ? 'Unlike this post' : 'Like this post'}
    >
      <PulseRing animate={showPulse} />
      
      <HeartIcon 
        size={size} 
        liked={liked} 
        animate={isAnimating}
      />
      
      {showCount && (
        <LikeCount liked={liked}>
          {count > 0 ? count : ''}
        </LikeCount>
      )}
      
      {showParticles && (
        <ParticleContainer>
          {particles.map(particle => (
            <Particle
              key={particle.id}
              x={particle.x}
              y={particle.y}
              delay={particle.delay}
            />
          ))}
        </ParticleContainer>
      )}
    </LikeButtonContainer>
  );
};

export default LikeButton;