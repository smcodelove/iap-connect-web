/**
 * Reusable Card component for IAP Connect mobile app
 * Provides consistent card styling with shadow and rounded corners
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { colors } from '../../styles/colors';

const Card = ({
  children,
  style,
  onPress,
  shadow = true,
  padding = 16,
  margin = 0,
  backgroundColor = colors.cardBackground,
  borderRadius = 12,
  ...props
}) => {
  const cardStyles = [
    styles.card,
    {
      padding,
      margin,
      backgroundColor,
      borderRadius
    },
    shadow && styles.shadow,
    style
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.9}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden'
  },
  
  shadow: {
    // iOS Shadow
    shadowColor: colors.cardShadow,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    
    // Android Shadow
    elevation: 4
  }
});

export default Card;