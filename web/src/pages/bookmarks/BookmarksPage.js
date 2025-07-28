// web/src/pages/bookmarks/BookmarksPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { 
  Bookmark, 
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  BookmarkMinus,
  Search,
  Filter,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { postService } from '../../services/api';
import PostCard from '../../components/posts/PostCard';

const BookmarksContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
`;

const BookmarksHeader = styled.div`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
    animation: pulse 3s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.1); opacity: 0.8; }
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  
  .icon-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    margin: 0 auto 20px;
  }
  
  h1 {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 10px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  p {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
  }
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 300px;
  
  input {
    width: 100%;
    padding: 12px 16px 12px 40px;
    border: 1px solid ${props => props.theme.colors.gray300};
    border-radius: 8px;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
    }
  }
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.gray500};
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme.colors.gray600};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray300};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.gray100};
    border-color: ${props => props.active ? props.theme.colors.primaryDark : props.theme.colors.primary};
  }
`;

const BookmarkStats = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  .stat {
    text-align: center;
    
    .number {
      font-size: 1.2rem;
      font-weight: 700;
      color: ${props => props.theme.colors.gray800};
      display: block;
    }
    
    .label {
      font-size: 0.85rem;
      color: ${props => props.theme.colors.gray600};
      margin-top: 2px;
    }
  }
`;

const BookmarksList = styled.div`
  display: grid;
  gap: 20px;
`;

const BookmarkCard = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.gray200};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    
    .bookmark-actions {
      opacity: 1;
    }
  }
`;

const BookmarkHeader = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  display: flex;
  gap: 8px;
`;

const BookmarkDate = styled.div`
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BookmarkActions = styled.div`
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  gap: 8px;
  
  button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.remove-bookmark {
      background: ${props => props.theme.colors.danger};
      color: white;
      
      &:hover {
        background: ${props => props.theme.colors.danger}dd;
        transform: scale(1.1);
      }
    }
    
    &.more-options {
      background: rgba(0, 0, 0, 0.5);
      color: white;
      
      &:hover {
        background: rgba(0, 0, 0, 0.7);
      }
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  
  .spinner {
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

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: ${props => props.theme.colors.gray600};
  
  .icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 30px;
    opacity: 0.3;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: ${props => props.theme.colors.gray700};
  }
  
  p {
    font-size: 1rem;
    margin-bottom: 30px;
    line-height: 1.6;
  }
  
  button {
    background: ${props => props.theme.colors.primary};
    color: white;
    border: none;
    padding: 14px 28px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s ease;
    
    &:hover {
      background: ${props => props.theme.colors.primaryDark};
    }
  }
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.danger};
  
  .icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    opacity: 0.5;
  }
  
  h3 {
    margin-bottom: 10px;
    color: ${props => props.theme.colors.danger};
  }
  
  button {
    margin-top: 20px;
    background: ${props => props.theme.colors.danger};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    
    &:hover {
      background: ${props => props.theme.colors.danger}dd;
    }
  }
