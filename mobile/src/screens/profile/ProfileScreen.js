// screens/profile/ProfileScreen.js - Updated with Saved Posts
/**
 * ProfileScreen component displays user profiles with follow functionality
 * Shows user info, stats, and recent posts with beautiful UI
 * UPDATED: Added Saved Posts option for own profile
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  Share,
  StyleSheet,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Calendar, 
  Heart, 
  MessageCircle, 
  Share2,
  Camera,
  Edit3,
  UserPlus,
  UserMinus,
  MoreHorizontal,
  Bookmark, // NEW: Bookmark icon
  Settings
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Colors object (since styles import might not be available)
const colors = {
  primary: '#0066CC',
  primaryLight: '#3385DB',
  accent: '#FF6B35',
  success: '#28A745',
  white: '#FFFFFF',
  gray100: '#F8F9FA',
  gray200: '#E9ECEF',
  gray600: '#6C757D',
  gray700: '#495057',
  gray900: '#212529',
  black: '#000000'
};

const typography = {
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 14, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' }
};

const { width } = Dimensions.get('window');

const ProfileScreen = ({ route, navigation }) => {
  const { user_id } = route.params || {};
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  // Mock current user - replace with actual Redux state
  const currentUser = {
    id: 1,
    username: "current_user",
    user_type: "doctor"
  };
  
  const isOwnProfile = !user_id || user_id === currentUser?.id;

  // Mock profile data
  const mockProfile = {
    id: isOwnProfile ? 1 : user_id || 2,
    username: isOwnProfile ? "dr_sharma" : "dr_patel",
    full_name: isOwnProfile ? "Dr. Rajesh Sharma" : "Dr. Priya Patel",
    email: isOwnProfile ? "rajesh@example.com" : "priya@example.com",
    user_type: "doctor",
    bio: isOwnProfile ? 
      "Cardiologist with 10+ years of experience. Passionate about medical education and helping fellow doctors." :
      "Pediatrician specializing in child healthcare. Love sharing knowledge with medical community.",
    specialty: isOwnProfile ? "Cardiology" : "Pediatrics",
    college: null,
    profile_picture_url: null,
    followers_count: isOwnProfile ? 1250 : 890,
    following_count: isOwnProfile ? 345 : 234,
    posts_count: isOwnProfile ? 89 : 67,
    display_info: isOwnProfile ? "Cardiology" : "Pediatrics",
    is_following: false,
    recent_posts: [],
    created_at: "2023-01-15T10:30:00Z"
  };

  useEffect(() => {
    loadProfile();
  }, [user_id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        setProfile(mockProfile);
        setFollowing(mockProfile.is_following || false);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      setFollowLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        if (following) {
          setFollowing(false);
          setProfile(prev => ({
            ...prev,
            followers_count: Math.max(0, prev.followers_count - 1),
            is_following: false
          }));
          Alert.alert('Success', 'Unfollowed successfully!');
        } else {
          setFollowing(true);
          setProfile(prev => ({
            ...prev,
            followers_count: prev.followers_count + 1,
            is_following: true
          }));
          Alert.alert('Success', 'Following successfully!');
        }
        setFollowLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status');
      setFollowLoading(false);
    }
  };

  const handleEditProfile = () => {
    // Check if EditProfile screen exists
    try {
      navigation.navigate('EditProfile');
    } catch (error) {
      Alert.alert('Coming Soon', 'Edit Profile feature will be available soon!');
    }
  };

  // NEW: Handle Saved Posts navigation
  const handleSavedPosts = () => {
    console.log('📚 Navigating to Saved Posts...');
    try {
      navigation.navigate('Bookmarks');
    } catch (error) {
      Alert.alert('Coming Soon', 'Saved Posts feature will be available soon!');
    }
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out ${profile.full_name}'s profile on IAP Connect!`,
        url: `https://iapconnect.com/profile/${profile.id}`
      });
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const renderAvatar = () => {
    if (profile?.profile_picture_url) {
      return (
        <Image 
          source={{ uri: profile.profile_picture_url }}
          style={styles.avatar}
        />
      );
    }
    
    // Default avatar with initials
    const initials = profile?.full_name
      ?.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase() || '?';
    
    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitials}>{initials}</Text>
      </View>
    );
  };

  const renderProfileHeader = () => (
    <LinearGradient
      colors={[colors.primaryLight, colors.primary]}
      style={styles.headerGradient}
    >
      <View style={styles.headerContent}>
        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          {renderAvatar()}
          {isOwnProfile && (
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => Alert.alert('Camera', 'Profile picture upload coming soon!')}
            >
              <Camera size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.fullName}>{profile.full_name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          
          <View style={styles.userTypeContainer}>
            <Text style={styles.userType}>
              {profile.display_info}
            </Text>
            {profile.user_type === 'doctor' && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Doctor</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isOwnProfile ? (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Edit3 size={16} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.followButtons}>
              <TouchableOpacity
                style={[styles.followButton, following ? styles.followingButton : styles.notFollowingButton]}
                onPress={handleFollow}
                disabled={followLoading}
              >
                {following ? 
                  <UserMinus size={16} color={colors.primary} /> : 
                  <UserPlus size={16} color={colors.white} />
                }
                <Text style={[styles.followButtonText, following ? styles.followingText : styles.notFollowingText]}>
                  {followLoading ? 'Loading...' : (following ? "Following" : "Follow")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.moreButton}
                onPress={handleShareProfile}
              >
                <Share2 size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </LinearGradient>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statNumber}>{profile.posts_count}</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statNumber}>{profile.followers_count}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statNumber}>{profile.following_count}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBio = () => {
    if (!profile.bio) return null;
    
    return (
      <View style={styles.bioContainer}>
        <Text style={styles.bioText}>{profile.bio}</Text>
      </View>
    );
  };

  // NEW: Profile Options for Own Profile
  const renderProfileOptions = () => {
    if (!isOwnProfile) return null;

    return (
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.optionItem}
          onPress={handleSavedPosts}
        >
          <View style={styles.optionIcon}>
            <Bookmark size={20} color={colors.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Saved Posts</Text>
            <Text style={styles.optionSubtitle}>View your bookmarked posts</Text>
          </View>
          <View style={styles.optionArrow}>
            <Text style={styles.optionArrowText}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => Alert.alert('Coming Soon', 'Settings feature will be available soon!')}
        >
          <View style={styles.optionIcon}>
            <Settings size={20} color={colors.primary} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Settings</Text>
            <Text style={styles.optionSubtitle}>Account and privacy settings</Text>
          </View>
          <View style={styles.optionArrow}>
            <Text style={styles.optionArrowText}>›</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRecentPosts = () => {
    if (!profile.recent_posts || profile.recent_posts.length === 0) {
      return (
        <View style={styles.noPostsContainer}>
          <Text style={styles.noPostsText}>
            {isOwnProfile ? "You haven't posted anything yet!" : "No posts yet"}
          </Text>
          {isOwnProfile && (
            <TouchableOpacity
              style={styles.createPostButton}
              onPress={() => {
                try {
                  navigation.navigate('CreatePost');
                } catch (error) {
                  Alert.alert('Coming Soon', 'Create Post feature will be available soon!');
                }
              }}
            >
              <Text style={styles.createPostButtonText}>Create Your First Post</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.postsSection}>
        <View style={styles.postsSectionHeader}>
          <Text style={styles.sectionTitle}>Recent Posts</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {/* Posts will be rendered here when available */}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.goBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderProfileHeader()}
        {renderStats()}
        {renderBio()}
        {renderProfileOptions()}
        {renderRecentPosts()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.gray600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    ...typography.h3,
    color: colors.gray600,
    marginBottom: 20,
    textAlign: 'center',
  },
  goBackButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  headerGradient: {
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
  avatarInitials: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.white,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fullName: {
    fontSize: 24,
    color: colors.white,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  username: {
    fontSize: 16,
    color: colors.gray200,
    marginTop: 4,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  userType: {
    fontSize: 14,
    color: colors.gray200,
  },
  verifiedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  verifiedText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: 'bold',
  },
  actionButtons: {
    width: '100%',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  followButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  notFollowingButton: {
    backgroundColor: colors.primary,
  },
  followingButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  followButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  notFollowingText: {
    color: colors.white,
  },
  followingText: {
    color: colors.primary,
  },
  moreButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: -15,
    borderRadius: 12,
    paddingVertical: 20,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: 4,
  },
  bioContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  bioText: {
    fontSize: 16,
    color: colors.gray700,
    lineHeight: 22,
  },
  // NEW: Profile Options Styles
  optionsContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: colors.gray600,
  },
  optionArrow: {
    marginLeft: 8,
  },
  optionArrowText: {
    fontSize: 20,
    color: colors.gray400,
    fontWeight: '300',
  },
  postsSection: {
    marginTop: 12,
  },
  postsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
  },
  viewAllText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  noPostsContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  noPostsText: {
    fontSize: 16,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: 20,
  },
  createPostButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  createPostButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;