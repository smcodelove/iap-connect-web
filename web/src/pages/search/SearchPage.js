// web/src/pages/search/SearchPage.js - FIXED: Real API Integration
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { Search, Users, FileText, Hash } from 'lucide-react';

// Import real services - ADD THESE IMPORTS
import userService from '../../services/userService';
import postService from '../../services/postService';

const SearchContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const SearchHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const SearchForm = styled.form`
  display: flex;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 25px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #1da1f2;
  }
`;

const SearchButton = styled.button`
  background: #1da1f2;
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1991db;
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 2px solid ${props => props.active ? '#1da1f2' : '#e1e8ed'};
  background: ${props => props.active ? '#1da1f2' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #1da1f2;
    color: ${props => props.active ? 'white' : '#1da1f2'};
  }
`;

const SearchResults = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    color: #333;
  }
  
  .count {
    color: #666;
    font-size: 14px;
  }
`;

const UserResult = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  
  .name {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }
  
  .meta {
    color: #666;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .bio {
    color: #888;
    font-size: 13px;
    line-height: 1.4;
  }
`;

const PostResult = styled.div`
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
  
  .title {
    font-weight: 600;
    color: #333;
    margin-bottom: 8px;
  }
  
  .content {
    color: #666;
    line-height: 1.5;
    margin-bottom: 8px;
  }
  
  .meta {
    display: flex;
    gap: 15px;
    color: #888;
    font-size: 13px;
    
    span {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
`;

