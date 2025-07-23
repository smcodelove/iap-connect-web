/**
 * Main App Navigator for IAP Connect mobile app
 * Manages navigation between authenticated and unauthenticated states
 */

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
import { colors } from '../styles/colors';
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
          // Unauthenticated screens
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{
              animationTypeForReplace: 'pop'
            }}
          />
        ) : (
          // Authenticated screens
          <>
            <Stack.Screen 
              name="Main" 
              component={TabNavigator}
              options={{
                animationTypeForReplace: 'push'
              }}
            />
            
            {/* Modal/Overlay screens */}
            <Stack.Group screenOptions={{ 
              presentation: 'modal',
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.white,
                shadowColor: colors.gray200,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 4
              },
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
                color: colors.textPrimary
              },
              headerTintColor: colors.primary
            }}>
              <Stack.Screen 
                name={SCREEN_NAMES.CREATE_POST} 
                component={CreatePostScreen}
                options={{
                  title: 'Create Post',
                  headerLeft: () => null
                }}
              />
              
              <Stack.Screen 
                name={SCREEN_NAMES.EDIT_PROFILE} 
                component={EditProfileScreen}
                options={{
                  title: 'Edit Profile'
                }}
              />
            </Stack.Group>
            
            {/* Regular stack screens */}
            <Stack.Group screenOptions={{
              headerShown: true,
              headerStyle: {
                backgroundColor: colors.white,
                shadowColor: colors.gray200,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 4
              },
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
                color: colors.textPrimary
              },
              headerTintColor: colors.primary,
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              }
            }}>
              <Stack.Screen 
                name={SCREEN_NAMES.POST_DETAIL} 
                component={PostDetailScreen}
                options={{
                  title: 'Post'
                }}
              />
              
              <Stack.Screen 
                name={SCREEN_NAMES.USER_PROFILE} 
                component={PostDetailScreen} // Placeholder - will be UserProfileScreen
                options={({ route }) => ({
                  title: route.params?.userName || 'Profile'
                })}
              />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default AppNavigator;