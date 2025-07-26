// web/src/pages/home/HomePage.js
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Users, 
  FileText, 
  MessageCircle, 
  TrendingUp, 
  Plus, 
  Search,
  Stethoscope,
  GraduationCap,
  Heart
} from 'lucide-react';

const HomeContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  text-align: center;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 15px;
    font-weight: bold;
  }
  
  p {
    font-size: 1.2rem;
    opacity: 0.9;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ActionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ActionIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 15px;
`;

const ActionTitle = styled.h3`
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 8px;
  font-size: 1.2rem;
`;

const ActionDescription = styled.p`
  color: ${props => props.theme.colors.gray600};
  line-height: 1.5;
  font-size: 0.95rem;
`;

const StatsSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const StatsTitle = styled.h2`
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 25px;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 20px;
  background: ${props => props.theme.colors.gray50};
  border-radius: 10px;
  
  .number {
    font-size: 2rem;
    font-weight: bold;
    color: ${props => props.color || props.theme.colors.primary};
    margin-bottom: 8px;
  }
  
  .label {
    font-size: 0.9rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const FeaturesSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FeaturesTitle = styled.h2`
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 25px;
  text-align: center;
`;

const FeaturesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.gray50};
  }
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color || props.theme.colors.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || props.theme.colors.primary};
  flex-shrink: 0;
`;

const FeatureContent = styled.div`
  .title {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 5px;
  }
  
  .description {
    color: ${props => props.theme.colors.gray600};
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const quickActions = [
    {
      icon: Plus,
      title: 'Create Post',
      description: 'Share your medical knowledge, ask questions, or start discussions',
      color: '#0066CC',
      action: () => navigate('/create-post')
    },
    {
      icon: Search,
      title: 'Explore',
      description: 'Discover medical professionals, interesting posts, and trending topics',
      color: '#28A745',
      action: () => navigate('/search')
    },
    {
      icon: Users,
      title: 'Connect',
      description: 'Network with fellow doctors and medical students',
      color: '#FF6B35',
      action: () => navigate('/search?filter=users')
    },
    {
      icon: TrendingUp,
      title: 'Trending',
      description: 'Check out the most popular medical discussions right now',
      color: '#6F42C1',
      action: () => navigate('/feed?tab=trending')
    }
  ];

  const features = [
    {
      icon: Stethoscope,
      title: 'Professional Networking',
      description: 'Connect with doctors, specialists, and medical professionals worldwide',
      color: '#0066CC'
    },
    {
      icon: GraduationCap,
      title: 'Medical Education',
      description: 'Share knowledge, case studies, and learn from experienced practitioners',
      color: '#28A745'
    },
    {
      icon: MessageCircle,
      title: 'Medical Discussions',
      description: 'Engage in meaningful conversations about medical topics and cases',
      color: '#FF6B35'
    },
    {
      icon: FileText,
      title: 'Knowledge Sharing',
      description: 'Publish articles, research findings, and medical insights',
      color: '#6F42C1'
    },
    {
      icon: Heart,
      title: 'Community Support',
      description: 'Get support from peers and mentors in your medical journey',
      color: '#DC3545'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Discover opportunities and advance your medical career',
      color: '#FFC107'
    }
  ];

  return (
    <HomeContainer>
      <WelcomeSection>
        <h1>
          Welcome to IAP Connect, {user?.full_name?.split(' ')[0] || user?.username}!
        </h1>
        <p>
          Your professional medical community where doctors and students connect, 
          learn, and share knowledge to advance healthcare together.
        </p>
      </WelcomeSection>

      <QuickActions>
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <ActionCard key={index} onClick={action.action}>
              <ActionIcon color={action.color}>
                <Icon size={24} />
              </ActionIcon>
              <ActionTitle>{action.title}</ActionTitle>
              <ActionDescription>{action.description}</ActionDescription>
            </ActionCard>
          );
        })}
      </QuickActions>

      <StatsSection>
        <StatsTitle>Community Impact</StatsTitle>
        <StatsGrid>
          <StatCard color="#0066CC">
            <div className="number">1,500+</div>
            <div className="label">Medical Professionals</div>
          </StatCard>
          <StatCard color="#28A745">
            <div className="number">850+</div>
            <div className="label">Medical Students</div>
          </StatCard>
          <StatCard color="#FF6B35">
            <div className="number">3,200+</div>
            <div className="label">Knowledge Posts</div>
          </StatCard>
          <StatCard color="#6F42C1">
            <div className="number">12,000+</div>
            <div className="label">Medical Discussions</div>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      <FeaturesSection>
        <FeaturesTitle>Why Choose IAP Connect?</FeaturesTitle>
        <FeaturesList>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <FeatureItem key={index}>
                <FeatureIcon color={feature.color}>
                  <Icon size={20} />
                </FeatureIcon>
                <FeatureContent>
                  <div className="title">{feature.title}</div>
                  <div className="description">{feature.description}</div>
                </FeatureContent>
              </FeatureItem>
            );
          })}
        </FeaturesList>
      </FeaturesSection>
    </HomeContainer>
  );
};

export default HomePage;