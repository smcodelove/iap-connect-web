// screens/search/SearchScreen.js - Search Screen with Hashtag Support
/**
 * SearchScreen - Search for users, posts, and hashtags
 * Features: Real-time search, filters, hashtag search, trending hashtags
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
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';

import PostCard from '../../components/posts/PostCard';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { searchPosts } from '../../store/slices/postSlice';
import api from '../../services/api';

// Color constants
const colors = {
  primary: '#0066CC',
  primaryLight: '#3385DB',
  accent: '#FF6B35',
  success: '#28A745',
  danger: '#DC3545',
  white: '#FFFFFF',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
};

const SearchScreen = ({ route, navigation }) => {
  const { query: initialQuery = '', type: initialType = 'all' } = route.params || {};
  const dispatch = useDispatch();
  
  const { 
    searchResults: postResults, 
    searching: searchingPosts 
  } = useSelector(state => state.posts);

  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState(initialType); // all, posts, users, hashtags
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    '#cardiology', '#surgery', '#pediatrics', '#neurology'
  ]);
  const [trendingHashtags] = useState([
    { tag: '#MedicalEducation', posts: 245, growth: '+12%' },
    { tag: '#Surgery', posts: 189, growth: '+8%' },
    { tag: '#Cardiology', posts: 167, growth: '+15%' },
    { tag: '#Neurology', posts: 143, growth: '+6%' },
    { tag: '#Pediatrics', posts: 134, growth: '+10%' },
    { tag: '#Innovation', posts: 129, growth: '+5%' },
  ]);

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  // Handle search
  const handleSearch = useCallback(async (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      if (activeFilter === 'all' || activeFilter === 'posts' || activeFilter === 'hashtag') {
        // Search posts
        await dispatch(searchPosts({ query: searchQuery })).unwrap();
        setSearchResults(postResults);
      }
      
      // Add to recent searches
      setRecentSearches(prev => {
        const newSearches = [searchQuery.trim(), ...prev.filter(s => s !== searchQuery.trim())];
        return newSearches.slice(0, 10);
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to search');
    } finally {
      setLoading(false);
    }
  }, [query, activeFilter, dispatch, postResults]);

  // Handle hashtag press
  const handleHashtagPress = useCallback((hashtag) => {
    setQuery(hashtag);
    setActiveFilter('hashtag');
    handleSearch(hashtag);
  }, [handleSearch]);

  // Handle clear search
  const handleClearSearch = () => {
    setQuery('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  // Render filter tabs
  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {[
        { key: 'all', title: 'All', icon: 'search' },
        { key: 'posts', title: 'Posts', icon: 'file-text' },
        { key: 'hashtag', title: 'Hashtags', icon: 'hash' },
        { key: 'users', title: 'Users', icon: 'users' },
      ].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterTab,
            activeFilter === filter.key && styles.filterTabActive,
          ]}
          onPress={() => setActiveFilter(filter.key)}
        >
          <Icon
            name={filter.icon}
            size={16}
            color={activeFilter === filter.key ? colors.white : colors.gray600}
          />
          <Text
            style={[
              styles.filterTabText,
              activeFilter === filter.key && styles.filterTabTextActive,
            ]}
          >
            {filter.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render trending hashtags
  const renderTrendingHashtags = () => (
    <View style={styles.trendingSection}>
      <Text style={styles.sectionTitle}>Trending in Medical Community</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {trendingHashtags.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.trendingHashtagCard}
            onPress={() => handleHashtagPress(item.tag)}
          >
            <View style={styles.trendingHashtagHeader}>
              <Icon name="trending-up" size={16} color={colors.accent} />
              <Text style={styles.trendingHashtagGrowth}>{item.growth}</Text>
            </View>
            <Text style={styles.trendingHashtagTag}>{item.tag}</Text>
            <Text style={styles.trendingHashtagPosts}>{item.posts} posts</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render recent searches
  const renderRecentSearches = () => (
    <View style={styles.recentSection}>
      <Text style={styles.sectionTitle}>Recent Searches</Text>
      <View style={styles.recentSearches}>
        {recentSearches.map((search, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recentSearchChip}
            onPress={() => {
              setQuery(search);
              handleSearch(search);
            }}
          >
            <Icon name="clock" size={14} color={colors.gray500} />
            <Text style={styles.recentSearchText}>{search}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render search results
  const renderSearchResults = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (searchResults.length === 0 && query.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="search" size={48} color={colors.gray400} />
          <Text style={styles.emptyTitle}>No Results Found</Text>
          <Text style={styles.emptySubtitle}>
            Try searching with different keywords or hashtags
          </Text>
        </View>
      );
    }

    if (activeFilter === 'posts' || activeFilter === 'all' || activeFilter === 'hashtag') {
      return (
        <FlatList
          data={postResults}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onHashtagPress={handleHashtagPress}
              onUserPress={(userId) => navigation.navigate('Profile', { userId })}
              onPostPress={(postId) => navigation.navigate('PostDetail', { postId })}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.resultsList}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.gray700} />
        </TouchableOpacity>
        
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={colors.gray500} style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search posts, hashtags, users..."
            placeholderTextColor={colors.gray500}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            autoFocus={!initialQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Icon name="x" size={20} color={colors.gray500} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!query.trim() ? (
          <>
            {renderTrendingHashtags()}
            {renderRecentSearches()}
          </>
        ) : (
          renderSearchResults()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.gray800,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: colors.gray600,
    marginLeft: 6,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  trendingSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  trendingHashtagCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    marginLeft: 16,
    width: 140,
    shadowColor: colors.gray900,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  trendingHashtagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  trendingHashtagGrowth: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  trendingHashtagTag: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  trendingHashtagPosts: {
    fontSize: 12,
    color: colors.gray500,
  },
  recentSection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  recentSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  recentSearchText: {
    fontSize: 14,
    color: colors.gray700,
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray600,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray700,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 22,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export default SearchScreen;