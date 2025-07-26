// src/components/auth/LoginForm.js - WITH USER TYPE SELECTION
import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  LogIn, 
  AlertCircle,
  Stethoscope,
  GraduationCap,
  Shield
} from 'lucide-react';
import { loginUser, clearError } from '../../store/slices/authSlice';
import Button from '../common/Button';
import { USER_TYPES } from '../../utils/constants';

const FormContainer = styled.form`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  font-size: 0.875rem;
`;

const UserTypeSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const UserTypeButton = styled.button`
  padding: 0.75rem 0.5rem;
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : props.theme.colors.gray300};
  background: ${props => props.selected ? props.theme.colors.primary : 'white'};
  color: ${props => props.selected ? 'white' : props.theme.colors.gray700};
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.selected ? 'white' : props.theme.colors.primary};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  .icon {
    transition: transform 0.2s ease;
  }
  
  &:hover .icon {
    transform: scale(1.1);
  }
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-left: ${props => props.hasIcon ? '2.5rem' : '1rem'};
  padding-right: ${props => props.hasRightIcon ? '2.5rem' : '1rem'};
  border: 2px solid ${props => props.error ? props.theme.colors.danger : props.theme.colors.gray300};
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? props.theme.colors.danger : props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.error ? 
      props.theme.colors.danger + '20' : 
      props.theme.colors.primary + '20'};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.gray100};
    cursor: not-allowed;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: ${props => props.theme.colors.gray500};
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: ${props => props.theme.colors.gray500};
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${props => props.theme.colors.gray700};
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: ${props => props.theme.colors.danger};
  font-size: 0.875rem;
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray700};
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  accent-color: ${props => props.theme.colors.primary};
`;

const ForgotPasswordLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
  margin-bottom: 1rem;
`;

const SignupPrompt = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.gray600};
  font-size: 0.875rem;
`;

const SignupLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: 600;
  margin-left: 0.25rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const UserTypeInfo = styled.div`
  background: ${props => props.theme.colors.gray50};
  border: 1px solid ${props => props.theme.colors.gray200};
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray600};
  text-align: center;
`;

const LoginForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: USER_TYPES.DOCTOR, // Default to doctor
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const userTypeOptions = [
    {
      value: USER_TYPES.DOCTOR,
      label: 'Doctor',
      icon: <Stethoscope size={18} className="icon" />,
      description: 'Medical Professional'
    },
    {
      value: USER_TYPES.STUDENT,
      label: 'Student',
      icon: <GraduationCap size={18} className="icon" />,
      description: 'Medical Student'
    },
    {
      value: USER_TYPES.ADMIN,
      label: 'Admin',
      icon: <Shield size={18} className="icon" />,
      description: 'Administrator'
    }
  ];

  // Clear error when user starts typing
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

  // Handle user type selection
  const handleUserTypeChange = (userType) => {
    handleInputChange('user_type', userType);
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
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.user_type) {
      errors.user_type = 'Please select your role';
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
      console.log('🔐 Submitting login form with data:', {
        email: formData.email,
        user_type: formData.user_type,
        password: '***' // Don't log password
      });

      // Send data with user_type included
      const loginData = {
        email: formData.email.trim(),
        password: formData.password,
        user_type: formData.user_type
      };

      const result = await dispatch(loginUser(loginData)).unwrap();
      
      console.log('✅ Login successful:', result);
      
      // Store remember me preference
      if (formData.rememberMe) {
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('remember_me');
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(result);
      } else {
        // Default navigation
        navigate('/feed');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      // Error is already handled by Redux
    }
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {/* User Type Selection */}
      <FormGroup>
        <Label>Select Your Role</Label>
        <UserTypeSelector>
          {userTypeOptions.map(option => (
            <UserTypeButton
              key={option.value}
              type="button"
              selected={formData.user_type === option.value}
              onClick={() => handleUserTypeChange(option.value)}
              disabled={loading}
            >
              {option.icon}
              <span>{option.label}</span>
            </UserTypeButton>
          ))}
        </UserTypeSelector>
        {fieldErrors.user_type && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {fieldErrors.user_type}
          </ErrorMessage>
        )}
      </FormGroup>

      {/* Info about selected user type */}
      <UserTypeInfo>
        Signing in as: <strong>{userTypeOptions.find(opt => opt.value === formData.user_type)?.description}</strong>
      </UserTypeInfo>

      <FormGroup>
        <Label htmlFor="email">Email Address</Label>
        <InputContainer>
          <InputIcon>
            <Mail size={18} />
          </InputIcon>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            hasIcon
            error={fieldErrors.email}
            disabled={loading}
            autoComplete="email"
            required
          />
        </InputContainer>
        {fieldErrors.email && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {fieldErrors.email}
          </ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="password">Password</Label>
        <InputContainer>
          <InputIcon>
            <Lock size={18} />
          </InputIcon>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            hasIcon
            hasRightIcon
            error={fieldErrors.password}
            disabled={loading}
            autoComplete="current-password"
            required
          />
          <PasswordToggle
            type="button"
            onClick={togglePasswordVisibility}
            disabled={loading}
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

      <RememberMeContainer>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            checked={formData.rememberMe}
            onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
            disabled={loading}
          />
          Remember me
        </CheckboxContainer>
        <ForgotPasswordLink to="/forgot-password">
          Forgot password?
        </ForgotPasswordLink>
      </RememberMeContainer>

      {error && (
        <ErrorMessage style={{ marginBottom: '1rem', justifyContent: 'center' }}>
          <AlertCircle size={16} />
          {error}
        </ErrorMessage>
      )}

      <SubmitButton
        type="submit"
        variant="primary"
        size="large"
        disabled={loading}
        loading={loading}
      >
        {loading ? (
          <>
            <LoadingSpinner />
            Signing in...
          </>
        ) : (
          <>
            <LogIn size={18} />
            Sign In as {userTypeOptions.find(opt => opt.value === formData.user_type)?.label}
          </>
        )}
      </SubmitButton>

      <SignupPrompt>
        Don't have an account?
        <SignupLink to="/register">
          Sign up here
        </SignupLink>
      </SignupPrompt>
    </FormContainer>
  );
};

export default LoginForm;