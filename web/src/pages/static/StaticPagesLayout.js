// web/src/pages/static/StaticPagesLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
`;

const HeaderContainer = styled.div`
  background: #0ea5e9;
  color: white;
  padding: 20px;
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const HeaderContent = styled.div`
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 10px 0;
`;

const HeaderAddress = styled.p`
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.4;
`;

const StaticPagesLayout = () => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <HeaderContainer>
        <HeaderTop>
          <BackButton onClick={() => navigate('/feed')}>
            <ChevronLeft size={24} />
          </BackButton>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Indian Academy of Pediatrics</h2>
        </HeaderTop>
        
        <HeaderContent>
          <HeaderTitle>Indian Academy of Pediatrics (IAP)</HeaderTitle>
          <HeaderAddress>
            Kamdhenu Business Park, 5th Floor, Plot No. 51, Sector 1,<br/>
            Juinagar East, (Near Juinagar Railway Station), Nerul,<br/>
            Navi Mumbai - 400706 (India)
          </HeaderAddress>
        </HeaderContent>
      </HeaderContainer>
      <Outlet />
    </PageContainer>
  );
};

export default StaticPagesLayout;