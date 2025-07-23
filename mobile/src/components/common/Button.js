/**
 * Reusable Button component for IAP Connect mobile app
 * Supports different variants, sizes, and states
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
  ...props
}) => {
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle
  ];

  const handlePress = () => {
    if (!loading && !disabled && onPress) {
      onPress();
    }
  };

  const renderContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.white : colors.primary}
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </View>
  );

  // Gradient button for primary variant
  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        style={[styles.button, styles[size], style]}
        onPress={handlePress}
        disabled={loading || disabled}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={[styles.gradient, styles[size]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Regular button for other variants
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={handlePress}
      disabled={loading || disabled}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary
  },
  
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary
  },
  
  ghost: {
    backgroundColor: 'transparent'
  },
  
  danger: {
    backgroundColor: colors.danger
  },
  
  success: {
    backgroundColor: colors.success
  },
  
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36
  },
  
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48
  },
  
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56
  },
  
  // States
  disabled: {
    backgroundColor: colors.gray300,
    borderColor: colors.gray300
  },
  
  // Gradient
  gradient: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  
  // Content
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  iconContainer: {
    marginRight: 8
  },
  
  // Text Styles
  text: {
    ...typography.button,
    textAlign: 'center'
  },
  
  // Text Variants
  primaryText: {
    color: colors.white
  },
  
  secondaryText: {
    color: colors.primary
  },
  
  outlineText: {
    color: colors.primary
  },
  
  ghostText: {
    color: colors.primary
  },
  
  dangerText: {
    color: colors.white
  },
  
  successText: {
    color: colors.white
  },
  
  disabledText: {
    color: colors.gray500
  },
  
  // Text Sizes
  smallText: {
    ...typography.buttonSmall
  },
  
  mediumText: {
    ...typography.button
  },
  
  largeText: {
    ...typography.button,
    fontSize: 18
  }
});

export default Button;