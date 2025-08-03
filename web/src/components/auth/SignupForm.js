// web/src/components/auth/SignupForm.js - FIXED VERSION
import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, AlertCircle, CheckCircle, Stethoscope } from 'lucide-react';
import { registerUser, clearError } from '../../store/slices/authSlice';

const FormContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
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
  
  .required {
    color: ${props => props.theme.colors.red500};
  }
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
  padding: ${props => props.hasIcon ? '0.75rem 0.75rem 0.75rem 2.5rem' : '0.75rem'};
  border: 1px solid ${props => props.error ? 
    props.theme.colors.red300 : 
    props.theme.colors.gray300
  };
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

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.error ? 
    props.theme.colors.red300 : 
    props.theme.colors.gray300
  };
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.blue500};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.blue100};
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray400};
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Checkbox = styled.input`
  margin-top: 0.25rem;
  accent-color: ${props => props.theme.colors.blue600};
`;

const CheckboxLabel = styled.label`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray700};
  line-height: 1.4;
  
  a {
    color: ${props => props.theme.colors.blue600};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
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

const PasswordStrengthContainer = styled.div`
  margin-top: 0.5rem;
`;

const PasswordStrengthBar = styled.div`
  width: 100%;
  height: 0.25rem;
  background-color: ${props => props.theme.colors.gray200};
  border-radius: 0.125rem;
  overflow: hidden;
`;

const PasswordStrengthFill = styled.div`
  height: 100%;
  width: ${props => props.strength * 25}%;
  background-color: ${props => {
    if (props.strength <= 1) return props.theme.colors.red500;
    if (props.strength <= 2) return props.theme.colors.yellow500;
    if (props.strength <= 3) return props.theme.colors.blue500;
    return props.theme.colors.green500;
  }};
  transition: all 0.3s ease;
`;

const PasswordStrengthText = styled.div`
  font-size: 0.75rem;
  margin-top: 0.25rem;
  color: ${props => {
    if (props.strength <= 1) return props.theme.colors.red600;
    if (props.strength <= 2) return props.theme.colors.yellow600;
    if (props.strength <= 3) return props.theme.colors.blue600;
    return props.theme.colors.green600;
  }};
`;

const SubmitButton = styled.button`
  width: 100%;
  background: ${props => props.theme.colors.blue600};
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

const SignupForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);
  
  // FIXED: Default to doctor, no user type selection
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: '', // Always required since everyone is doctor
    bio: '',
    agreedToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
    
    if (error) {
      dispatch(clearError());
    }
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  // Form validation - DOCTORS ONLY
  const validateForm = () => {
    const errors = {};
    
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Medical specialty is required (all users are doctors)
    if (!formData.specialty.trim()) {
      errors.specialty = 'Medical specialty is required';
    }
    
    if (!formData.agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the terms and conditions';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission - ALWAYS DOCTOR
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        username: formData.username.trim(),
        user_type: 'doctor', // HARDCODED TO DOCTOR
        specialty: formData.specialty.trim(),
        bio: formData.bio.trim() || null
      };
      
      await dispatch(registerUser(userData)).unwrap();
      
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please log in with your credentials.'
            } 
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        {/* Full Name and Username Row */}
        <FormRow>
          <FormGroup>
            <Label htmlFor="full_name">
              Full Name <span className="required">*</span>
            </Label>
            <InputContainer>
              <InputIcon>
                <User size={18} />
              </InputIcon>
              <Input
                type="text"
                id="full_name"
                hasIcon
                placeholder="Enter your full name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                error={fieldErrors.full_name}
                disabled={loading}
              />
            </InputContainer>
            {fieldErrors.full_name && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {fieldErrors.full_name}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="username">
              Username <span className="required">*</span>
            </Label>
            <InputContainer>
              <InputIcon>
                <User size={18} />
              </InputIcon>
              <Input
                type="text"
                id="username"
                hasIcon
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                error={fieldErrors.username}
                disabled={loading}
              />
            </InputContainer>
            {fieldErrors.username && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {fieldErrors.username}
              </ErrorMessage>
            )}
          </FormGroup>
        </FormRow>

        {/* Email */}
        <FormGroup>
          <Label htmlFor="email">
            Email Address <span className="required">*</span>
          </Label>
          <InputContainer>
            <InputIcon>
              <Mail size={18} />
            </InputIcon>
            <Input
              type="email"
              id="email"
              hasIcon
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={fieldErrors.email}
              disabled={loading}
            />
          </InputContainer>
          {fieldErrors.email && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {fieldErrors.email}
            </ErrorMessage>
          )}
        </FormGroup>

        {/* Medical Specialty - Always shown since everyone is doctor */}
        <FormGroup>
          <Label htmlFor="specialty">
            Medical Specialty <span className="required">*</span>
          </Label>
          <InputContainer>
            <InputIcon>
              <Stethoscope size={18} />
            </InputIcon>
            <Input
              type="text"
              id="specialty"
              hasIcon
              placeholder="e.g., Cardiology, Neurology, General Medicine"
              value={formData.specialty}
              onChange={(e) => handleInputChange('specialty', e.target.value)}
              error={fieldErrors.specialty}
              disabled={loading}
            />
          </InputContainer>
          {fieldErrors.specialty && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {fieldErrors.specialty}
            </ErrorMessage>
          )}
        </FormGroup>

        {/* Password and Confirm Password Row */}
        <FormRow>
          <FormGroup>
            <Label htmlFor="password">
              Password <span className="required">*</span>
            </Label>
            <InputContainer>
              <InputIcon>
                <Lock size={18} />
              </InputIcon>
              <Input
                type={showPassword ? 'text' : 'password'}
                id="password"
                hasIcon
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={fieldErrors.password}
                disabled={loading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </PasswordToggle>
            </InputContainer>
            
            {formData.password && (
              <PasswordStrengthContainer>
                <PasswordStrengthBar>
                  <PasswordStrengthFill strength={passwordStrength} />
                </PasswordStrengthBar>
                <PasswordStrengthText strength={passwordStrength}>
                  Password strength: {getPasswordStrengthText()}
                </PasswordStrengthText>
              </PasswordStrengthContainer>
            )}
            
            {fieldErrors.password && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {fieldErrors.password}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="required">*</span>
            </Label>
            <InputContainer>
              <InputIcon>
                <Lock size={18} />
              </InputIcon>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                hasIcon
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                error={fieldErrors.confirmPassword}
                disabled={loading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </PasswordToggle>
            </InputContainer>
            {fieldErrors.confirmPassword && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {fieldErrors.confirmPassword}
              </ErrorMessage>
            )}
          </FormGroup>
        </FormRow>

        {/* Bio - Optional */}
        <FormGroup>
          <Label htmlFor="bio">
            Professional Bio <em>(Optional)</em>
          </Label>
          <TextArea
            id="bio"
            placeholder="Tell us about your medical background and interests..."
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            error={fieldErrors.bio}
            disabled={loading}
          />
        </FormGroup>

        {/* Terms and Conditions */}
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            id="agreedToTerms"
            checked={formData.agreedToTerms}
            onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
            disabled={loading}
          />
          <CheckboxLabel htmlFor="agreedToTerms">
            I agree to the{' '}
            <Link to="/terms" target="_blank">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" target="_blank">Privacy Policy</Link>
          </CheckboxLabel>
        </CheckboxContainer>
        {fieldErrors.agreedToTerms && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {fieldErrors.agreedToTerms}
          </ErrorMessage>
        )}

        {/* Submit Button */}
        <SubmitButton type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoadingSpinner />
              Creating Account...
            </>
          ) : (
            <>
              <UserPlus size={20} />
              Join IAP Connect
            </>
          )}
        </SubmitButton>
      </Form>
    </FormContainer>
  );
};

export default SignupForm;