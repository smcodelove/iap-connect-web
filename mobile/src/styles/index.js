import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Breakpoints for responsive design
export const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// Colors
export const colors = {
  // Primary colors
  primary: '#007AFF',
  secondary: '#5856D6',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    100: '#F7F7F7',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#E5E5EA',
  },
  
  // Text colors
  text: {
    primary: '#000000',
    secondary: '#3C3C43',
    tertiary: '#3C3C4399',
    quaternary: '#3C3C4360',
  },
};

// Typography
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Common styles
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

// Helper function for responsive values
export const getResponsiveValue = (value) => {
  if (width < breakpoints.sm) return value.xs || value.sm || value;
  if (width < breakpoints.md) return value.sm || value;
  if (width < breakpoints.lg) return value.md || value;
  return value.lg || value.xl || value;
};

// Export default object for easier importing
export default {
  colors,
  typography,
  spacing,
  breakpoints,
  commonStyles,
  getResponsiveValue,
};