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
  gap: 0.5rem;
  color: ${props => props.theme.colors.red600};
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
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
  accent-color: ${props => props.theme.colors.blue500};
`;

const ForgotPassword = styled.a`
  color: ${props => props.theme.colors.blue600};
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 1rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    background: ${props => props.theme.colors.gray400};
    cursor: not-allowed;
    transform: none;
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

// COMMENTED OUT - User Type Selector (for future use)
/*
const UserTypeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const UserTypeCard = styled.button`
  padding: 0.75rem 0.5rem;
  border: 2px solid ${props => props.selected ? props.theme.colors.blue500 : props.theme.colors.gray200};
  border-radius: 0.5rem;
  background: ${props => props.selected ? props.theme.colors.blue50 : 'white'};
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  
  &:hover {
    border-color: ${props => props.theme.colors.blue400};
    background-color: ${props => props.theme.colors.blue25};
  }
  
  .icon {
    color: ${props => props.selected ? props.theme.colors.blue600 : props.theme.colors.gray500};
    margin-bottom: 0.25rem;
  }
  
  .label {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${props => props.selected ? props.theme.colors.blue800 : props.theme.colors.gray700};
    margin-bottom: 0.125rem;
  }
  
  .description {
    font-size: 0.6rem;
    color: ${props => props.selected ? props.theme.colors.blue600 : props.theme.colors.gray500};
  }
`;
*/

const LoginForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: 'doctor', // FIXED TO DOCTOR - no selection needed
    rememberMe: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // COMMENTED OUT - User Type Options (for future use)
  /*
  const userTypeOptions = [
    {
      value: 'doctor',
      label: 'Doctor',
      icon: <Stethoscope size={18} className="icon" />,
      description: 'Medical Professional'
    },
    {
      value: 'student',
      label: 'Student',
      icon: <GraduationCap size={18} className="icon" />,
      description: 'Medical Student'
    },
    {
      value: 'admin',
      label: 'Admin',
      icon: <Shield size={18} className="icon" />,
      description: 'Administrator'
    }
  ];
  */

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

  // COMMENTED OUT - User Type Handler (for future use)
  /*
  const handleUserTypeChange = (userType) => {
    handleInputChange('user_type', userType);
  };
  */

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
    
    // REMOVED - User type validation (always doctor)
    // if (!formData.user_type) {
    //   errors.user_type = 'Please select your role';
    // }
    
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
        password: formData.password,
        user_type: 'doctor' // ALWAYS DOCTOR
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
        {/* COMMENTED OUT - User Type Selection */}
        {/*
        <FormGroup>
          <Label>Select Your Role</Label>
          <UserTypeSelector>
            {userTypeOptions.map(option => (
              <UserTypeCard
                key={option.value}
                type="button"
                selected={formData.user_type === option.value}
                onClick={() => handleUserTypeChange(option.value)}
              >
                <div className="icon">{option.icon}</div>
                <div className="label">{option.label}</div>
                <div className="description">{option.description}</div>
              </UserTypeCard>
            ))}
          </UserTypeSelector>
          {fieldErrors.user_type && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {fieldErrors.user_type}
            </ErrorMessage>
          )}
        </FormGroup>
        */}

        {/* Hidden input - ALWAYS DOCTOR */}
        <input type="hidden" name="user_type" value="doctor" />

        {/* Email */}
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
              id="password"
              type={showPassword ? 'text' : 'password'}
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

        {/* Remember Me & Forgot Password */}
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
          <ForgotPassword href="/forgot-password">
            Forgot password?
          </ForgotPassword>
        </RememberMeContainer>

        {/* Global Error */}
        {error && (
          <ErrorMessage style={{ marginBottom: '0.5rem' }}>
            <AlertCircle size={16} />
            {error}
          </ErrorMessage>
        )}

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
              Sign In to IAP Connect
            </>
          )}
        </SubmitButton>
      </Form>
    </FormContainer>
  );
};

export default LoginForm;