/**
 * Signup screen for IAP Connect mobile app
 * User registration for doctors and students
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import SignupForm from '../../components/auth/SignupForm';
import Loading from '../../components/common/LoadingSpinner';
import { colors } from '../../styles/colors';
import { register } from '../../store/slices/authSlice';

const SignupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  const [showLoading, setShowLoading] = useState(false);

  const handleSignup = async (signupData) => {
    try {
      setShowLoading(true);
      const result = await dispatch(register(signupData)).unwrap();
      
      if (result.success) {
        Alert.alert(
          'Account Created!',
          'Your account has been created successfully. You can now sign in.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Please check your information and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setShowLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            {/* App Logo/Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../../assets/adaptive-icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Signup Form */}
            <View style={styles.formContainer}>
              <SignupForm
                onSubmit={handleSignup}
                loading={loading || showLoading}
                onLogin={handleLogin}
              />
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Loading Overlay */}
        <Loading
          visible={showLoading}
          text="Creating your account..."
          overlay
        />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary
  },

  gradient: {
    flex: 1
  },

  keyboardView: {
    flex: 1
  },

  content: {
    flex: 1
  },

  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 40
  },

  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },

  logo: {
    width: 50,
    height: 50
  },

  formContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10
  }
});

export default SignupScreen;