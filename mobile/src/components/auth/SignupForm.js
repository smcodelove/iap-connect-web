/**
 * Signup form component for IAP Connect mobile app
 * Handles user registration for doctors and students
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../common/Button';
import Input from '../common/Input';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { USER_TYPES } from '../../utils/constants';
import { validateEmail, validatePassword, validateUsername } from '../../utils/validation';

const SignupForm = ({ onSubmit, loading = false, onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userType: USER_TYPES.DOCTOR,
    bio: '',
    specialty: '',
    college: ''
  });
  const [errors, setErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleUserTypeChange = (userType) => {
    setFormData(prev => ({
      ...prev,
      userType,
      specialty: userType === USER_TYPES.DOCTOR ? prev.specialty : '',
      college: userType === USER_TYPES.STUDENT ? prev.college : ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-50 characters long';
    }
    
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
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    // User type specific validation
    if (formData.userType === USER_TYPES.DOCTOR && !formData.specialty) {
      newErrors.specialty = 'Medical specialty is required for doctors';
    }
    
    if (formData.userType === USER_TYPES.STUDENT && !formData.college) {
      newErrors.college = 'College/University name is required for students';
    }
    
    // Terms acceptance
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const { confirmPassword, ...submitData } = formData;
      onSubmit(submitData);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the IAP Connect community</Text>
      </View>

      <View style={styles.form}>
        {/* Basic Information */}
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <Input
          label="Username"
          value={formData.username}
          onChangeText={(value) => handleInputChange('username', value)}
          placeholder="Choose a username"
          autoCapitalize="none"
          error={errors.username}
          leftIcon={
            <Ionicons name="person-outline" size={20} color={colors.gray500} />
          }
        />

        <Input
          label="Full Name"
          value={formData.fullName}
          onChangeText={(value) => handleInputChange('fullName', value)}
          placeholder="Enter your full name"
          error={errors.fullName}
          leftIcon={
            <Ionicons name="person-circle-outline" size={20} color={colors.gray500} />
          }
        />

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
          placeholder="Create a password"
          secureTextEntry
          error={errors.password}
          leftIcon={
            <Ionicons name="lock-closed-outline" size={20} color={colors.gray500} />
          }
        />

        <Input
          label="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
          placeholder="Confirm your password"
          secureTextEntry
          error={errors.confirmPassword}
          leftIcon={
            <Ionicons name="lock-closed-outline" size={20} color={colors.gray500} />
          }
        />

        {/* User Type Selection */}
        <Text style={styles.sectionTitle}>I am a</Text>
        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              formData.userType === USER_TYPES.DOCTOR && styles.userTypeButtonActive
            ]}
            onPress={() => handleUserTypeChange(USER_TYPES.DOCTOR)}
          >
            <Ionicons
              name="medical-outline"
              size={24}
              color={formData.userType === USER_TYPES.DOCTOR ? colors.white : colors.primary}
            />
            <Text style={[
              styles.userTypeText,
              formData.userType === USER_TYPES.DOCTOR && styles.userTypeTextActive
            ]}>
              Doctor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.userTypeButton,
              formData.userType === USER_TYPES.STUDENT && styles.userTypeButtonActive
            ]}
            onPress={() => handleUserTypeChange(USER_TYPES.STUDENT)}
          >
            <Ionicons
              name="school-outline"
              size={24}
              color={formData.userType === USER_TYPES.STUDENT ? colors.white : colors.primary}
            />
            <Text style={[
              styles.userTypeText,
              formData.userType === USER_TYPES.STUDENT && styles.userTypeTextActive
            ]}>
              Student
            </Text>
          </TouchableOpacity>
        </View>

        {/* Professional Information */}
        <Text style={styles.sectionTitle}>Professional Information</Text>
        
        {formData.userType === USER_TYPES.DOCTOR && (
          <Input
            label="Medical Specialty"
            value={formData.specialty}
            onChangeText={(value) => handleInputChange('specialty', value)}
            placeholder="e.g., Cardiology, Pediatrics"
            error={errors.specialty}
            leftIcon={
              <Ionicons name="medical-outline" size={20} color={colors.gray500} />
            }
          />
        )}

        {formData.userType === USER_TYPES.STUDENT && (
          <Input
            label="College/University"
            value={formData.college}
            onChangeText={(value) => handleInputChange('college', value)}
            placeholder="Enter your institution name"
            error={errors.college}
            leftIcon={
              <Ionicons name="school-outline" size={20} color={colors.gray500} />
            }
          />
        )}

        <Input
          label="Bio (Optional)"
          value={formData.bio}
          onChangeText={(value) => handleInputChange('bio', value)}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={3}
          maxLength={500}
          leftIcon={
            <Ionicons name="document-text-outline" size={20} color={colors.gray500} />
          }
        />

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.termsCheckbox}
            onPress={() => setAcceptTerms(!acceptTerms)}
          >
            <Ionicons
              name={acceptTerms ? 'checkbox' : 'checkbox-outline'}
              size={20}
              color={acceptTerms ? colors.primary : colors.gray500}
            />
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms && (
            <Text style={styles.errorText}>{errors.terms}</Text>
          )}
        </View>

        <Button
          title="Create Account"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={onLogin}>
          <Text style={styles.loginLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    marginBottom: 24
  },

  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: 16,
    marginTop: 8
  },

  userTypeContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12
  },

  userTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    backgroundColor: colors.white
  },

  userTypeButtonActive: {
    backgroundColor: colors.primary
  },

  userTypeText: {
    ...typography.button,
    color: colors.primary,
    marginTop: 8
  },

  userTypeTextActive: {
    color: colors.white
  },

  termsContainer: {
    marginBottom: 24
  },

  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },

  termsText: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20
  },

  termsLink: {
    color: colors.primary,
    fontWeight: '500'
  },

  errorText: {
    ...typography.error,
    marginTop: 4
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

  loginLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600'
  }
});

export default SignupForm;