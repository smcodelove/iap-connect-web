// web/src/pages/static/PresidentMessagePage.js
import React from 'react';
import styled from 'styled-components';
import { User } from 'lucide-react';

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
  background: #0ea5e920;
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
  color: #0ea5e9;
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
  text-align: center;
  margin-bottom: 30px;
  color: #1f2937;
`;

const ContentParagraph = styled.p`
  margin-bottom: 20px;
  text-align: justify;
`;

const Highlight = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
  color: #0ea5e9;
  text-align: center;
  margin: 30px 0;
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
  color: #0ea5e9;
  margin: 0 0 5px 0;
`;

const SignatureOrg = styled.p`
  color: #6b7280;
  margin: 0;
`;

const PresidentMessagePage = () => {
  return (
    <Container>
      <PageHeader>
        <IconContainer>
          <User size={40} color="#0ea5e9" />
        </IconContainer>
        <PageTitle>President's Message</PageTitle>
        <PageSubtitle>DR VASANT KHALATKAR, PRESIDENT 2025</PageSubtitle>
      </PageHeader>

      <ContentCard>
        <Greeting>Dear fellow academicians,</Greeting>
        
        <ContentParagraph>I wish you all a very happy and prosperous new year 2025.</ContentParagraph>
        
        <ContentParagraph>
          Indian Academy of Pediatrics has carved a deep niche in the health and wellbeing of children of our country and have been serving the community with compassion, courage, humility, and integrity for years. Today, our organization has more than 47,000 member pediatricians leading the way nationwide as we proactively seek out opportunities to integrate and coordinate our efforts locally, nationally, and internationally to create an Impact in communities. The entire purpose of IAP is not only to restrict our service as providers in knowledge, attitude, and skills to members in Pediatrics but also has a purpose to inculcate comprehensive coverage and care with humanitarian values and ethics.
        </ContentParagraph>
        
        <ContentParagraph>
          I am proud to say that liberal patronage, dynamic leadership, and energetic dedication of all our members have nurtured IAP over the years to become a favored destination of the pediatricians. Over the years, IAP has targeted prevention and care, and the impact of IAP's role is tremendous in communities which significantly Improved the national health outcomes. I am sure that the IAP activities are a reflection of each of your hard work and team spirit which is going to not only inspire every IAPian to grow but also will foster to expand our service and commitment towards the community. You all truly embraced the meaning of teamwork.
        </ContentParagraph>
        
        <ContentParagraph>
          As we have become a larger and greater society, all our engagements are evolving and expanding day to day by setting bold and ambitious goals to meet the needs of the nation. Our members are so involved and they want to be a part of something bigger than themselves. We can proudly say any member of this organization has a place where he or she can add value and when we provide effective leadership, it becomes the catalyst to make things happen, to effect change, to accomplish our mission, and to fulfil the vision of our mother body.
        </ContentParagraph>
        
        <ContentParagraph>
          Looking ahead, I welcome all the new OB, EB members on board of 2025, hoping the year will bring us new achievements and more possibilities. Let us together lead the way to a better future and a world of change, keeping in mind that every child is important.
        </ContentParagraph>
        
        <Highlight>The future is bright for IAP.</Highlight>
        
        <SignatureSection>
          <SignatureName>Dr Vasant Khalatkar</SignatureName>
          <SignatureTitle>President 2025</SignatureTitle>
          <SignatureOrg>Indian Academy of Paediatrics</SignatureOrg>
        </SignatureSection>
      </ContentCard>
    </Container>
  );
};

export default PresidentMessagePage;