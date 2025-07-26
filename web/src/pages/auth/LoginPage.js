// web/src/pages/auth/LoginPage.js - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { loginUser, clearError } from '../../store/slices/authSlice';
import LoginForm from '../../components/auth/LoginForm';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  /* Animated background elements */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 2px, transparent 2px);
    background-size: 50px 50px;
    animation: float 20s linear infinite;
    opacity: 0.3;
  }
  
  @keyframes float {
    0% { transform: translate(0, 0) rotate(0deg); }
    100% { transform: translate(-50px, -50px) rotate(360deg); }
  }
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  
  @media (max-width: 640px) {
    padding: 32px 24px;
    margin: 16px;
    max-width: none;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 40px;
  
  .logo-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
    color: white;
    font-size: 24px;
    box-shadow: 0 8px 24px rgba(0, 102, 204, 0.3);
  }
  
  h1 {
    color: ${props => props.theme.colors.primary};
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 8px;
    background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryDark} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    color: ${props => props.theme.colors.gray600};
    font-size: 1.1rem;
    font-weight: 500;
  }
  
  .subtitle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
    color: ${props => props.theme.colors.gray500};
    font-size: 0.9rem;
  }
`;

const WelcomeMessage = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}10 0%, ${props => props.theme.colors.accent}10 100%);
  border: 1px solid ${props => props.theme.colors.primary}20;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 32px;
  text-align: center;
  
  .welcome-icon {
    color: ${props => props.theme.colors.success};
    margin-bottom: 8px;
  }
  
  .welcome-text {
    color: ${props => props.theme.colors.gray700};
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.success}10 0%, ${props => props.theme.colors.success}05 100%);
  border: 1px solid ${props => props.theme.colors.success}30;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.theme.colors.success};
  font-weight: 500;
  
  .success-icon {
    flex-shrink: 0;
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.danger}10 0%, ${props => props.theme.colors.danger}05 100%);
  border: 1px solid ${props => props.theme.colors.danger}30;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${props => props.theme.colors.danger};
  font-weight: 500;
  
  .error-icon {
    flex-shrink: 0;
  }
`;

const LoginFooter = styled.div`
  text-align: center;
  margin-top: 32px;
  
  .login-prompt {
    color: ${props => props.theme.colors.gray600};
    margin-bottom: 12px;
    font-size: 0.95rem;
  }
  
  .register-link {
    color: ${props => props.theme.colors.primary};
    font-weight: 600;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 8px;
    transition: all 0.2s ease;
    display: inline-block;
    
    &:hover {
      background: ${props => props.theme.colors.primary}10;
      text-decoration: none;
      transform: translateY(-1px);
    }
  }
  
  .forgot-password {
    margin-top: 16px;
    
    a {
      color: ${props => props.theme.colors.gray500};
      text-decoration: none;
      font-size: 0.9rem;
      
      &:hover {
        color: ${props => props.theme.colors.primary};
        text-decoration: underline;
      }
    }
  }
`;

const FeatureHighlight = styled.div`
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, ${props => props.theme.colors.gray50} 0%, ${props => props.theme.colors.white} 100%);
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.gray200};
  
  .feature-title {
    font-weight: 600;
    color: ${props => props.theme.colors.gray800};
    margin-bottom: 12px;
    font-size: 0.95rem;
  }
  
  .feature-list {
    display: grid;
    gap: 8px;
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: ${props => props.theme.colors.gray600};
      font-size: 0.85rem;
      
      .feature-icon {
        color: ${props => props.theme.colors.success};
        flex-shrink: 0;
      }
    }
  }
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 24px;
  
  .stat-card {
    text-align: center;
    padding: 16px;
    background: linear-gradient(135deg, ${props => props.theme.colors.primary}05 0%, ${props => props.theme.colors.accent}05 100%);
    border-radius: 12px;
    border: 1px solid ${props => props.theme.colors.gray200};
    
    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: ${props => props.theme.colors.primary};
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 0.8rem;
      color: ${props => props.theme.colors.gray600};
      font-weight: 500;
    }
  }
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  
  const [successMessage, setSuccessMessage] = useState('');

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/feed');
    }
  }, [isAuthenticated, navigate]);

  // Clear error on component mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleLoginSuccess = (result) => {
    console.log('Login successful:', result);
    navigate('/feed', { replace: true });
  };

  const clearSuccessMessage = () => {
    setSuccessMessage('');
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <div className="logo-icon">
            <Heart size={28} />
          </div>
          <h1>IAP Connect</h1>
          <p>Connecting Medical Professionals</p>
          <div className="subtitle">
            <Users size={16} />
            <span>Join the medical community</span>
          </div>
        </Logo>

        {/* Success Message */}
        {successMessage && (
          <SuccessMessage>
            <CheckCircle size={20} className="success-icon" />
            <div>
              {successMessage}
              <button 
                onClick={clearSuccessMessage}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'inherit', 
                  marginLeft: '8px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                ×
              </button>
            </div>
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
            <Heart size={20} />
          </div>
          <div className="welcome-text">
            Welcome back! Sign in to connect with medical professionals, 
            share knowledge, and advance healthcare together.
          </div>
        </WelcomeMessage>

        {/* Login Form */}
        <LoginForm onSuccess={handleLoginSuccess} />

        {/* Feature Highlights */}
        <FeatureHighlight>
          <div className="feature-title">Why Join IAP Connect?</div>
          <div className="feature-list">
            <div className="feature-item">
              <CheckCircle size={14} className="feature-icon" />
              <span>Connect with medical professionals</span>
            </div>
            <div className="feature-item">
              <CheckCircle size={14} className="feature-icon" />
              <span>Share clinical experiences & knowledge</span>
            </div>
            <div className="feature-item">
              <CheckCircle size={14} className="feature-icon" />
              <span>Access exclusive medical discussions</span>
            </div>
            <div className="feature-item">
              <CheckCircle size={14} className="feature-icon" />
              <span>Build your professional network</span>
            </div>
          </div>
        </FeatureHighlight>

        {/* Quick Stats */}
        <QuickStats>
          <div className="stat-card">
            <div className="stat-number">1K+</div>
            <div className="stat-label">Medical Professionals</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">500+</div>
            <div className="stat-label">Daily Discussions</div>
          </div>
        </QuickStats>

        {/* Footer */}
        <LoginFooter>
          <div className="login-prompt">Don't have an account?</div>
          <Link to="/register" className="register-link">
            Create Account
          </Link>
          
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>
        </LoginFooter>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;