/**
 * Typography styles for IAP Connect mobile app
 * Consistent text styling across the application
 */

import { Platform } from 'react-native';
import { colors } from './colors';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System'
});

export const typography = {
  // Heading Styles
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily,
    color: colors.textPrimary,
    lineHeight: 40
  },
  
  h2: {
    fontSize: 24,
    fontWeight: 'bold', 
    fontFamily,
    color: colors.textPrimary,
    lineHeight: 32
  },
  
  h3: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily,
    color: colors.textPrimary,
    lineHeight: 28
  },
  
  h4: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily,
    color: colors.textPrimary,
    lineHeight: 24
  },
  
  // Body Text Styles
  body: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily,
    color: colors.textPrimary,
    lineHeight: 24
  },
  
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily,
    color: colors.textPrimary,
    lineHeight: 24
  },
  
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily,
    color: colors.textSecondary,
    lineHeight: 20
  },
  
  // Caption and Small Text
  caption: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily,
    color: colors.textLight,
    lineHeight: 16
  },
  
  small: {
    fontSize: 10,
    fontWeight: '400',
    fontFamily,
    color: colors.textLight,
    lineHeight: 14
  },
  
  // Button Text
  button: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily,
    textAlign: 'center'
  },
  
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily,
    textAlign: 'center'
  },
  
  // Link Text
  link: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily,
    color: colors.primary,
    textDecorationLine: 'underline'
  },
  
  // Form Text
  label: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily,
    color: colors.textPrimary,
    marginBottom: 8
  },
  
  input: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily,
    color: colors.textPrimary
  },
  
  placeholder: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily,
    color: colors.textLight
  },
  
  // Error Text
  error: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily,
    color: colors.danger,
    lineHeight: 16
  },
  
  // Success Text
  success: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily,
    color: colors.success,
    lineHeight: 16
  }
};