`;

const BookmarksPage = () => {
  const { user } = useSelector(state => state.auth);
  
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, recent, popular
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📚 Fetching user bookmarks...');
      const response = await postService.getBookmarkedPosts(1, 50);
      console.log('✅ Bookmarks fetched:', response);
      
      setBookmarks(response.posts || []);
      
      // Calculate stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const thisWeek = (response.posts || []).filter(post => 
        new Date(post.bookmarked_at || post.created_at) >= oneWeekAgo
      ).length;
      
      const thisMonth = (response.posts || []).filter(post => 
        new Date(post.bookmarked_at || post.created_at) >= oneMonthAgo
      ).length;
      
      setStats({
        total: response.posts?.length || 0,
        thisWeek,
        thisMonth
      });
      
    } catch (err) {
      console.error('❌ Error fetching bookmarks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (postId) => {
    try {
      console.log('🗑️ Removing bookmark for post:', postId);
      await postService.unbookmarkPost(postId);
      
      // Remove from local state
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== postId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
      
      console.log('✅ Bookmark removed successfully');
    } catch (err) {
      console.error('❌ Error removing bookmark:', err);
      alert('Failed to remove bookmark');
    }
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const content = bookmark.content?.toLowerCase() || '';
      const authorName = bookmark.author?.full_name?.toLowerCase() || '';
      
      if (!content.includes(query) && !authorName.includes(query)) {
        return false;
      }
    }
    
    // Time filter
    if (filterBy === 'recent') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(bookmark.bookmarked_at || bookmark.created_at) >= oneWeekAgo;
    } else if (filterBy === 'popular') {
      const totalEngagement = (bookmark.likes_count || 0) + (bookmark.comments_count || 0);
      return totalEngagement >= 5; // Posts with 5+ likes/comments
    }
    
    return true; // 'all' filter
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const handleExploreClick = () => {
    window.location.href = '/feed';
  };

  const handleRetry = () => {
    fetchBookmarks();
  };

  if (loading) {
    return (
      <BookmarksContainer>
        <BookmarksHeader>
          <HeaderContent>
            <div className="icon-container">
              <Bookmark size={30} />
            </div>
            <h1>Saved Posts</h1>
            <p>Your bookmarked content library</p>
          </HeaderContent>
        </BookmarksHeader>
        
        <LoadingSpinner>
          <div className="spinner"></div>
          <span style={{ marginLeft: '12px' }}>Loading your bookmarks...</span>
        </LoadingSpinner>
      </BookmarksContainer>
    );
  }

  if (error) {
    return (
      <BookmarksContainer>
        <BookmarksHeader>
          <HeaderContent>
            <div className="icon-container">
              <Bookmark size={30} />
            </div>
            <h1>Saved Posts</h1>
            <p>Your bookmarked content library</p>
          </HeaderContent>
        </BookmarksHeader>
        
        <ErrorState>
          <Bookmark className="icon" />
          <h3>Unable to load bookmarks</h3>
          <p>{error}</p>
          <button onClick={handleRetry}>Try Again</button>
        </ErrorState>
      </BookmarksContainer>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <BookmarksContainer>
        <BookmarksHeader>
          <HeaderContent>
            <div className="icon-container">
              <Bookmark size={30} />
            </div>
            <h1>Saved Posts</h1>
            <p>Your bookmarked content library</p>
          </HeaderContent>
        </BookmarksHeader>
        
        <EmptyState>
          <Bookmark className="icon" />
          <h3>No saved posts yet</h3>
          <p>
            Start bookmarking interesting posts to build your personal library.<br/>
            Click the bookmark icon on any post to save it here.
          </p>
          <button onClick={handleExploreClick}>Explore Posts</button>
        </EmptyState>
      </BookmarksContainer>
    );
  }

  return (
    <BookmarksContainer>
      <BookmarksHeader>
        <HeaderContent>
          <div className="icon-container">
            <Bookmark size={30} />
          </div>
          <h1>Saved Posts</h1>
          <p>Your bookmarked content library</p>
        </HeaderContent>
      </BookmarksHeader>

      <FilterSection>
        <SearchBox>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search saved posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBox>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <FilterButton 
            active={filterBy === 'all'}
            onClick={() => setFilterBy('all')}
          >
            All
          </FilterButton>
          
          <FilterButton 
            active={filterBy === 'recent'}
            onClick={() => setFilterBy('recent')}
          >
            <Clock size={16} />
            Recent
          </FilterButton>
          
          <FilterButton 
            active={filterBy === 'popular'}
            onClick={() => setFilterBy('popular')}
          >
            <Heart size={16} />
            Popular
          </FilterButton>
        </div>
        
        <BookmarkStats>
          <div className="stat">
            <span className="number">{stats.total}</span>
            <span className="label">Total</span>
          </div>
          <div className="stat">
            <span className="number">{stats.thisWeek}</span>
            <span className="label">This Week</span>
          </div>
          <div className="stat">
            <span className="number">{stats.thisMonth}</span>
            <span className="label">This Month</span>
          </div>
        </BookmarkStats>
      </FilterSection>

      <BookmarksList>
        {filteredBookmarks.map((bookmark) => (
          <BookmarkCard key={bookmark.id}>
            <BookmarkHeader>
              <BookmarkDate>
                <Clock size={12} />
                Saved {formatDate(bookmark.bookmarked_at || bookmark.created_at)}
              </BookmarkDate>
              
              <BookmarkActions className="bookmark-actions">
                <button 
                  className="remove-bookmark"
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  title="Remove bookmark"
                >
                  <BookmarkMinus size={16} />
                </button>
                
                <button 
                  className="more-options"
                  title="More options"
                >
                  <MoreHorizontal size={16} />
                </button>
              </BookmarkActions>
            </BookmarkHeader>
            
            <PostCard 
              post={bookmark}
              showComments={false}
            />
          </BookmarkCard>
        ))}
      </BookmarksList>
    </BookmarksContainer>
  );
};

export default BookmarksPage;