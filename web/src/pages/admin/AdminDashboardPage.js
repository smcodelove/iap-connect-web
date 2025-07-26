// web/src/pages/admin/AdminDashboardPage.js
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { 
  Users, 
  FileText, 
  MessageCircle, 
  TrendingUp, 
  Shield, 
  Activity,
  Calendar,
  BarChart3
} from 'lucide-react';
import api from '../../services/api';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const DashboardHeader = styled.div`
  margin-bottom: 30px;
  
  h1 {
    color: ${props => props.theme.colors.textPrimary};
    font-size: 2rem;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  p {
    color: ${props => props.theme.colors.gray600};
    font-size: 1.1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.gray600};
  font-size: 0.9rem;
`;

const StatChange = styled.div`
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.danger};
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 8px;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
  
  h3 {
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.theme.colors.gray50};
`;

const ActivityIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
  
  .title {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 2px;
  }
  
  .time {
    font-size: 0.85rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid ${props => props.theme.colors.gray200};
    border-top: 3px solid ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AdminDashboardPage = () => {
  const { user } = useSelector(state => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner />
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <div className="error">
          Error loading dashboard: {error}
        </div>
      </DashboardContainer>
    );
  }

  const stats = dashboardData?.stats || {};
  const activities = dashboardData?.recent_activities || [];

  return (
    <DashboardContainer>
      <DashboardHeader>
        <h1>
          <Shield size={28} />
          Admin Dashboard
        </h1>
        <p>Welcome back, {user?.full_name}! Here's what's happening in your medical community.</p>
      </DashboardHeader>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon color="#0066CC">
              <Users size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.total_users || 0}</StatValue>
          <StatLabel>Total Users</StatLabel>
          <StatChange positive>
            +{stats.new_users_today || 0} today
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#28A745">
              <FileText size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.total_posts || 0}</StatValue>
          <StatLabel>Total Posts</StatLabel>
          <StatChange positive>
            +{stats.new_posts_today || 0} today
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#FF6B35">
              <MessageCircle size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.total_comments || 0}</StatValue>
          <StatLabel>Total Comments</StatLabel>
          <StatChange positive>
            +{stats.new_comments_today || 0} today
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#6F42C1">
              <Activity size={24} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.active_users || 0}</StatValue>
          <StatLabel>Active Users</StatLabel>
          <StatChange positive>
            {((stats.active_users / stats.total_users) * 100 || 0).toFixed(1)}% of total
          </StatChange>
        </StatCard>
      </StatsGrid>

      <ChartsSection>
        <ChartCard>
          <h3>
            <BarChart3 size={20} />
            Platform Overview
          </h3>
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            <p>📊 Advanced analytics charts would be implemented here</p>
            <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
              Integration with Chart.js or Recharts for detailed analytics
            </p>
          </div>
        </ChartCard>

        <ChartCard>
          <h3>
            <Activity size={20} />
            Recent Activity
          </h3>
          <ActivityList>
            {activities.length > 0 ? activities.map((activity, index) => (
              <ActivityItem key={index}>
                <ActivityIcon color={
                  activity.type === 'user' ? '#0066CC' :
                  activity.type === 'post' ? '#28A745' :
                  activity.type === 'comment' ? '#FF6B35' : '#6F42C1'
                }>
                  {activity.type === 'user' && <Users size={16} />}
                  {activity.type === 'post' && <FileText size={16} />}
                  {activity.type === 'comment' && <MessageCircle size={16} />}
                </ActivityIcon>
                <ActivityContent>
                  <div className="title">{activity.title}</div>
                  <div className="time">{activity.time}</div>
                </ActivityContent>
              </ActivityItem>
            )) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <Calendar size={32} style={{ marginBottom: '10px' }} />
                <p>No recent activities</p>
              </div>
            )}
          </ActivityList>
        </ChartCard>
      </ChartsSection>

      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '24px', 
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' 
      }}>
        <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={20} />
          Quick Actions
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px' 
        }}>
          <button className="btn btn-primary">
            Manage Users
          </button>
          <button className="btn btn-secondary">
            Review Posts
          </button>
          <button className="btn btn-secondary">
            View Reports
          </button>
          <button className="btn btn-secondary">
            System Settings
          </button>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default AdminDashboardPage;