/**
 * Reusable Input component for IAP Connect mobile app
 * Supports various input types, validation, and styling
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  error,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  editable = true,
  maxLength,
  style,
  inputStyle,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (event) => {
    setIsFocused(true);
    if (onFocus) onFocus(event);
  };

  const handleBlur = (event) => {
    setIsFocused(false);
    if (onBlur) onBlur(event);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const containerStyles = [
    styles.container,
    containerStyle
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && styles.inputContainerError,
    !editable && styles.inputContainerDisabled
  ];

  const textInputStyles = [
    styles.input,
    typography.input,
    multiline && styles.multilineInput,
    leftIcon && styles.inputWithLeftIcon,
    (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
    !editable && styles.inputDisabled,
    inputStyle
  ];

  return (
    <View style={containerStyles}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
        </Text>
      )}
      
      <View style={inputContainerStyles}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={textInputStyles}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray500}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={togglePasswordVisibility}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={colors.gray500}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {maxLength && (
        <Text style={styles.charCount}>
          {value?.length || 0}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: 8
  },
  
  labelError: {
    color: colors.danger
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    minHeight: 48
  },
  
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2
  },
  
  inputContainerError: {
    borderColor: colors.danger,
    borderWidth: 2
  },
  
  inputContainerDisabled: {
    backgroundColor: colors.gray100,
    borderColor: colors.gray200
  },
  
  input: {
    flex: 1,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 16
  },
  
  inputWithLeftIcon: {
    paddingLeft: 8
  },
  
  inputWithRightIcon: {
    paddingRight: 8
  },
  
  multilineInput: {
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
    minHeight: 80
  },
  
  inputDisabled: {
    color: colors.gray500
  },
  
  leftIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  rightIconContainer: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4
  },
  
  errorText: {
    ...typography.error,
    marginTop: 4
  },
  
  charCount: {
    ...typography.caption,
    textAlign: 'right',
    marginTop: 4,
    color: colors.gray500
  }
});

export default Input;