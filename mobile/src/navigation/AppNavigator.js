import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch, useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

// Import navigators
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

// Import screens
import PostDetailScreen from '../screens/post/PostDetailScreen';
import CreatePostScreen from '../screens/post/CreatePostScreen';
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
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{
              animationTypeForReplace: 'pop'
            }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={TabNavigator}
              options={{
                animationTypeForReplace: 'push'
              }}
            />
            
            <Stack.Screen 
              name={SCREEN_NAMES.CREATE_POST} 
              component={CreatePostScreen}
              options={{
                title: 'Create Post',
                headerShown: true,
                presentation: "modal"
              }}
            />
            
            <Stack.Screen 
              name={SCREEN_NAMES.EDIT_PROFILE} 
              component={EditProfileScreen}
              options={{
                title: 'Edit Profile',
                headerShown: true
              }}
            />
            
            <Stack.Screen 
              name={SCREEN_NAMES.POST_DETAIL} 
              component={PostDetailScreen}
              options={{
                title: 'Post',
                headerShown: true
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
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default AppNavigator;