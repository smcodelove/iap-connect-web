// web/src/pages/search/SearchPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { Search, Users, FileText, Hash } from 'lucide-react';

const SearchContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const SearchHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SearchForm = styled.form`
  position: relative;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 15px 50px 15px 20px;
  border: 2px solid ${props => props.theme.colors.gray200};
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.gray500};
  }
`;

const SearchButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  flex-wrap: wrap;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 10px;
`;

const FilterTab = styled.button`
  background: ${props => props.active ? props.theme.colors.primary : 'white'};
  color: ${props => props.active ? 'white' : props.theme.colors.gray600};
  border: 2px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray200};
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.active ? 'white' : props.theme.colors.primary};
  }
`;

const SearchResults = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid ${props => props.theme.colors.gray200};
  
  h2 {
    color: ${props => props.theme.colors.textPrimary};
    font-size: 1.4rem;
  }
  
  .count {
    color: ${props => props.theme.colors.gray600};
    font-size: 0.9rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.gray600};
  
  .icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.5;
  }
  
  h3 {
    margin-bottom: 10px;
    color: ${props => props.theme.colors.gray700};
  }
  
  p {
    line-height: 1.6;
  }
`;

const ResultCard = styled.div`
  border: 1px solid ${props => props.theme.colors.gray200};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 2px 8px rgba(0, 102, 204, 0.1);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const UserResult = styled(ResultCard)`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
`;

const UserInfo = styled.div`
  flex: 1;
  
  .name {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 4px;
  }
  
  .meta {
    color: ${props => props.theme.colors.gray600};
    font-size: 0.9rem;
    margin-bottom: 6px;
  }
  
  .bio {
    color: ${props => props.theme.colors.gray700};
    font-size: 0.9rem;
    line-height: 1.4;
  }
`;

const PostResult = styled(ResultCard)`
  .title {
    font-weight: 600;
    color: ${props => props.theme.colors.textPrimary};
    margin-bottom: 8px;
    font-size: 1.1rem;
  }
  
  .content {
    color: ${props => props.theme.colors.gray700};
    margin-bottom: 12px;
    line-height: 1.5;
  }
  
  .meta {
    display: flex;
    align-items: center;
    gap: 15px;
    font-size: 0.85rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const TagResult = styled(ResultCard)`
  .tag {
    font-weight: 600;
    color: ${props => props.theme.colors.primary};
    margin-bottom: 8px;
    font-size: 1.1rem;
  }
  
  .description {
    color: ${props => props.theme.colors.gray700};
    margin-bottom: 8px;
  }
  
  .stats {
    font-size: 0.85rem;
    color: ${props => props.theme.colors.gray600};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid ${props => props.theme.colors.gray200};
    border-top: 3px solid ${props => props.theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
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

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Simulate API call - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock results - replace with actual API results
      setResults({
        users: [
          {
            id: 1,
            name: 'Dr. Sarah Johnson',
            username: 'drjohnson',
            specialty: 'Cardiology',
            bio: 'Cardiologist specializing in heart disease prevention and treatment.',
            type: 'doctor'
          },
          {
            id: 2,
            name: 'Medical Student Alex',
            username: 'medalex',
            college: 'Harvard Medical School',
            bio: 'Final year medical student interested in pediatrics.',
            type: 'student'
          }
        ],
        posts: [
          {
            id: 1,
            title: 'Latest advances in cardiac surgery',
            content: 'Recent developments in minimally invasive cardiac procedures have shown promising results...',
            author: 'Dr. Sarah Johnson',
            likes: 24,
            comments: 8,
            created_at: '2024-01-15'
          },
          {
            id: 2,
            title: 'Study tips for medical students',
            content: 'Effective study strategies that helped me through medical school...',
            author: 'Medical Student Alex',
            likes: 15,
            comments: 12,
            created_at: '2024-01-14'
          }
        ],
        tags: [
          { id: 1, name: 'cardiology', posts: 45, description: 'Posts related to heart and cardiovascular medicine' },
          { id: 2, name: 'medical-school', posts: 32, description: 'Tips and discussions for medical students' },
          { id: 3, name: 'surgery', posts: 28, description: 'Surgical procedures and techniques' }
        ]
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim());
    }
  };

  const getFilteredResults = () => {
    switch (activeFilter) {
      case 'users':
        return { users: results.users, posts: [], tags: [] };
      case 'posts':
        return { users: [], posts: results.posts, tags: [] };
      case 'tags':
        return { users: [], posts: [], tags: results.tags };
      default:
        return results;
    }
  };

  const filteredResults = getFilteredResults();
  const totalResults = filteredResults.users.length + filteredResults.posts.length + filteredResults.tags.length;

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

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

        <FilterSection>
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
        </FilterSection>
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
                  <UserResult key={user.id}>
                    <UserAvatar>
                      {getInitials(user.name)}
                    </UserAvatar>
                    <UserInfo>
                      <div className="name">{user.name}</div>
                      <div className="meta">
                        @{user.username} • {user.specialty || user.college}
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
                  <PostResult key={post.id}>
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
                  <TagResult key={tag.id}>
                    <div className="tag">#{tag.name}</div>
                    <div className="description">{tag.description}</div>
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