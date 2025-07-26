// web/src/pages/auth/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react';
import { loginUser } from '../../store/slices/authSlice';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
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

const LoginButton = styled.button`
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

const LoginFooter = styled.div`
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
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.selected ? 'white' : props.theme.colors.primary};
  }
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: 'doctor'
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserTypeSelect = (type) => {
    setFormData({
      ...formData,
      user_type: type
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser(formData)).unwrap();
      if (result.access_token) {
        navigate('/feed');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <h1>IAP Connect</h1>
          <p>Connecting Medical Professionals</p>
        </Logo>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <UserTypeSelector>
            <UserTypeButton
              type="button"
              selected={formData.user_type === 'doctor'}
              onClick={() => handleUserTypeSelect('doctor')}
            >
              Doctor
            </UserTypeButton>
            <UserTypeButton
              type="button"
              selected={formData.user_type === 'student'}
              onClick={() => handleUserTypeSelect('student')}
            >
              Student
            </UserTypeButton>
          </UserTypeSelector>

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

          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </LoginButton>
        </Form>

        <LoginFooter>
          <p>Don't have an account?</p>
          <Link to="/register">Create Account</Link>
        </LoginFooter>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;