// web/src/pages/auth/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  GraduationCap, 
  Stethoscope,
  School,
  BookOpen
} from 'lucide-react';
import { registerUser } from '../../store/slices/authSlice';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const RegisterCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;
  
  h1 {
    color: ${props => props.theme.colors.primary};
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 8px;
  }
  
  p {
    color: ${props => props.theme.colors.gray600};
    font-size: 1.1rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  font-size: 1.1rem;
  margin: 20px 0 10px 0;
  border-bottom: 2px solid ${props => props.theme.colors.gray200};
  padding-bottom: 8px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 50px 15px 15px;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 15px 50px 15px 15px;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 15px;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const InputIcon = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.gray400};
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  
  &:hover {
    color: ${props => props.clickable ? props.theme.colors.primary : props.theme.colors.gray400};
  }
`;

const RegisterButton = styled.button`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
  color: white;
  padding: 15px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 102, 204, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: ${props => props.theme.colors.danger};
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  text-align: center;
  margin-bottom: 20px;
`;

const RegisterFooter = styled.div`
  text-align: center;
  margin-top: 30px;
  
  p {
    color: ${props => props.theme.colors.gray600};
    margin-bottom: 10px;
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    font-weight: 600;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const UserTypeSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const UserTypeButton = styled.button`
  flex: 1;
  padding: 12px;
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : props.theme.colors.gray200};
  background: ${props => props.selected ? props.theme.colors.primary : 'white'};
  color: ${props => props.selected ? 'white' : props.theme.colors.gray600};
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.selected ? 'white' : props.theme.colors.primary};
  }
`;

const InfoBox = styled.div`
  background: ${props => props.theme.colors.gray50};
  border: 1px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.gray700};
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Specialty options for doctors
const MEDICAL_SPECIALTIES = [
  'General Medicine',
  'Cardiology',
  'Neurology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Psychiatry',
  'Surgery',
  'Anesthesiology',
  'Radiology',
  'Pathology',
  'Emergency Medicine',
  'Family Medicine',
  'Internal Medicine',
  'Obstetrics & Gynecology',
  'Ophthalmology',
  'ENT (Otolaryngology)',
  'Urology',
  'Oncology',
  'Gastroenterology',
  'Pulmonology',
  'Nephrology',
  'Endocrinology',
  'Rheumatology',
  'Other'
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirm_password: '',
    user_type: 'doctor',
    bio: '',
    specialty: '',
    college: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserTypeSelect = (type) => {
    setFormData({
      ...formData,
      user_type: type,
      specialty: type === 'doctor' ? formData.specialty : '',
      college: type === 'student' ? formData.college : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm_password) {
      alert('Passwords do not match!');
      return;
    }

    // Validate required fields based on user type
    if (formData.user_type === 'doctor' && !formData.specialty) {
      alert('Please select your medical specialty');
      return;
    }

    if (formData.user_type === 'student' && !formData.college) {
      alert('Please enter your college/university name');
      return;
    }
    
    try {
      const { confirm_password, ...registerData } = formData;
      const result = await dispatch(registerUser(registerData)).unwrap();
      if (result.access_token) {
        navigate('/feed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo>
          <h1>IAP Connect</h1>
          <p>Join the Medical Community</p>
        </Logo>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          {/* User Type Selection */}
          <SectionTitle>Account Type</SectionTitle>
          <UserTypeSelector>
            <UserTypeButton
              type="button"
              selected={formData.user_type === 'doctor'}
              onClick={() => handleUserTypeSelect('doctor')}
            >
              <Stethoscope size={16} />
              Doctor
            </UserTypeButton>
            <UserTypeButton
              type="button"
              selected={formData.user_type === 'student'}
              onClick={() => handleUserTypeSelect('student')}
            >
              <GraduationCap size={16} />
              Student
            </UserTypeButton>
          </UserTypeSelector>

          {/* Basic Information */}
          <SectionTitle>Basic Information</SectionTitle>
          
          <InputGroup>
            <Input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
            />
            <InputIcon>
              <User size={20} />
            </InputIcon>
          </InputGroup>

          <InputGroup>
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
            <InputIcon>
              <User size={20} />
            </InputIcon>
          </InputGroup>

          <InputGroup>
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
          </InputGroup>

          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            <InputIcon 
              clickable 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </InputIcon>
          </InputGroup>

          <InputGroup>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              required
            />
            <InputIcon 
              clickable 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </InputIcon>
          </InputGroup>

          {/* Professional Information */}
          <SectionTitle>Professional Information</SectionTitle>

          {formData.user_type === 'doctor' && (
            <>
              <InfoBox>
                <Stethoscope size={16} />
                Please select your medical specialty for better networking
              </InfoBox>
              <InputGroup>
                <Select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Medical Specialty</option>
                  {MEDICAL_SPECIALTIES.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </Select>
                <InputIcon>
                  <Stethoscope size={20} />
                </InputIcon>
              </InputGroup>
            </>
          )}

          {formData.user_type === 'student' && (
            <>
              <InfoBox>
                <School size={16} />
                Enter your college/university to connect with peers
              </InfoBox>
              <InputGroup>
                <Input
                  type="text"
                  name="college"
                  placeholder="College/University Name"
                  value={formData.college}
                  onChange={handleInputChange}
                  required
                />
                <InputIcon>
                  <School size={20} />
                </InputIcon>
              </InputGroup>
            </>
          )}

          <TextArea
            name="bio"
            placeholder="Tell us about yourself (optional)"
            value={formData.bio}
            onChange={handleInputChange}
            maxLength={500}
          />

          <RegisterButton type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </RegisterButton>
        </Form>

        <RegisterFooter>
          <p>Already have an account?</p>
          <Link to="/login">Sign In</Link>
        </RegisterFooter>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;