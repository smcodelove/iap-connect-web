// web/src/pages/static/SecretaryMessagePage.js - COMPLETE VERSION
import React from 'react';
import styled from 'styled-components';
import { Users } from 'lucide-react';

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
  text-align: center;
  margin-bottom: 30px;
  color: #1f2937;
`;

const ContentParagraph = styled.p`
  margin-bottom: 20px;
  text-align: justify;
`;

const StatsList = styled.div`
  background: #f0f9ff;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border-left: 4px solid #10b981;
`;

const StatsItem = styled.div`
  margin-bottom: 8px;
  color: #1f2937;
  font-weight: 500;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const HighlightBox = styled.div`
  background: #ecfdf5;
  border-radius: 8px;
  padding: 20px;
  margin: 25px 0;
  border: 1px solid #10b981;
`;

const HighlightTitle = styled.h4`
  color: #10b981;
  font-weight: 600;
  margin: 0 0 10px 0;
`;

const Closing = styled.p`
  font-size: 1.1rem;
  font-weight: 500;
  margin: 30px 0;
  color: #1f2937;
  text-align: center;
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

const SecretaryMessagePage = () => {
  return (
    <Container>
      <PageHeader>
        <IconContainer>
          <Users size={40} color="#10b981" />
        </IconContainer>
        <PageTitle>Secretary General's Message</PageTitle>
        <PageSubtitle>Dr. Yogesh Parikh, Secretary General</PageSubtitle>
      </PageHeader>

      <ContentCard>
        <Greeting>Dear fellow academicians,</Greeting>
        
        <ContentParagraph>I wish you all a very happy and prosperous new year 2025.</ContentParagraph>
        
        <ContentParagraph>
          It was an honour to be entrusted with the huge responsibility in the past year to steer IAP to greater heights and glory. IAP is an organization that has created a huge impact in health and wellbeing of children. As we all know Indian Academy of Pediatrics, is committed to improvement of the health and wellbeing of all children. and our efforts are centered around the mission and vision of the mother body by focusing in research and service by honoring our skills as pediatricians.
        </ContentParagraph>

        <StatsList>
          <HighlightTitle>IAP Growth in 2024:</HighlightTitle>
          <StatsItem>• Membership increased from 44,450 to 47,373 members</StatsItem>
          <StatsItem>• 2,923 new members added to IAP database</StatsItem>
          <StatsItem>• 30 State Branches, 343 Local/City/District Branches</StatsItem>
          <StatsItem>• 25 Sub-specialty Chapters & 5 interest groups</StatsItem>
          <StatsItem>• 64 sub committees formed for action plans</StatsItem>
        </StatsList>
        
        <ContentParagraph>
          I am happy to inform you all that, as a part of our dedication in 2024 we have made memorandum of understanding (MOU) with American Mission Hospital (AMH) Bahrain, Children's services, Oxford University Hospitals NHS Trust and Bangladesh Paediatric Association (BPA).
        </ContentParagraph>

        <HighlightBox>
          <HighlightTitle>PEDICON-2024 Highlights:</HighlightTitle>
          <ContentParagraph style={{ margin: 0, fontSize: '0.95rem' }}>
            61st National Conference was held at Lulu Bolgatty International Convention Centre, Kochi, Kerry, on 24th to 28th January 2024. PEDICON-2024 was an academic feast with high quality workshops, lectures by eminent national and international speakers, stimulating debates, thought provoking symposia and oral presentations which expanded our knowledge horizons in child healthcare.
          </ContentParagraph>
        </HighlightBox>
        
        <ContentParagraph>
          Indian Academy of Pediatrics has implemented one of its flagship program NC ECD programs with the support of Johnson and Johnson successfully. Program is being conducted across the country with support and enthusiasm. 200 targeted workshops were conducted at city/district level, I am also happy to share that under our NRP programme 607 courses were conducted and total of 17,378 health care providers were trained in the year 2024.
        </ContentParagraph>
        
        <ContentParagraph>
          Along with the flagship activities 18 academic modules in various subspecialties floated in the past year and kept the branches on toes. 263 workshops under these 18 modules were conducted under presidential action plan 2024. Our President invigorated the national initiative of IAP KI BAAT COMMUNITY KE SATH by focusing the communities and conducting this programme under the Presidential Action Plan 2024 which was launched on the 13th of February 2024.
        </ContentParagraph>
        
        <ContentParagraph>
          We also launched and released "National Treatment Guidelines for Pediatric Emergencies and Toxicology", which is a comprehensive, structured and simple treatment guideline focusing post graduates, teaching faculty and practicing Pediatricians authored and peer reviewed by experts in the field. So far, we were able to release 33 Topic's Guidelines of National Treatment Guidelines to all IAPians.
        </ContentParagraph>
        
        <ContentParagraph>
          Indian Academy of Pediatrics (IAP) have engaged with UNICEF, Ministry of Health and Family Welfare (MoHFW) Government of India, Federation of Obstetric and Gynecological Societies of India (FOGSI), National Neonatology Forum (NNF) South Asia Pediatric Association (SAPA) and other associations in the past year. The regular flagship academic journals of Central IAP, Indian Pediatrics, The Indian Journal of Practical Pediatrics, and drug formulary were in full swing.
        </ContentParagraph>
        
        <ContentParagraph>
          Similarly, monthly e-newsletter of IAP 'Child India' is sent by mass e mail to all Members and every issue is archived on this website. "Family Benefit Scheme" of Central IAP for providing financial help to the families served their mission to care and share with transparency and sincerity and has been a promising scheme.
        </ContentParagraph>
        
        <ContentParagraph>
          Last year IAP was privileged to award two "Honorary Fellowship of Indian Academy of Pediatrics (HFIAP)" and thirty-six "Fellowship of Indian Academy of Pediatrics (FIAP)". These Awards have been bestowed based on the contributions they have given to the Academy as well as to the Child Welfare at large over the years.
        </ContentParagraph>
        
        <ContentParagraph>
          I would like to conclude here congratulating and thanking my OB & EB Team 2024 as well as each one of my member friends for their tireless efforts and performance, support, guidance and most importantly the constructive criticism extended to the IAP Secretariat. I am certain that with the continued proactive involvement of my colleagues across the all-IAP branches, the IAP activities are soon to have maximum visibility in every nook and corner of the country.
        </ContentParagraph>
        
        <ContentParagraph>
          As we move together and make ourselves proud as noble custodians of child welfare with all our value-added contribution by maintaining our mother body in order and just, let us all add to the legacy and embrace Innovation in future too by working together to ensure and improve the health of children in our country.
        </ContentParagraph>
        
        <Closing>
          Wishing perfect health and happiness for all the IAPians, their families and of course the children of this great country.
          <br/><br/>
          <strong>We will successfully fulfil our predecessors' shoes!</strong>
        </Closing>
        
        <SignatureSection>
          <p style={{ fontWeight: 500, marginBottom: '15px' }}>Yours in Academy,</p>
          <SignatureName>Dr. Yogesh Parikh</SignatureName>
          <SignatureTitle>Secretary General</SignatureTitle>
          <SignatureOrg>IAP 2024 & 2025</SignatureOrg>
        </SignatureSection>
      </ContentCard>
    </Container>
  );
};

export default SecretaryMessagePage;