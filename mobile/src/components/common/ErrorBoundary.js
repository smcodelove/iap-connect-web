/**
 * Error Boundary component for IAP Connect mobile app
 * Catches and handles JavaScript errors in component tree
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView
} from 'react-native';
import Button from './Button';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    // Example: crashlytics().recordError(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚠️</Text>
            </View>
            
            <Text style={styles.title}>Oops! Something went wrong</Text>
            
            <Text style={styles.message}>
              We're sorry, but something unexpected happened. Please try again.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details (Dev Mode):</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <Button
                title="Try Again"
                onPress={this.handleRetry}
                variant="primary"
                style={styles.button}
              />
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  
  iconContainer: {
    marginBottom: 24
  },
  
  icon: {
    fontSize: 64
  },
  
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16
  },
  
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24
  },
  
  errorDetails: {
    backgroundColor: colors.gray100,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%'
  },
  
  errorTitle: {
    ...typography.bodyMedium,
    color: colors.danger,
    marginBottom: 8
  },
  
  errorText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'monospace'
  },
  
  buttonContainer: {
    width: '100%'
  },
  
  button: {
    minWidth: 200
  }
});

export default ErrorBoundary;