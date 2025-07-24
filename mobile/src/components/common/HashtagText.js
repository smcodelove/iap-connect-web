// components/common/HashtagText.js - Enhanced Hashtag Component
/**
 * HashtagText - Component for rendering text with clickable hashtags
 * Features: Clickable hashtags, proper highlighting, search integration
 */

import React, { memo } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const colors = {
  primary: '#0066CC',
  primaryLight: '#3385DB',
  gray800: '#343A40',
  gray600: '#6C757D',
};

const HashtagText = memo(({ 
  content, 
  style = {}, 
  onHashtagPress,
  numberOfLines,
  ellipsizeMode = 'tail'
}) => {
  const navigation = useNavigation();

  // Handle hashtag press
  const handleHashtagPress = (hashtag) => {
    console.log(`🏷️ Hashtag pressed: ${hashtag}`);
    
    if (onHashtagPress) {
      onHashtagPress(hashtag);
    } else {
      // Default behavior - navigate to search
      navigation.navigate('Search', { 
        query: hashtag,
        type: 'hashtag'
      });
    }
  };

  // Parse content and render with hashtags
  const renderContent = () => {
    if (!content) return null;

    // Enhanced regex to match hashtags (including Unicode characters)
    const hashtagRegex = /#[\w\u0900-\u097F]+/g;
    const parts = content.split(hashtagRegex);
    const hashtags = content.match(hashtagRegex) || [];

    const result = [];
    
    parts.forEach((part, index) => {
      // Add regular text
      if (part) {
        result.push(
          <Text key={`text-${index}`} style={[styles.regularText, style]}>
            {part}
          </Text>
        );
      }
      
      // Add hashtag if exists
      if (hashtags[index]) {
        result.push(
          <TouchableOpacity
            key={`hashtag-${index}`}
            onPress={() => handleHashtagPress(hashtags[index])}
            activeOpacity={0.7}
          >
            <Text style={[styles.hashtag, style]}>
              {hashtags[index]}
            </Text>
          </TouchableOpacity>
        );
      }
    });

    return result;
  };

  return (
    <Text 
      style={[styles.container, style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
      {renderContent()}
    </Text>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  regularText: {
    fontSize: 16,
    color: colors.gray800,
    lineHeight: 22,
  },
  hashtag: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    lineHeight: 22,
  },
});

export default HashtagText;