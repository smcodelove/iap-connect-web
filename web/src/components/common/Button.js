// src/components/common/Button.js
import React from 'react';
import styled, { css } from 'styled-components';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const getButtonStyles = (variant, theme) => {
  const styles = {
    primary: css`
      background: ${theme.colors.primary};
      color: white;
      border: 2px solid ${theme.colors.primary};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.primaryDark};
        border-color: ${theme.colors.primaryDark};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(0, 102, 204, 0.3);
      }
    `,
    
    secondary: css`
      background: white;
      color: ${theme.colors.primary};
      border: 2px solid ${theme.colors.primary};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.primary};
        color: white;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    
    outline: css`
      background: transparent;
      color: ${theme.colors.gray700};
      border: 2px solid ${theme.colors.gray300};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.gray100};
        border-color: ${theme.colors.gray400};
        color: ${theme.colors.gray800};
      }
      
      &:active:not(:disabled) {
        background: ${theme.colors.gray200};
      }
    `,
    
    ghost: css`
      background: transparent;
      color: ${theme.colors.gray700};
      border: 2px solid transparent;
      
      &:hover:not(:disabled) {
        background: ${theme.colors.gray100};
        color: ${theme.colors.gray800};
      }
      
      &:active:not(:disabled) {
        background: ${theme.colors.gray200};
      }
    `,
    
    danger: css`
      background: ${theme.colors.danger};
      color: white;
      border: 2px solid ${theme.colors.danger};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.dangerDark || '#c53030'};
        border-color: ${theme.colors.dangerDark || '#c53030'};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    
    success: css`
      background: ${theme.colors.success};
      color: white;
      border: 2px solid ${theme.colors.success};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.successDark || '#1e7e34'};
        border-color: ${theme.colors.successDark || '#1e7e34'};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    
    warning: css`
      background: ${theme.colors.warning};
      color: ${theme.colors.gray800};
      border: 2px solid ${theme.colors.warning};
      
      &:hover:not(:disabled) {
        background: ${theme.colors.warningDark || '#f57f17'};
        border-color: ${theme.colors.warningDark || '#f57f17'};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `,
    
    link: css`
      background: transparent;
      color: ${theme.colors.primary};
      border: 2px solid transparent;
      padding: 0.5rem 0.75rem;
      text-decoration: underline;
      
      &:hover:not(:disabled) {
        color: ${theme.colors.primaryDark};
        text-decoration: none;
      }
    `
  };
  
  return styles[variant] || styles.primary;
};

const getSizeStyles = (size) => {
  const sizes = {
    small: css`
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      min-height: 32px;
      
      svg {
        width: 14px;
        height: 14px;
      }
    `,
    
    medium: css`
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      min-height: 40px;
      
      svg {
        width: 16px;
        height: 16px;
      }
    `,
    
    large: css`
      padding: 1rem 2rem;
      font-size: 1.125rem;
      min-height: 48px;
      
      svg {
        width: 18px;
        height: 18px;
      }
    `,
    
    extraLarge: css`
      padding: 1.25rem 2.5rem;
      font-size: 1.25rem;
      min-height: 56px;
      
      svg {
        width: 20px;
        height: 20px;
      }
    `
  };
  
  return sizes[size] || sizes.medium;
};

const StyledButton = styled.button`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  /* Remove default button styles */
  background: none;
  border: none;
  outline: none;
  
  /* Apply size styles */
  ${props => getSizeStyles(props.size)}
  
  /* Apply variant styles */
  ${props => getButtonStyles(props.variant, props.theme)}
  
  /* Full width */
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  /* Rounded */
  ${props => props.rounded && css`
    border-radius: 2rem;
  `}
  
  /* Icon only */
  ${props => props.iconOnly && css`
    width: ${props.size === 'small' ? '32px' : 
             props.size === 'large' ? '48px' : 
             props.size === 'extraLarge' ? '56px' : '40px'};
    padding: 0;
    
    svg {
      margin: 0;
    }
  `}
  
  /* Loading state */
  ${props => props.loading && css`
    pointer-events: none;
    
    > *:not(${LoadingSpinner}) {
      opacity: 0.6;
    }
  `}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  /* Focus styles */
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
  
  /* Responsive */
  @media (max-width: 640px) {
    ${props => props.responsive && css`
      width: 100%;
    `}
  }
`;

const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = false,
  iconOnly = false,
  responsive = false,
  leftIcon,
  rightIcon,
  loadingText,
  className,
  type = 'button',
  onClick,
  ...props
}, ref) => {
  const handleClick = (e) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <StyledButton
      ref={ref}
      type={type}
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      rounded={rounded}
      iconOnly={iconOnly}
      responsive={responsive}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {loading && <LoadingSpinner size={16} />}
      {!loading && leftIcon && leftIcon}
      {!iconOnly && (
        <span>
          {loading && loadingText ? loadingText : children}
        </span>
      )}
      {!loading && rightIcon && rightIcon}
    </StyledButton>
  );
});

Button.displayName = 'Button';

// Button Group Component
const ButtonGroupContainer = styled.div`
  display: inline-flex;
  
  ${StyledButton} {
    border-radius: 0;
    margin-left: -1px;
    
    &:first-child {
      margin-left: 0;
      border-top-left-radius: 0.5rem;
      border-bottom-left-radius: 0.5rem;
    }
    
    &:last-child {
      border-top-right-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
    }
    
    &:hover {
      z-index: 1;
    }
    
    &:focus {
      z-index: 2;
    }
  }
  
  ${props => props.vertical && css`
    flex-direction: column;
    
    ${StyledButton} {
      margin-left: 0;
      margin-top: -1px;
      
      &:first-child {
        margin-top: 0;
        border-radius: 0.5rem 0.5rem 0 0;
      }
      
      &:last-child {
        border-radius: 0 0 0.5rem 0.5rem;
      }
    }
  `}
  
  ${props => props.attached && css`
    ${StyledButton} {
      &:not(:first-child):not(:last-child) {
        border-radius: 0;
      }
    }
  `}
`;

export const ButtonGroup = ({ 
  children, 
  vertical = false, 
  attached = true,
  className,
  ...props 
}) => (
  <ButtonGroupContainer 
    vertical={vertical} 
    attached={attached}
    className={className}
    {...props}
  >
    {children}
  </ButtonGroupContainer>
);

// Icon Button Component
export const IconButton = React.forwardRef(({
  icon,
  'aria-label': ariaLabel,
  ...props
}, ref) => (
  <Button
    ref={ref}
    iconOnly
    aria-label={ariaLabel}
    {...props}
  >
    {icon}
  </Button>
));

IconButton.displayName = 'IconButton';

export default Button;