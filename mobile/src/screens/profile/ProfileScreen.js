// mobile/src/screens/profile/ProfileScreen.js
// screens/profile/ProfileScreen.js - Updated with Admin Dashboard Access
/**
 * ProfileScreen component displays user profiles with follow functionality
 * Shows user info, stats, and recent posts with beautiful UI
 * UPDATED: Added Admin Dashboard access for admin users
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
import { useSelector } from 'react-redux'; // ADDED: Import useSelector
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
  Bookmark,
  Settings,
  Shield, // ADDED: Shield icon for admin dashboard
  BarChart3 // ADDED: Analytics icon
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SCREEN_NAMES } from '../../utils/constants'; // ADDED: Import screen names

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
  
  // UPDATED: Get current user from Redux
  const currentUser = useSelector(state => state.auth.user);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const isOwnProfile = !user_id || user_id === currentUser?.id;

  // Mock profile data (replace with actual API call)
  const mockProfile = {
    id: isOwnProfile ? 1 : user_id || 2,
    username: isOwnProfile ? currentUser?.username || "dr_sharma" : "dr_patel",
    full_name: isOwnProfile ? currentUser?.full_name || "Dr. Rajesh Sharma" : "Dr. Priya Patel",
    email: isOwnProfile ? currentUser?.email || "rajesh@example.com" : "priya@example.com",
    user_type: isOwnProfile ? currentUser?.user_type || "doctor" : "doctor",
    bio: isOwnProfile ? 
      currentUser?.bio || "Cardiologist with 10+ years of experience. Passionate about medical education and helping fellow doctors." :
      "Pediatrician specializing in child healthcare. Love sharing knowledge with medical community.",
    specialty: isOwnProfile ? currentUser?.specialty || "Cardiology" : "Pediatrics",
    college: isOwnProfile ? currentUser?.college : null,
    profile_picture_url: isOwnProfile ? currentUser?.profile_picture_url : null,
    followers_count: isOwnProfile ? 1250 : 890,
    following_count: isOwnProfile ? 345 : 234,
    posts_count: isOwnProfile ? 89 : 67,
    display_info: isOwnProfile ? currentUser?.specialty || "Cardiology" : "Pediatrics",
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
    try {
      navigation.navigate('EditProfile');
    } catch (error) {
      Alert.alert('Coming Soon', 'Edit Profile feature will be available soon!');
    }
  };

  // Handle Saved Posts navigation
  const handleSavedPosts = () => {
    console.log('📚 Navigating to Saved Posts...');
    try {
      navigation.navigate('Bookmarks');
    } catch (error) {
      Alert.alert('Coming Soon', 'Saved Posts feature will be available soon!');
    }
  };

  // ADDED: Handle Admin Dashboard navigation
  const handleAdminDashboard = () => {
    console.log('🛡️ Navigating to Admin Dashboard...');
    try {
      navigation.navigate(SCREEN_NAMES.ADMIN_DASHBOARD);
    } catch (error) {
      Alert.alert('Error', 'Unable to access admin dashboard');
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
            {/* ADDED: Admin Badge */}
            {profile.user_type === 'admin' && (
              <View style={[styles.verifiedBadge, styles.adminBadge]}>
                <Shield size={12} color={colors.white} style={{ marginRight: 4 }} />
                <Text style={styles.verifiedText}>Admin</Text>
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

  // Profile Options for Own Profile
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

        {/* ADDED: Admin Dashboard Option - Only for admin users */}
        {currentUser?.user_type === 'admin' && (
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={handleAdminDashboard}
          >
            <View style={[styles.optionIcon, styles.adminOptionIcon]}>
              <Shield size={20} color={colors.white} />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Admin Dashboard</Text>
              <Text style={styles.optionSubtitle}>Manage users and platform content</Text>
            </View>
            <View style={styles.optionArrow}>
              <Text style={styles.optionArrowText}>›</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.optionItem}
          onPress={() => Alert.alert('Coming Soon', 'Settings feature will be available soon!')}
        >
          <View style={styles.optionIcon}>
            <Settings size={20} color={colors.gray600} />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Settings & Privacy</Text>
            <Text style={styles.optionSubtitle}>Manage your account settings</Text>
          </View>
          <View style={styles.optionArrow}>
            <Text style={styles.optionArrowText}>›</Text>
          </View>
        </TouchableOpacity>
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        {renderProfileHeader()}
        
        {/* Stats */}
        {renderStats()}
        
        {/* Bio */}
        {renderBio()}
        
        {/* Profile Options */}
        {renderProfileOptions()}
        
        {/* Posts Section */}
        <View style={styles.postsSection}>
          <View style={styles.postsSectionHeader}>
            <Text style={styles.sectionTitle}>Recent Posts</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {profile.recent_posts && profile.recent_posts.length > 0 ? (
            profile.recent_posts.map(post => (
              <View key={post.id} style={styles.postItem}>
                {/* Post content would go here */}
              </View>
            ))
          ) : (
            <View style={styles.noPostsContainer}>
              <Text style={styles.noPostsText}>
                {isOwnProfile 
                  ? "You haven't shared any posts yet. Start sharing your medical insights with the community!"
                  : `${profile.full_name} hasn't shared any posts yet.`
                }
              </Text>
              {isOwnProfile && (
                <TouchableOpacity 
                  style={styles.createPostButton}
                  onPress={() => navigation.navigate('CreatePost')}
                >
                  <Text style={styles.createPostButtonText}>Create Your First Post</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray600,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.gray600,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.white,
  },
  avatarInitials: {
    fontSize: 32,
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
    borderWidth: 3,
    borderColor: colors.white,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  userTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userType: {
    fontSize: 16,
    color: colors.white,
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // ADDED: Admin Badge Style
  adminBadge: {
    backgroundColor: colors.success,
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 8,
  },
  followButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginRight: 12,
    flex: 1,
    justifyContent: 'center',
  },
  notFollowingButton: {
    backgroundColor: colors.accent,
  },
  followingButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  notFollowingText: {
    color: colors.white,
  },
  followingText: {
    color: colors.primary,
  },
  moreButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.gray600,
  },
  bioContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
  },
  bioText: {
    fontSize: 16,
    color: colors.gray700,
    lineHeight: 22,
  },
  // Profile Options Styles
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
  // ADDED: Admin Option Icon Style
  adminOptionIcon: {
    backgroundColor: colors.success,
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