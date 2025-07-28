// web/src/components/common/ErrorDisplay.js
import React from 'react';
import styled from 'styled-components';
import { AlertCircle, X } from 'lucide-react';

const ErrorContainer = styled.div`
  background: ${props => props.theme.colors.danger}15;
  border: 1px solid ${props => props.theme.colors.danger}30;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 12px 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  position: relative;
`;

const ErrorIcon = styled.div`
  color: ${props => props.theme.colors.danger};
  flex-shrink: 0;
  margin-top: 2px;
`;

const ErrorContent = styled.div`
  flex: 1;
  color: ${props => props.theme.colors.danger};
  font-size: 14px;
  line-height: 1.4;
`;

const ErrorTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.gray700};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.colors.danger};
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  flex-shrink: 0;
  
  &:hover {
    background: ${props => props.theme.colors.danger}20;
  }
`;

/**
 * Error Display Component
 * Properly handles different types of error objects and displays them nicely
 * 
 * @param {any} error - Error object, string, or array
 * @param {string} title - Optional title for the error
 * @param {function} onClose - Optional close handler
 * @param {string} className - Optional CSS class
 */
const ErrorDisplay = ({ error, title = "Error", onClose, className }) => {
  // Function to extract readable error message
  const getErrorMessage = (error) => {
    if (!error) return null;
    
    // If it's already a string, return it
    if (typeof error === 'string') {
      return error;
    }
    
    // If it's an array of errors (validation errors)
    if (Array.isArray(error)) {
      return error.map(err => {
        if (typeof err === 'string') return err;
        if (err.message) return err.message;
        if (err.msg) return err.msg;
        if (err.detail) return err.detail;
        return JSON.stringify(err);
      }).join(', ');
    }
    
    // If it's an object with error properties
    if (typeof error === 'object') {
      if (error.message) return error.message;
      if (error.detail) return error.detail;
      if (error.msg) return error.msg;
      if (error.error) return getErrorMessage(error.error);
      
      // If it's a response object
      if (error.response?.data) {
        return getErrorMessage(error.response.data);
      }
      
      // Last resort - stringify the object
      try {
        return JSON.stringify(error);
      } catch {
        return 'An unknown error occurred';
      }
    }
    
    // Fallback
    return 'An unexpected error occurred';
  };

  const errorMessage = getErrorMessage(error);
  
  // Don't render if no error
  if (!errorMessage) return null;

  return (
    <ErrorContainer className={className}>
      <ErrorIcon>
        <AlertCircle size={16} />
      </ErrorIcon>
      <ErrorContent>
        {title && <ErrorTitle>{title}</ErrorTitle>}
        <ErrorMessage>{errorMessage}</ErrorMessage>
      </ErrorContent>
      {onClose && (
        <CloseButton onClick={onClose} title="Close error">
          <X size={16} />
        </CloseButton>
      )}
    </ErrorContainer>
  );
};

export default ErrorDisplay;