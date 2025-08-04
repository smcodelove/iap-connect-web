// web/src/components/auth/LoginForm.js - CLEAN VERSION (No User Type Selection)
import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { loginUser, clearError } from '../../store/slices/authSlice';

// Styled Components
const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${props => props.theme.colors.gray800};
  font-size: 0.875rem;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: ${props => props.theme.colors.gray400};
  z-index: 1;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.error ? props.theme.colors.red300 : props.theme.colors.gray300};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.blue500};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.blue100};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.gray100};
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray400};
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  color: ${props => props.theme.colors.gray400};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${props => props.theme.colors.gray600};
    background-color: ${props => props.theme.colors.gray100};
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${props => props.theme.colors.red600};
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  accent-color: ${props => props.theme.colors.blue600};
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray700};
  cursor: pointer;
`;

const SubmitButton = styled.button`
  width: 100%;
  background: #0066cc;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.blue700};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: ${props => props.theme.colors.gray400};
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoginForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  
  // FIXED: No user type selection, defaults to doctor
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
    
    // Clear global error
    if (error) {
      dispatch(clearError());
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const credentials = {
        email: formData.email.trim(),
        password: formData.password
        // REMOVED: user_type - backend will determine automatically
      };
      
      await dispatch(loginUser(credentials)).unwrap();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/feed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Error is already handled by Redux
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        {/* Email */}
        <FormGroup>
          <Label htmlFor="email">Email Address</Label>
          <InputContainer>
            <InputIcon>
              <Mail size={18} />
            </InputIcon>
            <Input
              type="email"
              id="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={fieldErrors.email}
              disabled={loading}
              autoComplete="email"
            />
          </InputContainer>
          {fieldErrors.email && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {fieldErrors.email}
            </ErrorMessage>
          )}
        </FormGroup>

        {/* Password */}
        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <InputContainer>
            <InputIcon>
              <Lock size={18} />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={fieldErrors.password}
              disabled={loading}
              autoComplete="current-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </PasswordToggle>
          </InputContainer>
          {fieldErrors.password && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {fieldErrors.password}
            </ErrorMessage>
          )}
        </FormGroup>

        {/* Remember Me */}
        <RememberMeContainer>
          <Checkbox
            type="checkbox"
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
            disabled={loading}
          />
          <CheckboxLabel htmlFor="rememberMe">
            Remember me
          </CheckboxLabel>
        </RememberMeContainer>

        {/* Submit Button */}
        <SubmitButton type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner />
              Signing In...
            </>
          ) : (
            <>
              <LogIn size={20} />
              Sign In
            </>
          )}
        </SubmitButton>
      </Form>
    </FormContainer>
  );
};

export default LoginForm;