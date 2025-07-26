// web/src/pages/auth/RegisterPage.js - UPDATED VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Heart, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Stethoscope,
  GraduationCap,
  Shield,
  Clock
} from 'lucide-react';
import { registerUser, clearError, clearRegistrationSuccess } from '../../store/slices/authSlice';
import SignupForm from '../../components/auth/SignupForm';

const RegisterContainer = styled.div`
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

const RegisterCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
  max-height: 90vh;
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.gray100};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary};
    border-radius: 3px;
  }
  
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
  padding: 20px;
  margin-bottom: 32px;
  text-align: center;
  
  .welcome-icon {
    color: ${props => props.theme.colors.success};
    margin-bottom: 12px;
  }
  
  .welcome-title {
    font-weight: 600;
    color: ${props => props.theme.colors.gray800};
    margin-bottom: 8px;
    font-size: 1.1rem;
  }
  
  .welcome-text {
    color: ${props => props.theme.colors.gray600};
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.success}10 0%, ${props => props.theme.colors.success}05 100%);
  border: 1px solid ${props => props.theme.colors.success}30;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
  
  .success-icon {
    color: ${props => props.theme.colors.success};
    margin-bottom: 16px;
  }
  
  .success-title {
    font-weight: 700;
    color: ${props => props.theme.colors.success};
    margin-bottom: 8px;
    font-size: 1.2rem;
  }
  
  .success-text {
    color: ${props => props.theme.colors.gray600};
    line-height: 1.5;
    margin-bottom: 16px;
  }
  
  .success-button {
    background: ${props => props.theme.colors.success};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${props => props.theme.colors.successDark || '#1e7e34'};
      transform: translateY(-1px);
    }
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

const BenefitsSection = styled.div`
  margin-top: 24px;
  padding: 20px;
  background: linear-gradient(135deg, ${props => props.theme.colors.gray50} 0%, ${props => props.theme.colors.white} 100%);
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.gray200};
  
  .benefits-title {
    font-weight: 600;
    color: ${props => props.theme.colors.gray800};
    margin-bottom: 16px;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .benefits-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    
    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
    
    .benefit-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: ${props => props.theme.colors.gray600};
      font-size: 0.85rem;
      
      .benefit-icon {
        color: ${props => props.theme.colors.success};
        flex-shrink: 0;
      }
    }
  }
`;

const UserTypeInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 24px 0;
  
  .user-type-card {
    padding: 16px;
    background: linear-gradient(135deg, ${props => props.theme.colors.primary}05 0%, ${props => props.theme.colors.accent}05 100%);
    border-radius: 12px;
    border: 1px solid ${props => props.theme.colors.gray200};
    text-align: center;
    
    .type-icon {
      color: ${props => props.theme.colors.primary};
      margin-bottom: 8px;
    }
    
    .type-title {
      font-weight: 600;
      color: ${props => props.theme.colors.gray800};
      margin-bottom: 4px;
      font-size: 0.9rem;
    }
    
    .type-description {
      color: ${props => props.theme.colors.gray600};
      font-size: 0.8rem;
      line-height: 1.4;
    }
  }
`;

const SecurityInfo = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}05 0%, ${props => props.theme.colors.success}05 100%);
  border: 1px solid ${props => props.theme.colors.primary}20;
  border-radius: 12px;
  padding: 16px;
  margin-top: 24px;
  
  .security-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: ${props => props.theme.colors.gray800};
    margin-bottom: 8px;
    font-size: 0.9rem;
  }
  
  .security-text {
    color: ${props => props.theme.colors.gray600};
    font-size: 0.85rem;
    line-height: 1.5;
  }