const TagResult = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
  
  .tag {
    font-weight: 600;
    color: #1da1f2;
    font-size: 16px;
  }
  
  .description {
    color: #666;
    margin: 4px 0;
  }
  
  .stats {
    color: #888;
    font-size: 13px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  h3 {
    margin: 0 0 8px 0;
    color: #333;
  }
  
  p {
    margin: 0;
    line-height: 1.5;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid #e1e8ed;
    border-top: 3px solid #1da1f2;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Add Error Message styling
const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #fcc;
`;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  // Add error state for better UX
  const [error, setError] = useState(null);
  const [results, setResults] = useState({
    users: [],
    posts: [],
    tags: []
  });

  const filters = [
    { id: 'all', label: 'All', icon: Search },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'posts', label: 'Posts', icon: FileText },
    { id: 'tags', label: 'Tags', icon: Hash }
  ];

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setSearchParams({ q: query });
    performSearch(query);
  };

  // REPLACE THIS MOCK DATA PART WITH REAL API CALLS
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔍 Searching for: "${searchQuery}"`);
      
      // Parallel API calls for better performance
      const searchPromises = [];
      
      // Search users - using your existing userService
      searchPromises.push(
        userService.searchUsers(searchQuery, { page: 1, perPage: 10 })
          .then(response => ({ type: 'users', response }))
          .catch(error => ({ type: 'users', error }))
      );
      
      // Search posts - using your existing postService
      searchPromises.push(
        postService.searchPosts(searchQuery, { page: 1, perPage: 10 })
          .then(response => ({ type: 'posts', response }))
          .catch(error => ({ type: 'posts', error }))
      );
      
      // Execute all searches
      const searchResults = await Promise.all(searchPromises);
      
      const newResults = {
        users: [],
        posts: [],
        tags: []
      };
      
      // Process results
      searchResults.forEach(result => {
        if (result.error) {
          console.error(`❌ ${result.type} search failed:`, result.error);
          return;
        }
        
        if (result.type === 'users' && result.response?.success) {
          newResults.users = result.response.users.map(user => ({
            id: user.id,
            name: user.full_name || user.username,
            username: user.username,
            specialty: user.specialty,
            college: user.college,
            bio: user.bio,
            type: user.user_type,
            profile_picture_url: user.profile_picture_url
          }));
          console.log(`✅ Found ${newResults.users.length} users`);
        }
        
        if (result.type === 'posts' && result.response?.success) {
          newResults.posts = result.response.posts.map(post => ({
            id: post.id,
            title: post.content.substring(0, 60) + (post.content.length > 60 ? '...' : ''),
            content: post.content,
            author: post.author?.full_name || 'Unknown Author',
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            shares: post.shares_count || 0,
            created_at: post.created_at
          }));
          console.log(`✅ Found ${newResults.posts.length} posts`);
        }
      });
      
      // Extract hashtags from posts content for tags
      if (newResults.posts.length > 0) {
        const hashtagMap = new Map();
        
        newResults.posts.forEach((post, index) => {
          const hashtagMatches = post.content.match(/#[\w]+/g);
          if (hashtagMatches) {
            hashtagMatches.forEach(tag => {
              const cleanTag = tag.toLowerCase();
              if (hashtagMap.has(cleanTag)) {
                hashtagMap.set(cleanTag, hashtagMap.get(cleanTag) + 1);
              } else {
                hashtagMap.set(cleanTag, 1);
              }
            });
          }
        });
        
        newResults.tags = Array.from(hashtagMap.entries()).map(([tag, count], index) => ({
          id: index + 1,
          name: tag.substring(1), // Remove # symbol
          description: `Found in ${count} post${count > 1 ? 's' : ''}`,
          posts: count
        }));
        
        console.log(`✅ Extracted ${newResults.tags.length} hashtags`);
      }
      
      setResults(newResults);
      
      const totalResults = newResults.users.length + newResults.posts.length + newResults.tags.length;
      console.log(`🎯 Search completed: ${totalResults} total results`);
      
    } catch (error) {
      console.error('❌ Search failed:', error);
      setError('Search failed. Please try again.');
      setResults({ users: [], posts: [], tags: [] });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const filteredResults = {
    users: activeFilter === 'all' || activeFilter === 'users' ? results.users : [],
    posts: activeFilter === 'all' || activeFilter === 'posts' ? results.posts : [],
    tags: activeFilter === 'all' || activeFilter === 'tags' ? results.tags : []
  };

  const totalResults = filteredResults.users.length + filteredResults.posts.length + filteredResults.tags.length;

  return (
    <SearchContainer>
      <SearchHeader>
        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="Search for users, posts, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <SearchButton type="submit">
            <Search size={20} />
          </SearchButton>
        </SearchForm>

        <FilterTabs>
          {filters.map(filter => {
            const Icon = filter.icon;
            return (
              <FilterTab
                key={filter.id}
                active={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
              >
                <Icon size={16} />
                {filter.label}
              </FilterTab>
            );
          })}
        </FilterTabs>
      </SearchHeader>

      <SearchResults>
        {query && (
          <ResultsHeader>
            <h2>Search Results for "{query}"</h2>
            <div className="count">
              {loading ? 'Searching...' : `${totalResults} results`}
            </div>
          </ResultsHeader>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {loading ? (
          <LoadingSpinner />
        ) : !query ? (
          <EmptyState>
            <div className="icon">🔍</div>
            <h3>Search the Medical Community</h3>
            <p>
              Find doctors, students, medical discussions, and topics.<br/>
              Start by typing in the search box above.
            </p>
          </EmptyState>
        ) : totalResults === 0 ? (
          <EmptyState>
            <div className="icon">😔</div>
            <h3>No results found</h3>
            <p>
              Try different keywords or check your spelling.<br/>
              You can search for users, posts, or medical topics.
            </p>
          </EmptyState>
        ) : (
          <>
            {/* Users Results */}
            {filteredResults.users.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px', color: '#333' }}>
                  Users ({filteredResults.users.length})
                </h3>
                {filteredResults.users.map(user => (
                  <UserResult key={user.id} onClick={() => window.location.href = `/user/${user.id}`}>
                    <UserAvatar>
                      {user.profile_picture_url ? (
                        <img 
                          src={user.profile_picture_url} 
                          alt={user.name}
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        getInitials(user.name)
                      )}
                    </UserAvatar>
                    <UserInfo>
                      <div className="name">{user.name}</div>
                      <div className="meta">
                        @{user.username} • {user.specialty || user.college || user.type}
                      </div>
                      {user.bio && <div className="bio">{user.bio}</div>}
                    </UserInfo>
                  </UserResult>
                ))}
              </div>
            )}

            {/* Posts Results */}
            {filteredResults.posts.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px', color: '#333' }}>
                  Posts ({filteredResults.posts.length})
                </h3>
                {filteredResults.posts.map(post => (
                  <PostResult key={post.id} onClick={() => window.location.href = `/post/${post.id}`}>
                    <div className="title">{post.title}</div>
                    <div className="content">
                      {post.content.length > 200 
                        ? `${post.content.substring(0, 200)}...` 
                        : post.content
                      }
                    </div>
                    <div className="meta">
                      <span>By {post.author}</span>
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                      <span>🔄 {post.shares}</span>
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </PostResult>
                ))}
              </div>
            )}

            {/* Tags Results */}
            {filteredResults.tags.length > 0 && (
              <div>
                <h3 style={{ marginBottom: '15px', color: '#333' }}>
                  Tags ({filteredResults.tags.length})
                </h3>
                {filteredResults.tags.map(tag => (
                  <TagResult key={tag.id} onClick={() => window.location.href = `/search?q=${encodeURIComponent('#' + tag.name)}`}>
                    <div>
                      <div className="tag">#{tag.name}</div>
                      <div className="description">{tag.description}</div>
                    </div>
                    <div className="stats">{tag.posts} posts</div>
                  </TagResult>
                ))}
              </div>
            )}
          </>
        )}
      </SearchResults>
    </SearchContainer>
  );
};

export default SearchPage;