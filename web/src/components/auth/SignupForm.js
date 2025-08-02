// src/components/auth/SignupForm.js - DOCTORS ONLY VERSION
import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  UserPlus, 
  AlertCircle, 
  CheckCircle,
  Stethoscope,
  // GraduationCap,  // Commented for doctors-only
  Building2
} from 'lucide-react';
import { registerUser, clearError } from '../../store/slices/authSlice';
import Button from '../common/Button';
// import { USER_TYPES } from '../../utils/constants';  // Commented for doctors-only

const FormContainer = styled.form`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
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
  
  .required {
    color: ${props => props.theme.colors.danger};
    margin-left: 0.25rem;
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

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-left: ${props => props.hasIcon ? '2.5rem' : '1rem'};
  border: 2px solid ${props => props.error ? props.theme.colors.danger : props.theme.colors.gray300};
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? props.theme.colors.danger : props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.error ? 
      props.theme.colors.danger + '20' : 
      props.theme.colors.primary + '20'};
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

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: ${props => props.theme.colors.success};
  font-size: 0.875rem;
`;

// COMMENTED OUT - USER TYPE SELECTOR (FOR FUTURE USE)
// const UserTypeSelector = styled.div`
//   display: grid;
//   grid-template-columns: 1fr 1fr;
//   gap: 1rem;
//   margin-bottom: 1.5rem;
// `;

// const UserTypeCard = styled.div`
//   padding: 1rem;
//   border: 2px solid ${props => props.selected ? props.theme.colors.primary : props.theme.colors.gray300};
//   border-radius: 0.75rem;
//   background: ${props => props.selected ? props.theme.colors.primary + '10' : 'white'};
//   cursor: pointer;
//   transition: all 0.2s ease;
//   text-align: center;
//   
//   &:hover {
//     border-color: ${props => props.theme.colors.primary};
//     background: ${props => props.theme.colors.primary + '05'};
//   }
//   
//   .icon {
//     margin-bottom: 0.5rem;
//     color: ${props => props.selected ? props.theme.colors.primary : props.theme.colors.gray600};
//   }
//   
//   .title {
//     font-weight: 600;
//     color: ${props => props.selected ? props.theme.colors.primary : props.theme.colors.gray800};
//     margin-bottom: 0.25rem;
//   }
//   
//   .description {
//     font-size: 0.875rem;
//     color: ${props => props.theme.colors.gray600};
//   }
// `;

const PasswordStrength = styled.div`
  margin-top: 0.5rem;
  
  .strength-label {
    font-size: 0.75rem;
    color: ${props => props.theme.colors.gray600};
    margin-bottom: 0.25rem;
  }
  
  .strength-bar {
    height: 0.25rem;
    background: ${props => props.theme.colors.gray200};
    border-radius: 0.125rem;
    overflow: hidden;
  }
  
  .strength-fill {
    height: 100%;
    transition: all 0.3s ease;
    background: ${props => {
      switch (props.strength) {
        case 1: return props.theme.colors.danger;
        case 2: return props.theme.colors.warning;
        case 3: return props.theme.colors.success;
        default: return props.theme.colors.gray300;
      }
    }};
    width: ${props => (props.strength / 3) * 100}%;
  }
`;

const TermsContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.gray700};
  line-height: 1.5;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  margin-top: 0.125rem;
  accent-color: ${props => props.theme.colors.primary};
  flex-shrink: 0;
`;

const TermsLink = styled.a`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled(Button)`
  width: 100%;
  margin-bottom: 1rem;
`;

const LoginPrompt = styled.div`
  text-align: center;
  color: ${props => props.theme.colors.gray600};
  font-size: 0.875rem;
`;

