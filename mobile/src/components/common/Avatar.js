/**
 * Avatar component for IAP Connect mobile app
 * Displays user profile pictures with fallback to initials
 */

import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';

const Avatar = ({
  source,
  name = '',
  size = 'medium',
  onPress,
  style,
  showBorder = false,
  borderColor = colors.primary,
  backgroundColor = colors.primary,
  textColor = colors.white,
  ...props
}) => {
  const sizeValue = getSizeValue(size);
  
  const avatarStyles = [
    styles.avatar,
    {
      width: sizeValue,
      height: sizeValue,
      borderRadius: sizeValue / 2,
      backgroundColor
    },
    showBorder && {
      borderWidth: 2,
      borderColor
    },
    style
  ];

  const textStyles = [
    styles.text,
    {
      fontSize: getTextSize(size),
      color: textColor
    }
  ];

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName[0].toUpperCase();
  };

  const renderContent = () => {
    if (source?.uri || source) {
      return (
        <Image
          source={source}
          style={[styles.image, { width: sizeValue, height: sizeValue, borderRadius: sizeValue / 2 }]}
          {...props}
        />
      );
    }
    
    return (
      <Text style={textStyles}>
        {getInitials(name)}
      </Text>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={avatarStyles}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={avatarStyles}>
      {renderContent()}
    </View>
  );
};

const getSizeValue = (size) => {
  switch (size) {
    case 'small':
      return 32;
    case 'medium':
      return 48;
    case 'large':
      return 64;
    case 'xlarge':
      return 80;
    case 'xxlarge':
      return 120;
    default:
      return typeof size === 'number' ? size : 48;
  }
};

const getTextSize = (size) => {
  switch (size) {
    case 'small':
      return 12;
    case 'medium':
      return 16;
    case 'large':
      return 20;
    case 'xlarge':
      return 24;
    case 'xxlarge':
      return 32;
    default:
      return 16;
  }
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  
  image: {
    resizeMode: 'cover'
  },
  
  text: {
    ...typography.button,
    fontWeight: '600'
  }
});

export default Avatar;