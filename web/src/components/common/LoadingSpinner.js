// web/src/components/common/LoadingSpinner.js
/**
 * LoadingSpinner - Reusable loading component
 * Used across the application for loading states
 */

import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { 
    transform: rotate(0deg); 
  }
  100% { 
    transform: rotate(360deg); 
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.padding || '20px'};
  gap: 10px;
`;

const Spinner = styled.div`
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  border: 3px solid ${props => props.theme?.colors?.gray200 || '#e9ecef'};
  border-top: 3px solid ${props => props.theme?.colors?.primary || '#0066cc'};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.span`
  color: ${props => props.theme?.colors?.gray600 || '#6c757d'};
  font-size: 14px;
  font-weight: 500;
`;

const LoadingSpinner = ({ 
  size = '40px', 
  text = 'Loading...', 
  padding = '20px',
  showText = true 
}) => {
  return (
    <SpinnerContainer padding={padding}>
      <Spinner size={size} />
      {showText && <LoadingText>{text}</LoadingText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;