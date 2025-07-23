/**
 * Loading component for IAP Connect mobile app
 * Displays loading spinner with optional text and overlay
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Modal
} from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const Loading = ({
  visible = true,
  text = 'Loading...',
  size = 'large',
  color = colors.primary,
  overlay = false,
  style,
  textStyle,
  ...props
}) => {
  const containerStyles = [
    styles.container,
    overlay && styles.overlay,
    style
  ];

  const textStyles = [
    styles.text,
    textStyle
  ];

  const loadingContent = (
    <View style={containerStyles}>
      <ActivityIndicator
        size={size}
        color={color}
        {...props}
      />
      {text && (
        <Text style={textStyles}>{text}</Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
      >
        {loadingContent}
      </Modal>
    );
  }

  return visible ? loadingContent : null;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  text: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center'
  }
});

export default Loading;