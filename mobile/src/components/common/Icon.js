/**
 * Icon component wrapper for consistent icon usage
 * Uses Expo Vector Icons or fallback to text
 */

import React from 'react';
import { Text } from 'react-native';

// Simple icon mapping for common icons
const iconMap = {
  'heart': '♥',
  'message-circle': '💬',
  'share': '📤',
  'more-horizontal': '⋯',
  'plus': '+',
  'search': '🔍',
  'user': '👤',
  'home': '🏠',
  'bell': '🔔',
  'settings': '⚙️',
  'camera': '📷',
  'edit': '✏️',
  'check': '✓',
  'x': '×',
  'arrow-left': '←',
  'arrow-right': '→',
  'star': '⭐',
  'bookmark': '📑',
  'mail': '✉️',
  'phone': '📞',
  'map-pin': '📍',
  'calendar': '📅',
  'clock': '🕐',
  'download': '⬇️',
  'upload': '⬆️',
  'refresh': '🔄',
  'trash': '🗑️',
  'eye': '👁️',
  'eye-off': '👁️‍🗨️',
  'lock': '🔒',
  'unlock': '🔓',
  'image': '🖼️',
  'file': '📄',
  'folder': '📁',
  'send': '📩',
  'link': '🔗',
  'external-link': '🔗',
  'info': 'ℹ️',
  'alert-circle': '⚠️',
  'check-circle': '✅',
  'x-circle': '❌',
};

const Icon = ({ name, size = 20, color = '#000', style, ...props }) => {
  const iconChar = iconMap[name] || '•';
  
  return (
    <Text 
      style={[
        {
          fontSize: size,
          color: color,
          textAlign: 'center',
          minWidth: size,
          minHeight: size,
          lineHeight: size + 2,
        },
        style
      ]}
      {...props}
    >
      {iconChar}
    </Text>
  );
};

export default Icon;