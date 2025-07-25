// components/search/SearchResults.js - Reusable Search Results Component
/**
 * SearchResults - Component for displaying different types of search results
 * Features: Posts, Users, Hashtags with proper highlighting
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import PostCard from '../posts/PostCard';
import Avatar from '../common/Avatar';

// Color constants
const colors = {
  primary: '#0066CC',
  white: '#FFFFFF',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
};

const SearchResults = memo(({ 
  results, 
  type, 
  query,
  onUserPress,
  onPostPress,
  onHashtagPress,
  onLoadMore,
  hasMore = false,
  loading = false
}) => {

  // Highlight search query in text
  const highlightQuery = (text, searchQuery) => {
    if (!searchQuery || !text) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, index) => (
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <Text key={index} style={styles.highlightedText}>{part}</Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    ));
  };

  // Render user result item
  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => onUserPress(item.id)}
    >
      <Avatar 
        size={45}
        uri={item.profile_picture_url}
        name={item.full_name}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {highlightQuery(item.full_name, query)}
        </Text>
        <Text style={styles.userType}>
          {item.user_type === 'doctor' 
            ? `Dr. • ${item.specialty || 'Medical Professional'}` 
            : `Student • ${item.college || 'Medical Student'}`
          }
        </Text>
        {item.bio && (
          <Text style={styles.userBio} numberOfLines={1}>
            {highlightQuery(item.bio, query)}
          </Text>
        )}
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
        <Icon name="chevron-right" size={20} color={colors.gray400} />
      </View>
    </TouchableOpacity>
  );

  // Render post item with search highlighting
  const renderPostItem = ({ item }) => (
    <View style={styles.postItemContainer}>
      <PostCard
        post={{
          ...item,
          content: item.content // Keep original content for PostCard
        }}
        onHashtagPress={onHashtagPress}
        onUserPress={onUserPress}
        onPostPress={onPostPress}
        showSearchHighlight={true}
        searchQuery={query}
      />
    </View>
  );

  // Render hashtag result item
  const renderHashtagItem = ({ item }) => (
    <TouchableOpacity
      style={styles.hashtagItem}
      onPress={() => onHashtagPress(item.hashtag)}
    >
      <View style={styles.hashtagIcon}>
        <Icon name="hash" size={24} color={colors.primary} />
      </View>
      <View style={styles.hashtagInfo}>
        <Text style={styles.hashtagText}>
          {highlightQuery(item.hashtag, query)}
        </Text>
        <Text style={styles.hashtagStats}>
          {item.posts_count} posts • {item.total_engagement} engagements
        </Text>
      </View>
      <View style={styles.hashtagTrending}>
        <Icon name="trending-up" size={16} color={colors.primary} />
        <Text style={styles.hashtagGrowth}>{item.growth}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render load more button
  const renderLoadMore = () => {
    if (!hasMore) return null;
    
    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={onLoadMore}
        disabled={loading}
      >
        {loading ? (
          <Text style={styles.loadMoreText}>Loading...</Text>
        ) : (
          <>
            <Icon name="plus" size={16} color={colors.primary} />
            <Text style={styles.loadMoreText}>Load More</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  // Get render function based on type
  const getRenderItem = () => {
    switch (type) {
      case 'users':
        return renderUserItem;
      case 'posts':
        return renderPostItem;
      case 'hashtags':
        return renderHashtagItem;
      default:
        return renderPostItem;
    }
  };

  // Get item height for performance
  const getItemLayout = (data, index) => {
    const itemHeight = type === 'users' ? 80 : type === 'hashtags' ? 70 : 200;
    return {
      length: itemHeight,
      offset: itemHeight * index,
      index,
    };
  };

  if (!results || results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon 
          name={type === 'users' ? 'users' : type === 'hashtags' ? 'hash' : 'file-text'} 
          size={48} 
          color={colors.gray400} 
        />
        <Text style={styles.emptyTitle}>No {type} found</Text>
        <Text style={styles.emptySubtitle}>
          Try searching with different keywords
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        renderItem={getRenderItem()}
        keyExtractor={(item) => `${type}-${item.id}`}
        showsVerticalScrollIndicator={false}
        getItemLayout={type !== 'posts' ? getItemLayout : undefined}
        ListFooterComponent={renderLoadMore}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  
  // User item styles
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  userType: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 2,
  },
  userBio: {
    fontSize: 13,
    color: colors.gray600,
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  followButtonText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  
  // Post item styles
  postItemContainer: {
    backgroundColor: colors.white,
    marginBottom: 8,
  },
  
  // Hashtag item styles
  hashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  hashtagIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hashtagInfo: {
    flex: 1,
  },
  hashtagText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  hashtagStats: {
    fontSize: 14,
    color: colors.gray600,
  },
  hashtagTrending: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hashtagGrowth: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Common styles
  highlightedText: {
    backgroundColor: colors.primary,
    color: colors.white,
    fontWeight: '600',
    paddingHorizontal: 2,
    borderRadius: 2,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  loadMoreText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray700,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SearchResults;