// screens/search/SearchScreen.js
/**
 * SearchScreen - Search for users, posts, and hashtags
 * Features: Real-time search, filters, recent searches, suggestions
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import PostCard from '../../components/posts/PostCard';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { searchContent } from '../../store/slices/postSlice';
import { searchUsers } from '../../store/slices/userSlice';
import { colors, typography, spacing } from '../../styles';
import { debounce } from '../../utils/helpers';

const SearchScreen = ({ route, navigation }) => {
  const { query: initialQuery = '' } = route.params || {};
  const dispatch = useDispatch();
  
  const { 
    searchResults: postResults, 
    searching: searchingPosts 
  } = useSelector(state => state.posts);
  
  const { 
    searchResults: userResults, 
    searching: searchingUsers 
  } = useSelector(state => state.users);

  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('all'); // all, posts, users, hashtags
  const [recentSearches, setRecentSearches] = useState([
    '#cardiology', 'Dr. Sarah', 'case study', '#surgery'
  ]);
  const [suggestions] = useState([
    '#medical', '#healthcare', '#study', '#research', 
    '#cardiology', '#surgery', '#pediatrics', '#neurology'
  ]);

  const searchInputRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery) => {
      if (searchQuery.trim().length >= 2) {
        if (activeFilter === 'all' || activeFilter === 'posts') {
          dispatch(searchContent({ query: searchQuery, type: 'posts' }));
        }
        if (activeFilter === 'all' || activeFilter === 'users') {
          dispatch(searchUsers({ query: searchQuery }));
        }
      }
    }, 300),
    [dispatch, activeFilter]
  );

  // Handle search input change
  const handleSearchChange = useCallback((text) => {
    setQuery(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  // Handle search submission
  const handleSearchSubmit = useCallback(() => {
    if (query.trim()) {
      // Add to recent searches
      setRecentSearches(prev => {
        const newSearches = [query.trim(), ...prev.filter(s => s !== query.trim())];
        return newSearches.slice(0, 10); // Keep last 10 searches
      });
      
      // Perform search
      debouncedSearch(query);
    }
  }, [query, debouncedSearch]);

  // Handle filter change
  const handleFilterChange = useCallback((filter) => {
    setActiveFilter(filter);
    if (query.trim()) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch]);

  // Handle suggestion/recent search tap
  const handleSuggestionTap = useCallback((suggestion) => {
    setQuery(suggestion);
    handleSearchChange(suggestion);
  }, [handleSearchChange]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setActiveFilter('all');
  }, []);

  // Focus search input on mount
  useEffect(() => {
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  }, []);

  // Handle initial query from navigation
  useEffect(() => {
    if (initialQuery) {
      handleSearchChange(initialQuery);
    }
  }, [initialQuery, handleSearchChange]);

  // Handle post interactions
  const handleLike = useCallback((postId) => {
    navigation.navigate('PostDetail', { postId });
  }, [navigation]);

  const handleComment = useCallback((postId) => {
    navigation.navigate('PostDetail', { postId, openComments: true });
  }, [navigation]);

  const handleShare = useCallback((post) => {
    Alert.alert('Share', `Share ${post.user.full_name}'s post`);
  }, []);

  const handleUserPress = useCallback((userId) => {
    navigation.navigate('Profile', { userId });
  }, [navigation]);

  // Render filter tabs
  const renderFilterTabs = () => {
    const filters = [
      { key: 'all', title: 'All', icon: 'search' },
      { key: 'posts', title: 'Posts', icon: 'file-text' },
      { key: 'users', title: 'Users', icon: 'users' },
      { key: 'hashtags', title: 'Tags', icon: 'hash' },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              activeFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterChange(filter.key)}
          >
            <Icon
              name={filter.icon}
              size={16}
              color={activeFilter === filter.key ? colors.white : colors.gray600}
            />
            <Text style={[
              styles.filterText,
              activeFilter === filter.key && styles.filterTextActive,
            ]}>
              {filter.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Render search suggestions
  const renderSuggestions = () => {
    if (query.trim()) return null;

    return (
      <View style={styles.suggestionsContainer}>
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <TouchableOpacity onPress={() => setRecentSearches([])}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.suggestionsGrid}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionTap(search)}
                >
                  <Icon name="clock" size={14} color={colors.gray500} />
                  <Text style={styles.suggestionText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Popular Hashtags */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Popular Hashtags</Text>
          <View style={styles.suggestionsGrid}>
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestionChip, styles.hashtagChip]}
                onPress={() => handleSuggestionTap(suggestion)}
              >
                <Icon name="trending-up" size={14} color={colors.primary} />
                <Text style={[styles.suggestionText, styles.hashtagText]}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  // Render search results
  const renderSearchResults = () => {
    const hasQuery = query.trim().length >= 2;
    const isLoading = searchingPosts || searchingUsers;
    const hasResults = (postResults && postResults.length > 0) || 
                     (userResults && userResults.length > 0);

    if (!hasQuery) return renderSuggestions();

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (!hasResults) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="search" size={48} color={colors.gray400} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySubtitle}>
            Try different keywords or check spelling
          </Text>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Results */}
        {userResults && userResults.length > 0 && 
         (activeFilter === 'all' || activeFilter === 'users') && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsSectionTitle}>
              Users ({userResults.length})
            </Text>
            {userResults.slice(0, 5).map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.userResult}
                onPress={() => handleUserPress(user.id)}
              >
                <Avatar
                  uri={user.profile_picture_url}
                  name={user.full_name}
                  size={40}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userFullName}>{user.full_name}</Text>
                  <Text style={styles.userDetails}>
                    {user.user_type === 'doctor' 
                      ? `👨‍⚕️ ${user.specialty || 'Doctor'}` 
                      : `👨‍🎓 ${user.college || 'Student'}`
                    }
                  </Text>
                </View>
                <TouchableOpacity style={styles.followButton}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            
            {userResults.length > 5 && (
              <TouchableOpacity 
                style={styles.seeMoreButton}
                onPress={() => handleFilterChange('users')}
              >
                <Text style={styles.seeMoreText}>
                  See all {userResults.length} users
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Post Results */}
        {postResults && postResults.length > 0 && 
         (activeFilter === 'all' || activeFilter === 'posts') && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsSectionTitle}>
              Posts ({postResults.length})
            </Text>
            {postResults.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => handleLike(post.id)}
                onComment={() => handleComment(post.id)}
                onShare={() => handleShare(post)}
                onUserPress={() => handleUserPress(post.user.id)}
                style={styles.postResult}
              />
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Search Input */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={20} color={colors.gray600} />
          </TouchableOpacity>
          
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={18} color={colors.gray500} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search posts, users, hashtags..."
              placeholderTextColor={colors.gray500}
              value={query}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            
            {query.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Icon name="x" size={18} color={colors.gray500} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        {query.trim().length >= 2 && renderFilterTabs()}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderSearchResults()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  header: {
    backgroundColor: colors.white,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.gray900,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  filtersContainer: {
    paddingBottom: spacing.sm,
  },
  filtersContent: {
    paddingHorizontal: spacing.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    marginRight: spacing.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.gray600,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  suggestionsContainer: {
    padding: spacing.md,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray900,
  },
  clearText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  hashtagChip: {
    backgroundColor: colors.primary + '20',
  },
  suggestionText: {
    ...typography.caption,
    color: colors.gray700,
    marginLeft: spacing.xs,
  },
  hashtagText: {
    color: colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    ...typography.caption,
    color: colors.gray600,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.gray700,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultsSection: {
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
  },
  resultsSectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray900,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  userResult: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  userFullName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  userDetails: {
    ...typography.caption,
    color: colors.gray600,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  followButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  seeMoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  seeMoreText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '500',
  },
  postResult: {
    marginHorizontal: 0,
    marginBottom: spacing.sm,
    borderRadius: 0,
  },
});

export default SearchScreen;