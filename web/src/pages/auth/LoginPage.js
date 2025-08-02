// web/src/pages/auth/LoginPage.js - DOCTORS ONLY VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Users, CheckCircle, Shield, Stethoscope, GraduationCap, AlertCircle } from 'lucide-react';
import LoginForm from '../../components/auth/LoginForm';
import { clearError } from '../../store/slices/authSlice';

// Styled Components (keeping all existing styles)
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
  max-width: 500px;
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

// COMMENTED OUT - User Type Info (keeping for future use)
/*
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
*/

// NEW - Medical Professional Info
const ProfessionalInfo = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid ${props => props.theme.colors.blue200};
  border-radius: 0.75rem;
  text-align: center;
  background: ${props => props.theme.colors.blue50};
  
  .professional-icon {
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
  
  .professional-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${props => props.theme.colors.gray900};
    margin-bottom: 0.5rem;
  }
  
  .professional-description {
    font-size: 0.875rem;
    color: ${props => props.theme.colors.gray700};
    line-height: 1.6;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  
  .feature-item {
    text-align: center;
    padding: 1rem 0.5rem;
    background: ${props => props.theme.colors.gray50};
    border-radius: 0.5rem;
    border: 1px solid ${props => props.theme.colors.gray200};
  }
  
  .feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: ${props => props.theme.colors.blue100};
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    color: ${props => props.theme.colors.blue600};
  }
  
  .feature-title {
    font-size: 0.75rem;
    font-weight: 600;
    color: ${props => props.theme.colors.gray800};
    margin-bottom: 0.25rem;
  }
  
  .feature-description {
    font-size: 0.7rem;
    color: ${props => props.theme.colors.gray600};
    line-height: 1.4;
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

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: ${props => props.theme.colors.purple50};
  border: 1px solid ${props => props.theme.colors.purple200};
  border-radius: 0.5rem;
  font-size: 0.8rem;
  color: ${props => props.theme.colors.purple700};
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
          <div className="welcome-title">Welcome Back, Doctor</div>
          <div className="welcome-text">
            Sign in to connect with your medical community and access 
            professional resources.
          </div>
        </WelcomeMessage>

        {/* COMMENTED OUT - User Type Information (for future use) */}
        {/*
        <UserTypeInfo>
          <div>
            🩺 For Medical Professionals & Students | 
            🔒 Secure & Private | 
            🌐 Global Community
          </div>
        </UserTypeInfo>
        */}

        {/* NEW - Medical Professional Focus */}
        <ProfessionalInfo>
          <div className="professional-icon">
            <Stethoscope size={20} />
          </div>
          <div className="professional-title">Professional Medical Network</div>
          <div className="professional-description">
            Connect with colleagues, share expertise, and advance healthcare together.
          </div>
        </ProfessionalInfo>

        {/* Security Badge */}
        <SecurityBadge>
          <Shield size={16} />
          <span>Enterprise-grade security for medical professionals</span>
        </SecurityBadge>

        {/* Login Form */}
        <LoginForm onSuccess={handleLoginSuccess} />

        {/* Features Grid - UPDATED for medical professionals */}
        <FeaturesGrid>
          <div className="feature-item">
            <div className="feature-icon">
              <Users size={16} />
            </div>
            <div className="feature-title">Network</div>
            <div className="feature-description">Connect with peers</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <Heart size={16} />
            </div>
            <div className="feature-title">Cases</div>
            <div className="feature-description">Discuss clinical cases</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <CheckCircle size={16} />
            </div>
            <div className="feature-title">Knowledge</div>
            <div className="feature-description">Share expertise</div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <Shield size={16} />
            </div>
            <div className="feature-title">Secure</div>
            <div className="feature-description">HIPAA compliant</div>
          </div>
        </FeaturesGrid>

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