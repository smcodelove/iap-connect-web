// components/common/Avatar.js
/**
 * Enhanced Avatar component with fallback initials and border options
 * Supports different sizes and styling options for profile pictures
 * 
 * @param {string} uri - Image URI for the avatar
 * @param {string} name - User's name for fallback initials
 * @param {number} size - Size of the avatar (default: 40)
 * @param {boolean} showBorder - Whether to show border (default: false)
 * @param {string} borderColor - Border color (default: primary)
 * @param {number} borderWidth - Border width (default: 2)
 * @param {function} onPress - Optional press handler
 * @param {object} style - Additional custom styles
 */

import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography } from '../../styles';

const Avatar = ({
  uri,
  name = '',
  size = 40,
  showBorder = false,
  borderColor = colors.primary,
  borderWidth = 2,
  onPress,
  style = {},
  showOnlineStatus = false,
  isOnline = false
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Generate initials from name
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Generate background color from name
  const getBackgroundColor = (fullName) => {
    if (!fullName) return colors.gray400;
    
    const colors_list = [
      colors.primary,
      colors.accent,
      colors.success,
      '#9C27B0', // Purple
      '#FF5722', // Deep Orange
      '#607D8B', // Blue Grey
      '#795548', // Brown
      '#E91E63', // Pink
      '#3F51B5', // Indigo
      '#009688', // Teal
    ];
    
    let hash = 0;
    for (let i = 0; i < fullName.length; i++) {
      hash = fullName.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    
    return colors_list[Math.abs(hash) % colors_list.length];
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    ...style,
  };

  const borderStyle = showBorder ? {
    borderWidth: borderWidth,
    borderColor: borderColor,
  } : {};

  const renderAvatarContent = () => {
    // Show image if URI exists and no error
    if (uri && !imageError) {
      return (
        <Image
          source={{ uri }}
          style={[avatarStyle, borderStyle]}
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
      );
    }

    // Show initials with gradient background
    const initials = getInitials(name);
    const backgroundColor = getBackgroundColor(name);
    
    return (
      <LinearGradient
        colors={[backgroundColor, `${backgroundColor}CC`]}
        style={[avatarStyle, borderStyle, styles.initialsContainer]}
      >
        <Text style={[
          styles.initialsText,
          { fontSize: size * 0.4 }
        ]}>
          {initials}
        </Text>
      </LinearGradient>
    );
  };

  const renderOnlineStatus = () => {
    if (!showOnlineStatus) return null;
    
    const statusSize = size * 0.25;
    const statusStyle = {
      width: statusSize,
      height: statusSize,
      borderRadius: statusSize / 2,
      backgroundColor: isOnline ? colors.success : colors.gray400,
      borderWidth: 2,
      borderColor: colors.white,
      position: 'absolute',
      bottom: 0,
      right: 0,
    };
    
    return <View style={statusStyle} />;
  };

  const AvatarWrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.8 } : {};

  return (
    <AvatarWrapper {...wrapperProps} style={styles.container}>
      {renderAvatarContent()}
      {renderOnlineStatus()}
    </AvatarWrapper>
  );
};

// Pre-defined avatar sizes for consistency
Avatar.sizes = {
  small: 32,
  medium: 40,
  large: 56,
  xlarge: 80,
  xxlarge: 120,
};

const styles = {
  container: {
    position: 'relative',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
};

export default Avatar;