`;

const RegisterFooter = styled.div`
  text-align: center;
  margin-top: 32px;
  
  .login-prompt {
    color: ${props => props.theme.colors.gray600};
    margin-bottom: 12px;
    font-size: 0.95rem;
  }
  
  .login-link {
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
`;

const ProcessSteps = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 24px 0;
  
  .step {
    flex: 1;
    text-align: center;
    position: relative;
    
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 12px;
      right: -50%;
      width: 100%;
      height: 2px;
      background: ${props => props.theme.colors.gray200};
      z-index: 0;
    }
    
    .step-icon {
      width: 24px;
      height: 24px;
      background: ${props => props.theme.colors.primary};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 8px;
      color: white;
      font-size: 12px;
      font-weight: 600;
      position: relative;
      z-index: 1;
    }
    
    .step-text {
      font-size: 0.75rem;
      color: ${props => props.theme.colors.gray600};
      font-weight: 500;
    }
  }
`;

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated, registrationSuccess } = useSelector(state => state.auth);

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

  const handleRegistrationSuccess = () => {
    // Show success message briefly, then redirect
    setTimeout(() => {
      dispatch(clearRegistrationSuccess());
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please log in with your credentials.' 
        }
      });
    }, 3000);
  };

  // Show success state
  if (registrationSuccess) {
    return (
      <RegisterContainer>
        <RegisterCard>
          <Logo>
            <div className="logo-icon">
              <Heart size={28} />
            </div>
            <h1>IAP Connect</h1>
            <p>Welcome to the Community!</p>
          </Logo>

          <SuccessMessage>
            <CheckCircle size={48} className="success-icon" />
            <div className="success-title">Registration Successful!</div>
            <div className="success-text">
              Your account has been created successfully. You can now log in and 
              start connecting with the medical community.
            </div>
            <button 
              className="success-button"
              onClick={() => navigate('/login')}
            >
              Continue to Login
            </button>
          </SuccessMessage>
        </RegisterCard>
      </RegisterContainer>
    );
  }

  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo>
          <div className="logo-icon">
            <Heart size={28} />
          </div>
          <h1>IAP Connect</h1>
          <p>Join the Medical Community</p>
          <div className="subtitle">
            <Users size={16} />
            <span>Connect, Learn, Grow</span>
          </div>
        </Logo>

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
            <Heart size={24} />
          </div>
          <div className="welcome-title">Create Your Professional Account</div>
          <div className="welcome-text">
            Join thousands of medical professionals in advancing healthcare 
            through knowledge sharing and collaboration.
          </div>
        </WelcomeMessage>

        {/* Process Steps */}
        <ProcessSteps>
          <div className="step">
            <div className="step-icon">1</div>
            <div className="step-text">Choose Role</div>
          </div>
          <div className="step">
            <div className="step-icon">2</div>
            <div className="step-text">Enter Details</div>
          </div>
          <div className="step">
            <div className="step-icon">3</div>
            <div className="step-text">Join Community</div>
          </div>
        </ProcessSteps>

        {/* User Type Information */}
        <UserTypeInfo>
          <div className="user-type-card">
            <div className="type-icon">
              <Stethoscope size={24} />
            </div>
            <div className="type-title">Medical Doctors</div>
            <div className="type-description">
              Connect with peers, share clinical experiences, and advance medical knowledge
            </div>
          </div>
          <div className="user-type-card">
            <div className="type-icon">
              <GraduationCap size={24} />
            </div>
            <div className="type-title">Medical Students</div>
            <div className="type-description">
              Learn from professionals, ask questions, and prepare for your career
            </div>
          </div>
        </UserTypeInfo>

        {/* Registration Form */}
        <SignupForm onSuccess={handleRegistrationSuccess} />

        {/* Benefits Section */}
        <BenefitsSection>
          <div className="benefits-title">
            <CheckCircle size={18} />
            What You'll Get
          </div>
          <div className="benefits-grid">
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Professional networking</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Knowledge sharing</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Case discussions</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Career opportunities</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Medical updates</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Community support</span>
            </div>
          </div>
        </BenefitsSection>

        {/* Security Information */}
        <SecurityInfo>
          <div className="security-title">
            <Shield size={16} />
            Your Privacy & Security
          </div>
          <div className="security-text">
            We protect your professional information with enterprise-grade security. 
            Your data is encrypted and never shared without your explicit consent.
          </div>
        </SecurityInfo>

        {/* Footer */}
        <RegisterFooter>
          <div className="login-prompt">Already have an account?</div>
          <Link to="/login" className="login-link">
            Sign In Here
          </Link>
        </RegisterFooter>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;