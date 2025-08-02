// web/src/pages/auth/RegisterPage.js - DOCTORS ONLY VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, Users, CheckCircle, Shield, Stethoscope, GraduationCap, AlertCircle } from 'lucide-react';
import SignupForm from '../../components/auth/SignupForm';
import { clearError } from '../../store/slices/authSlice';

// Styled Components (keeping all existing styles)
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
  max-width: 600px;
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
  }
  
  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
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
    font-size: 0.75rem;
    color: ${props => props.theme.colors.gray600};
    font-weight: 500;
  }
`;

// COMMENTED OUT - User Type Info (keeping for future use)
/*
const UserTypeInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
  
  .user-type-card {
    padding: 1.5rem;
    border: 1px solid ${props => props.theme.colors.gray200};
    border-radius: 0.75rem;
    text-align: center;
    background: white;
    transition: all 0.2s;
    
    &:hover {
      border-color: ${props => props.theme.colors.blue300};
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
  }
  
  .type-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background: ${props => props.theme.colors.blue100};
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.blue600};
  }
  
  .type-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${props => props.theme.colors.gray900};
    margin-bottom: 0.5rem;
  }
  
  .type-description {
    font-size: 0.875rem;
    color: ${props => props.theme.colors.gray600};
    line-height: 1.5;
  }
`;
*/

// UPDATED - Medical Professional Focus
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
    width: 3rem;
    height: 3rem;
    background: ${props => props.theme.colors.blue500};
    border-radius: 0.75rem;
    margin-bottom: 1rem;
    color: white;
  }
  
  .professional-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme.colors.gray900};
    margin-bottom: 0.5rem;
  }
  
  .professional-description {
    font-size: 0.95rem;
    color: ${props => props.theme.colors.gray700};
    line-height: 1.6;
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
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

const SecurityInfo = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background: ${props => props.theme.colors.purple50};
  border: 1px solid ${props => props.theme.colors.purple200};
  border-radius: 0.5rem;
  
  .security-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: ${props => props.theme.colors.purple800};
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
  }
  
  .security-text {
    font-size: 0.8rem;
    color: ${props => props.theme.colors.purple700};
    line-height: 1.5;
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
    background: ${props => props.theme.colors.green600};
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
              <strong>Welcome to the Medical Community!</strong>
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
          <p>Join the Medical Professional Community</p>
          <div className="subtitle">
            <Stethoscope size={16} />
            <span>For Healthcare Professionals</span>
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

        {/* Process Steps - UPDATED for doctors only */}
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

        {/* COMMENTED OUT - User Type Information (for future use) */}
        {/*
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
        */}

        {/* NEW - Medical Professional Focus */}
        <ProfessionalInfo>
          <div className="professional-icon">
            <Stethoscope size={24} />
          </div>
          <div className="professional-title">For Medical Professionals</div>
          <div className="professional-description">
            Connect with peers, share clinical experiences, discuss complex cases, 
            and advance medical knowledge through collaborative learning.
          </div>
        </ProfessionalInfo>

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
              <span>Clinical case discussions</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Medical knowledge sharing</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Research collaboration</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Latest medical updates</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={14} className="benefit-icon" />
              <span>Career opportunities</span>
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