const LoginLink = styled(Link)`
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

const SignupForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, registrationSuccess } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    username: '',
    user_type: 'doctor',  // FIXED TO DOCTOR - always doctor for this platform
    specialty: '',
    // college: '',  // Not needed for doctors
    bio: '',
    agreedToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // COMMENTED OUT - USER TYPES (FOR FUTURE USE)
  // const userTypes = [
  //   {
  //     value: USER_TYPES.DOCTOR,
  //     title: 'Doctor',
  //     description: 'Medical professional',
  //     icon: <Stethoscope size={24} />
  //   },
  //   {
  //     value: USER_TYPES.STUDENT,
  //     title: 'Student',
  //     description: 'Medical student',
  //     icon: <GraduationCap size={24} />
  //   }
  // ];

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/\d/.test(password) && /[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

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
    
    // Calculate password strength
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // Required fields
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
    
    // REMOVED - user_type validation (always doctor)
    // if (!formData.user_type) {
    //   errors.user_type = 'Please select your role';
    // }
    
    // Medical specialty required for doctors (which is everyone now)
    if (!formData.specialty.trim()) {
      errors.specialty = 'Medical specialty is required';
    }
    
    // REMOVED - college validation (not needed for doctors)
    // if (formData.user_type === USER_TYPES.STUDENT && !formData.college.trim()) {
    //   errors.college = 'College/University is required for students';
    // }
    
    if (!formData.agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the terms and conditions';
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
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        full_name: formData.full_name.trim(),
        username: formData.username.trim(),
        user_type: 'doctor',  // ALWAYS DOCTOR
        specialty: formData.specialty.trim(),
        bio: formData.bio.trim() || null
      };
      
      // REMOVED - conditional fields logic (always doctor now)
      // if (formData.user_type === USER_TYPES.DOCTOR) {
      //   userData.specialty = formData.specialty.trim();
      // }
      // 
      // if (formData.user_type === USER_TYPES.STUDENT) {
      //   userData.college = formData.college.trim();
      // }
      
      await dispatch(registerUser(userData)).unwrap();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Show success message and redirect to login
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please log in with your credentials.' 
            }
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      // Error is already handled by Redux
    }
  };

  // Show success message
  if (registrationSuccess) {
    return (
      <FormContainer>
        <SuccessMessage style={{ 
          padding: '2rem', 
          textAlign: 'center', 
          flexDirection: 'column',
          gap: '1rem',
          fontSize: '1rem'
        }}>
          <CheckCircle size={48} />
          <div>
            <strong>Registration Successful!</strong>
            <br />
            Welcome to the medical professional community!
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </Button>
        </SuccessMessage>
      </FormContainer>
    );
  }

  return (
    <FormContainer onSubmit={handleSubmit}>
      {/* COMMENTED OUT - User Type Selection (FOR FUTURE USE) */}
      {/* <FormGroup>
        <Label>Select Your Role <span className="required">*</span></Label>
        <UserTypeSelector>
          {userTypes.map(type => (
            <UserTypeCard
              key={type.value}
              selected={formData.user_type === type.value}
              onClick={() => handleInputChange('user_type', type.value)}
            >
              <div className="icon">{type.icon}</div>
              <div className="title">{type.title}</div>
              <div className="description">{type.description}</div>
            </UserTypeCard>
          ))}
        </UserTypeSelector>
        {fieldErrors.user_type && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {fieldErrors.user_type}
          </ErrorMessage>
        )}
      </FormGroup> */}

      {/* HIDDEN INPUT - Always Doctor */}
      <input type="hidden" value="doctor" name="user_type" />

      {/* Name and Username */}
      <FormRow columns="1fr 1fr">
        <FormGroup>
          <Label htmlFor="full_name">Full Name <span className="required">*</span></Label>
          <InputContainer>
            <InputIcon>
              <User size={18} />
            </InputIcon>
            <Input
              id="full_name"
              type="text"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              hasIcon
              error={fieldErrors.full_name}
              disabled={loading}
              autoComplete="name"
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
          <Label htmlFor="username">Username <span className="required">*</span></Label>
          <InputContainer>
            <InputIcon>
              <User size={18} />
            </InputIcon>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
              hasIcon
              error={fieldErrors.username}
              disabled={loading}
              autoComplete="username"
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
        <Label htmlFor="email">Email Address <span className="required">*</span></Label>
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
          />
        </InputContainer>
        {fieldErrors.email && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {fieldErrors.email}
          </ErrorMessage>
        )}
      </FormGroup>

      {/* Password Fields */}
      <FormRow columns="1fr 1fr">
        <FormGroup>
          <Label htmlFor="password">Password <span className="required">*</span></Label>
          <InputContainer>
            <InputIcon>
              <Lock size={18} />
            </InputIcon>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              hasIcon
              hasRightIcon
              error={fieldErrors.password}
              disabled={loading}
              autoComplete="new-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </PasswordToggle>
          </InputContainer>
          {formData.password && (
            <PasswordStrength strength={passwordStrength}>
              <div className="strength-label">
                Password strength: {
                  passwordStrength === 0 ? 'Weak' :
                  passwordStrength === 1 ? 'Fair' :
                  passwordStrength === 2 ? 'Good' : 'Strong'
                }
              </div>
              <div className="strength-bar">
                <div className="strength-fill" />
              </div>
            </PasswordStrength>
          )}
          {fieldErrors.password && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {fieldErrors.password}
            </ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="confirmPassword">Confirm Password <span className="required">*</span></Label>
          <InputContainer>
            <InputIcon>
              <Lock size={18} />
            </InputIcon>
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              hasIcon
              hasRightIcon
              error={fieldErrors.confirmPassword}
              disabled={loading}
              autoComplete="new-password"
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
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

      {/* Medical Specialty - ALWAYS SHOWN (since everyone is a doctor) */}
      <FormGroup>
        <Label htmlFor="specialty">Medical Specialty <span className="required">*</span></Label>
        <InputContainer>
          <InputIcon>
            <Stethoscope size={18} />
          </InputIcon>
          <Input
            id="specialty"
            type="text"
            placeholder="e.g., Cardiology, Neurology, General Medicine"
            value={formData.specialty}
            onChange={(e) => handleInputChange('specialty', e.target.value)}
            hasIcon
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

      {/* COMMENTED OUT - College Field (not needed for doctors) */}
      {/* {formData.user_type === USER_TYPES.STUDENT && (
        <FormGroup>
          <Label htmlFor="college">College/University <span className="required">*</span></Label>
          <InputContainer>
            <InputIcon>
              <Building2 size={18} />
            </InputIcon>
            <Input
              id="college"
              type="text"
              placeholder="Enter your college or university name"
              value={formData.college}
              onChange={(e) => handleInputChange('college', e.target.value)}
              hasIcon
              error={fieldErrors.college}
              disabled={loading}
            />
          </InputContainer>
          {fieldErrors.college && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {fieldErrors.college}
            </ErrorMessage>
          )}
        </FormGroup>
      )} */}

      {/* Bio */}
      <FormGroup>
        <Label htmlFor="bio">Professional Bio (Optional)</Label>
        <Input
          id="bio"
          as="textarea"
          rows="3"
          placeholder="Tell us about your medical background and interests..."
          value={formData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          disabled={loading}
          style={{ resize: 'vertical', minHeight: '80px' }}
        />
      </FormGroup>

      {/* Terms and Conditions */}
      <TermsContainer>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            checked={formData.agreedToTerms}
            onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
            disabled={loading}
          />
          I agree to the{' '}
          <TermsLink href="/terms" target="_blank">
            Terms of Service
          </TermsLink>{' '}
          and{' '}
          <TermsLink href="/privacy" target="_blank">
            Privacy Policy
          </TermsLink>
        </CheckboxContainer>
        {fieldErrors.agreedToTerms && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {fieldErrors.agreedToTerms}
          </ErrorMessage>
        )}
      </TermsContainer>

      {error && (
        <ErrorMessage style={{ marginBottom: '1rem' }}>
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
            Creating Account...
          </>
        ) : (
          <>
            <UserPlus size={18} />
            Join Medical Community
          </>
        )}
      </SubmitButton>

      <LoginPrompt>
        Already have an account?
        <LoginLink to="/login">
          Sign in here
        </LoginLink>
      </LoginPrompt>
    </FormContainer>
  );
};

export default SignupForm;