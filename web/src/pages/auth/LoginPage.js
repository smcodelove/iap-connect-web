// web/src/pages/auth/LoginPage.js - CLEAN & MINIMAL VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, CheckCircle, Stethoscope, AlertCircle } from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm';
import { clearError } from '../../store/slices/authSlice';

// Styled Components
const LoginContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  .logo-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    color: white;
  }
  
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: ${props => props.theme.colors.gray900};
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: ${props => props.theme.colors.gray600};
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
  }
  
  .subtitle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: ${props => props.theme.colors.blue600};
    font-weight: 500;
    font-size: 0.875rem;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: ${props => props.theme.colors.green50};
  border: 1px solid ${props => props.theme.colors.green200};
  color: ${props => props.theme.colors.green700};
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: ${props => props.theme.colors.red50};
  border: 1px solid ${props => props.theme.colors.red200};
  color: ${props => props.theme.colors.red700};
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  
  .error-icon {
    flex-shrink: 0;
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme.colors.blue50};
  border-radius: 0.75rem;
  border: 1px solid ${props => props.theme.colors.blue200};
  
  .welcome-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: ${props => props.theme.colors.blue500};
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    color: white;
  }
  
  .welcome-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme.colors.gray900};
    margin-bottom: 0.75rem;
  }
  
  .welcome-text {
    color: ${props => props.theme.colors.gray700};
    line-height: 1.6;
    font-size: 0.95rem;
  }
`;

const LoginFooter = styled.div`
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.gray200};
  
  .register-prompt {
    color: ${props => props.theme.colors.gray600};
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
  
  .register-link {
    color: ${props => props.theme.colors.blue600};
    text-decoration: none;
    font-weight: 600;
    font-size: 0.875rem;
    
    &:hover {
      color: ${props => props.theme.colors.blue700};
      text-decoration: underline;
    }
  }
`;

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = useSelector(state => state.auth);
  
  // Get success message from navigation state
  const successMessage = location.state?.message;

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Handle successful login
  const handleLoginSuccess = () => {
    navigate('/feed');
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <div className="logo-icon">
            <Heart size={28} />
          </div>
          <h1>IAP Connect</h1>
          <p>Medical Professional Platform</p>
          <div className="subtitle">
            <Stethoscope size={16} />
            <span>For Healthcare Professionals</span>
          </div>
        </Logo>

        {/* Success Message */}
        {successMessage && (
          <SuccessMessage>
            <CheckCircle size={20} />
            <div>{successMessage}</div>
          </SuccessMessage>
        )}

        {/* Error Message */}
        {error && (
          <ErrorMessage>
            <AlertCircle size={20} className="error-icon" />
            <div>{error}</div>
          </ErrorMessage>
        )}

        {/* Welcome Message */}
        <WelcomeMessage>
          <div className="welcome-icon">
            <Stethoscope size={20} />
          </div>
          <div className="welcome-title">Welcome Back</div>
          <div className="welcome-text">
            Sign in to access your medical professional network and resources.
          </div>
        </WelcomeMessage>

        {/* Login Form - NOW CLEAN WITHOUT USER TYPE SELECTION */}
        <LoginForm onSuccess={handleLoginSuccess} />

        {/* Footer */}
        <LoginFooter>
          <div className="register-prompt">New to the medical community?</div>
          <Link to="/register" className="register-link">
            Create Professional Account
          </Link>
        </LoginFooter>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;