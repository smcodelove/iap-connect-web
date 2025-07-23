/**
 * Tab Navigator for IAP Connect mobile app
 * Bottom tab navigation for main app screens
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { SCREEN_NAMES } from '../utils/constants';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import TrendingScreen from '../screens/home/TrendingScreen';
import SearchScreen from '../screens/search/SearchScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={SCREEN_NAMES.HOME}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case SCREEN_NAMES.HOME:
              iconName = focused ? 'home' : 'home-outline';
              break;
            case SCREEN_NAMES.TRENDING:
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case SCREEN_NAMES.SEARCH:
              iconName = focused ? 'search' : 'search-outline';
              break;
            case SCREEN_NAMES.PROFILE:
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4
        },
        headerShown: false
      })}
    >
      <Tab.Screen 
        name={SCREEN_NAMES.HOME} 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home'
        }}
      />
      <Tab.Screen 
        name={SCREEN_NAMES.TRENDING} 
        component={TrendingScreen}
        options={{
          tabBarLabel: 'Trending'
        }}
      />
      <Tab.Screen 
        name={SCREEN_NAMES.SEARCH} 
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search'
        }}
      />
      <Tab.Screen 
        name={SCREEN_NAMES.PROFILE} 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;