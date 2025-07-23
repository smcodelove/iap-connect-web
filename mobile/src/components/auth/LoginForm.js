/**
 * Login form component for IAP Connect mobile app
 * Handles user authentication with email and password
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../common/Button';
import Input from '../common/Input';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { validateEmail, validatePassword } from '../../utils/validation';

const LoginForm = ({ onSubmit, loading = false, onForgotPassword, onSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        ...formData,
        rememberMe
      });
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      Alert.alert(
        'Forgot Password',
        'Please contact support to reset your password.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to IAP Connect</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Email Address"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          leftIcon={
            <Ionicons name="mail-outline" size={20} color={colors.gray500} />
          }
        />

        <Input
          label="Password"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          placeholder="Enter your password"
          secureTextEntry
          error={errors.password}
          leftIcon={
            <Ionicons name="lock-closed-outline" size={20} color={colors.gray500} />
          }
        />

        <View style={styles.options}>
          <TouchableOpacity
            style={styles.rememberMe}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <Ionicons
              name={rememberMe ? 'checkbox' : 'checkbox-outline'}
              size={20}
              color={rememberMe ? colors.primary : colors.gray500}
            />
            <Text style={styles.rememberMeText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Sign In"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={onSignup}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24
  },

  header: {
    alignItems: 'center',
    marginBottom: 32
  },

  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 8
  },

  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center'
  },

  form: {
    flex: 1
  },

  options: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },

  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  rememberMeText: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: 8
  },

  forgotPassword: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500'
  },

  submitButton: {
    marginTop: 8
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24
  },

  footerText: {
    ...typography.body,
    color: colors.textSecondary
  },

  signupLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600'
  }
});

export default LoginForm;