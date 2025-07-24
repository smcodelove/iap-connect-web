// navigation/AppNavigator.js - Updated with Search Screen
import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

// Import navigators
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

// Import screens
import CreatePostScreen from '../screens/post/CreatePostScreen';
import PostDetailScreen from '../screens/post/PostDetailScreen';
import SearchScreen from '../screens/search/SearchScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

// Import components
import Loading from '../components/common/LoadingSpinner';

// Import Redux
import { initializeAuth, selectAuthInitialized, selectIsAuthenticated, selectAuthLoading } from '../store/slices/authSlice';
import { colors } from '../utils/constants';
import { SCREEN_NAMES } from '../utils/constants';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authInitialized = useSelector(selectAuthInitialized);
  const authLoading = useSelector(selectAuthLoading);

  useEffect(() => {
    // Initialize authentication state on app start
    dispatch(initializeAuth());
  }, [dispatch]);

  // Show loading screen while initializing auth
  if (!authInitialized || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading 
          visible={true}
          text="Loading IAP Connect..."
          size="large"
        />
        <StatusBar style="light" backgroundColor={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar 
        style={isAuthenticated ? "dark" : "light"} 
        backgroundColor={isAuthenticated ? colors.white : colors.primary} 
      />
      
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{
              animationTypeForReplace: !isAuthenticated ? 'pop' : 'push',
            }}
          />
        ) : (
          // Main App Stack
          <>
            <Stack.Screen 
              name="Main" 
              component={TabNavigator}
            />
            
            {/* Modal Screens */}
            <Stack.Screen 
              name="CreatePost" 
              component={CreatePostScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }}
            />
            
            <Stack.Screen 
              name="PostDetail" 
              component={PostDetailScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
              }}
            />

            <Stack.Screen 
              name="Search" 
              component={SearchScreen}
              options={{
                headerShown: false,
                gestureEnabled: true,
                presentation: 'card',
              }}
            />
            
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
});

export default AppNavigator;