// web/src/pages/auth/RegisterPage.js - IMMEDIATE CLEAN FIX
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Users, CheckCircle, Shield, Stethoscope, AlertCircle } from 'lucide-react';
import SignupForm from '../../components/auth/SignupForm';
import { clearError } from '../../store/slices/authSlice';

const RegisterContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const RegisterCard = styled.div`
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

const ProcessSteps = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme.colors.gray50};
  border-radius: 0.75rem;
  
  @media (max-width: 640px) {
    gap: 1rem;
    padding: 1rem;
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
    position: relative;
    flex: 1;
    
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 1rem;
      right: -1rem;
      width: 2rem;
      height: 2px;
      background: ${props => props.theme.colors.blue300};
      
      @media (max-width: 640px) {
        display: none;
      }
    }
  }
  
  .step-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: ${props => props.theme.colors.blue500};
    color: white;
    border-radius: 50%;
    font-weight: 600;
    font-size: 0.875rem;
  }
  
  .step-text {
    font-size: 0.8rem;
    color: ${props => props.theme.colors.gray600};
    font-weight: 500;
  }
`;

const BenefitsSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: ${props => props.theme.colors.green50};
  border: 1px solid ${props => props.theme.colors.green200};
  border-radius: 0.75rem;
  
  .benefits-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: ${props => props.theme.colors.green800};
    margin-bottom: 1rem;
    font-size: 1rem;
  }
  
  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 0.75rem;
  }
  
  .benefit-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: ${props => props.theme.colors.green700};
  }
  
  .benefit-icon {
    color: ${props => props.theme.colors.green600};
    flex-shrink: 0;
  }
`;

const RegisterFooter = styled.div`
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme.colors.gray200};
  
  .login-prompt {
    color: ${props => props.theme.colors.gray600};
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
  
  .login-link {
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

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: ${props => props.theme.colors.green50};
  border: 1px solid ${props => props.theme.colors.green200};
  color: ${props => props.theme.colors.green700};
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
  text-align: center;
  flex-direction: column;
  
  .success-button {
    margin-top: 1rem;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    cursor: pointer;
    
    &:hover {
      background: ${props => props.theme.colors.green700};
    }
  }
`;

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error, registrationSuccess } = useSelector(state => state.auth);
  const [showSuccess, setShowSuccess] = useState(false);

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Handle successful registration
  const handleRegistrationSuccess = () => {
    setShowSuccess(true);
  };

  // If registration was successful, show success message
  if (registrationSuccess || showSuccess) {
    return (
      <RegisterContainer>
        <RegisterCard>
          <SuccessMessage>
            <CheckCircle size={48} />
            <div>
              <strong>Welcome to IAP Connect!</strong>
              <br />
              Your account has been created successfully. 
              You can now log in and start connecting with the medical community.
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
          <p>Medical Professional Community</p>
          <div className="subtitle">
            <Stethoscope size={16} />
            <span>For IAP Healthcare Professionals</span>
          </div>
        </Logo>

        {/* Error Message */}
        {error && (
          <ErrorMessage>
            <AlertCircle size={20} className="error-icon" />
            <div>{error}</div>
          </ErrorMessage>
        )}

        {/* Process Steps - FIXED */}
        <ProcessSteps>
          <div className="step">
            <div className="step-icon">1</div>
            <div className="step-text">Enter Details</div>
          </div>
          <div className="step">
            <div className="step-icon">2</div>
            <div className="step-text">Verify Email</div>
          </div>
          <div className="step">
            <div className="step-icon">3</div>
            <div className="step-text">Join Community</div>
          </div>
        </ProcessSteps>

        {/* Registration Form */}
        <SignupForm onSuccess={handleRegistrationSuccess} />

        {/* Benefits Section - SIMPLIFIED */}
        <BenefitsSection>
          <div className="benefits-title">
            <CheckCircle size={18} />
            Professional Benefits
          </div>
          <div className="benefits-grid">
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Network with medical professionals</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Share clinical experiences</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Access latest medical knowledge</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Collaborate on research</span>
            </div>
          </div>
        </BenefitsSection>

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