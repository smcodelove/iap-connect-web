// web/src/components/auth/SignupForm.js - COMPLETE VERSION
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  UserCheck,
  Stethoscope,
  GraduationCap,
  Shield,
  Loader
} from 'lucide-react';
import { registerUser } from '../../store/slices/authSlice';

const FormContainer = styled.form`
  width: 100%;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  &.user-type-group {
    margin-bottom: 24px;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${props => props.theme.colors.gray700};
  font-size: 0.9rem;
`;

const InputWrapper = styled.div`
  position: relative;
  
  .input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.gray400};
    z-index: 2;
  }
  
  .password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: ${props => props.theme.colors.gray400};
    cursor: pointer;
    padding: 4px;
    
    &:hover {
      color: ${props => props.theme.colors.gray600};
    }
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 12px;
  font-size: 0.95rem;
  background: white;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray400};
  }
  
  &.error {
    border-color: ${props => props.theme.colors.danger};
  }
`;

const UserTypeSection = styled.div`
  .user-type-label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
    color: ${props => props.theme.colors.gray700};
    font-size: 0.9rem;
  }
  
  .user-type-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    
    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }
`;

const UserTypeOption = styled.div`
  position: relative;
  
  input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .user-type-card {
    padding: 16px 12px;
    border: 2px solid ${props => props.theme.colors.gray200};
    border-radius: 12px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    background: white;
    
    &:hover {
      border-color: ${props => props.theme.colors.primary};
      background: ${props => props.theme.colors.primary}05;
    }
    
    &.selected {
      border-color: ${props => props.theme.colors.primary};
      background: ${props => props.theme.colors.primary}10;
      
      .type-title {
        color: ${props => props.theme.colors.primary};
      }
      
      .type-icon {
        color: ${props => props.theme.colors.primary};
      }
    }
    
    .type-icon {
      color: ${props => props.theme.colors.gray400};
      margin-bottom: 8px;
      transition: color 0.2s ease;
    }
    
    .type-title {
      font-weight: 600;
      color: ${props => props.theme.colors.gray700};
      font-size: 0.85rem;
      margin-bottom: 4px;
      transition: color 0.2s ease;
    }
    
    .type-description {
      color: ${props => props.theme.colors.gray500};
      font-size: 0.75rem;
      line-height: 1.3;
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  box-shadow: 0 4px 12px ${props => props.theme.colors.primary}30;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px ${props => props.theme.colors.primary}40;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  .loading-spinner {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorText = styled.div`
  color: ${props => props.theme.colors.danger};
  font-size: 0.8rem;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SuccessText = styled.div`
  color: ${props => props.theme.colors.success};
  font-size: 0.8rem;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SignupForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userType: 'student'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          newErrors.username = 'Username is required';
        } else if (value.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username = 'Username can only contain letters, numbers, and underscores';
        } else {
          delete newErrors.username;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Full name is required';
        } else if (value.trim().length < 2) {
          newErrors.fullName = 'Full name must be at least 2 characters';
        } else {
          delete newErrors.fullName;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleUserTypeChange = (userType) => {
    setFormData(prev => ({ ...prev, userType }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = ['username', 'email', 'password', 'confirmPassword', 'fullName'];
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
      validateField(field, formData[field]);
    });
    setTouched(newTouched);
    
    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    try {
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        full_name: formData.fullName.trim(),
        user_type: formData.userType
      };
      
      const result = await dispatch(registerUser(registrationData)).unwrap();
      
      if (result) {
        onSuccess && onSuccess();
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const userTypeOptions = [
    {
      value: 'student',
      title: 'Student',
      description: 'Medical student or trainee',
      icon: GraduationCap
    },
    {
      value: 'doctor',
      title: 'Doctor',
      description: 'Licensed medical professional',
      icon: Stethoscope
    },
    {
      value: 'admin',
      title: 'Admin',
      description: 'Platform administrator',
      icon: Shield
    }
  ];

  return (
    <FormContainer onSubmit={handleSubmit}>
      {/* User Type Selection */}
      <FormGroup className="user-type-group">
        <UserTypeSection>
          <div className="user-type-label">I am a:</div>
          <div className="user-type-grid">
            {userTypeOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <UserTypeOption key={option.value}>
                  <input
                    type="radio"
                    name="userType"
                    value={option.value}
                    checked={formData.userType === option.value}
                    onChange={() => handleUserTypeChange(option.value)}
                  />
                  <div 
                    className={`user-type-card ${formData.userType === option.value ? 'selected' : ''}`}
                    onClick={() => handleUserTypeChange(option.value)}
                  >
                    <div className="type-icon">
                      <IconComponent size={20} />
                    </div>
                    <div className="type-title">{option.title}</div>
                    <div className="type-description">{option.description}</div>
                  </div>
                </UserTypeOption>
              );
            })}
          </div>
        </UserTypeSection>
      </FormGroup>

      {/* Full Name */}
      <FormGroup>
        <Label htmlFor="fullName">Full Name</Label>
        <InputWrapper>
          <User size={18} className="input-icon" />
          <Input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.fullName ? 'error' : ''}
          />
        </InputWrapper>
        {errors.fullName && touched.fullName && (
          <ErrorText>{errors.fullName}</ErrorText>
        )}
      </FormGroup>

      {/* Username */}
      <FormGroup>
        <Label htmlFor="username">Username</Label>
        <InputWrapper>
          <UserCheck size={18} className="input-icon" />
          <Input
            type="text"
            id="username"
            name="username"
            placeholder="Choose a unique username"
            value={formData.username}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.username ? 'error' : ''}
          />
        </InputWrapper>
        {errors.username && touched.username && (
          <ErrorText>{errors.username}</ErrorText>
        )}
      </FormGroup>

      {/* Email */}
      <FormGroup>
        <Label htmlFor="email">Email Address</Label>
        <InputWrapper>
          <Mail size={18} className="input-icon" />
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.email ? 'error' : ''}
          />
        </InputWrapper>
        {errors.email && touched.email && (
          <ErrorText>{errors.email}</ErrorText>
        )}
      </FormGroup>

      {/* Password */}
      <FormGroup>
        <Label htmlFor="password">Password</Label>
        <InputWrapper>
          <Lock size={18} className="input-icon" />
          <Input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.password ? 'error' : ''}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </InputWrapper>
        {errors.password && touched.password && (
          <ErrorText>{errors.password}</ErrorText>
        )}
      </FormGroup>

      {/* Confirm Password */}
      <FormGroup>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <InputWrapper>
          <Lock size={18} className="input-icon" />
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={errors.confirmPassword ? 'error' : ''}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </InputWrapper>
        {errors.confirmPassword && touched.confirmPassword && (
          <ErrorText>{errors.confirmPassword}</ErrorText>
        )}
      </FormGroup>

      {/* Submit Button */}
      <SubmitButton type="submit" disabled={loading || Object.keys(errors).length > 0}>
        {loading ? (
          <>
            <Loader size={18} className="loading-spinner" />
            Creating Account...
          </>
        ) : (
          <>
            <UserCheck size={18} />
            Create Account
          </>
        )}
      </SubmitButton>
    </FormContainer>
  );
};

export default SignupForm;