// web/src/styles/GlobalStyles.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${props => props.theme.colors.gray100};
    color: ${props => props.theme.colors.textPrimary};
  }

  #root {
    min-height: 100vh;
  }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  input, textarea {
    font-family: inherit;
    outline: none;
    border: 1px solid ${props => props.theme.colors.gray300};
    border-radius: 8px;
    padding: 12px;
    font-size: 1rem;
    
    &:focus {
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid ${props => props.theme.colors.gray200};
  }

  .btn {
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    
    &.btn-primary {
      background: ${props => props.theme.colors.primary};
      color: white;
      
      &:hover {
        background: ${props => props.theme.colors.primaryDark};
        transform: translateY(-1px);
      }
    }
    
    &.btn-secondary {
      background: ${props => props.theme.colors.gray200};
      color: ${props => props.theme.colors.textPrimary};
      
      &:hover {
        background: ${props => props.theme.colors.gray300};
      }
    }
    
    &.btn-danger {
      background: ${props => props.theme.colors.danger};
      color: white;
      
      &:hover {
        background: #c82333;
      }
    }
    
    &.btn-outline {
      background: transparent;
      border: 2px solid ${props => props.theme.colors.primary};
      color: ${props => props.theme.colors.primary};
      
      &:hover {
        background: ${props => props.theme.colors.primary};
        color: white;
      }
    }
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: ${props => props.theme.colors.gray600};
  }

  .error {
    color: ${props => props.theme.colors.danger};
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 8px;
    padding: 12px;
    margin: 10px 0;
  }

  .success {
    color: ${props => props.theme.colors.success};
    background: #d4edda;
    border: 1px solid #c3e6cb;
    border-radius: 8px;
    padding: 12px;
    margin: 10px 0;
  }

  .text-center {
    text-align: center;
  }

  .text-muted {
    color: ${props => props.theme.colors.gray600};
  }

  .mb-4 {
    margin-bottom: 1.5rem;
  }

  .mt-4 {
    margin-top: 1.5rem;
  }

  .d-flex {
    display: flex;
  }

  .justify-content-between {
    justify-content: space-between;
  }

  .align-items-center {
    align-items: center;
  }

  /* Responsive */
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    .container {
      padding: 0 15px;
    }
    
    .card {
      padding: 15px;
    }
  }

  /* Scrollbar Styling */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.gray100};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.gray400};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.gray500};
  }
`;

export default GlobalStyles;