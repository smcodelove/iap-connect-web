// web/src/pages/static/TreasurerMessagePage.js  
import React from 'react';
import styled from 'styled-components';
import { DollarSign } from 'lucide-react';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  background: #10b98120;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
`;

const PageTitle = styled.h1`
  color: #1f2937;
  font-size: 2rem;
  margin: 0 0 10px 0;
`;

const PageSubtitle = styled.h2`
  color: #10b981;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  line-height: 1.7;
  font-size: 1rem;
  color: #6b7280;
`;

const Greeting = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 30px;
  color: #1f2937;
`;

const ContentParagraph = styled.p`
  margin-bottom: 20px;
  text-align: justify;
`;

const Closing = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  margin: 30px 0;
  color: #1f2937;
`;

const SignatureSection = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e5e7eb;
`;

const SignatureName = styled.p`
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 5px 0;
`;

const SignatureTitle = styled.p`
  color: #10b981;
  margin: 0 0 5px 0;
`;

const SignatureOrg = styled.p`
  color: #6b7280;
  margin: 0;
`;

const TreasurerMessagePage = () => {
  return (
    <Container>
      <PageHeader>
        <IconContainer>
          <DollarSign size={40} color="#10b981" />
        </IconContainer>
        <PageTitle>National Treasurer's Message</PageTitle>
        <PageSubtitle>Dr Atanu Bhadra, National Treasurer</PageSubtitle>
      </PageHeader>

      <ContentCard>
        <Greeting>Dear Esteemed Members of the Indian Academy of Pediatrics,</Greeting>
        
        <ContentParagraph>
          It is with great honor and enthusiasm that I step into the role of Treasurer for our esteemed organization. I am deeply grateful for the trust and confidence you have placed in me.
        </ContentParagraph>
        
        <ContentParagraph>
          As Treasurer, I am committed to upholding the highest standards of financial integrity, transparency, and efficiency. My foremost goal is to ensure prudent management of our resources, fostering sustainable financial practices that align with our shared vision and objectives.
        </ContentParagraph>
        
        <ContentParagraph>
          I recognize the significance of our collective efforts in advancing pediatric care, education, and research across our nation. I pledge to work tirelessly in managing our finances judiciously, enabling us to further our mission and provide optimal support to our members.
        </ContentParagraph>
        
        <ContentParagraph>
          I am eager to collaborate closely with each of you, drawing upon your insights and expertise to steer us towards continued growth and success. Together, we will navigate challenges, seize opportunities, and drive the Indian Academy of Pediatrics to new heights.
        </ContentParagraph>
        
        <ContentParagraph>
          I invite your guidance, support, and active participation in this journey. Let us work hand in hand to ensure the fiscal well-being of our organization and strengthen our impact on pediatric healthcare in India.
        </ContentParagraph>
        
        <Closing>With utmost dedication and enthusiasm,</Closing>
        
        <SignatureSection>
          <SignatureName>Dr Atanu Bhadra</SignatureName>
          <SignatureTitle>National Treasurer</SignatureTitle>
          <SignatureOrg>Indian Academy of Pediatrics</SignatureOrg>
        </SignatureSection>
      </ContentCard>
    </Container>
  );
};

export default TreasurerMessagePage;