// navigation/TabNavigator.js - Final with Trending Tab
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Feather';
import { SCREEN_NAMES } from '../utils/constants';

// Import your main screen components
import HomeScreen from '../screens/main/HomeScreen';
import TrendingScreen from '../screens/home/TrendingScreen';
import SearchScreen from '../screens/search/SearchScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const colors = {
  primary: '#0066CC',
  accent: '#FF6B35',
  gray600: '#6C757D',
  white: '#FFFFFF',
  gray100: '#F8F9FA',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray600,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.gray100,
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconColor = color;

          if (route.name === SCREEN_NAMES.HOME) {
            iconName = 'home';
          } else if (route.name === 'Trending') {
            iconName = 'trending-up';
            // Special orange color for trending when active
            iconColor = focused ? colors.accent : color;
          } else if (route.name === 'Search') {
            iconName = 'search';
          } else if (route.name === SCREEN_NAMES.PROFILE) {
            iconName = 'user';
          }

          return <Icon name={iconName} size={size + 2} color={iconColor} />;
        },
      })}
    >
      <Tab.Screen 
        name={SCREEN_NAMES.HOME} 
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarBadge: null,
        }}
      />
      
      <Tab.Screen 
        name="Trending" 
        component={TrendingScreen}
        options={{
          title: 'Trending',
          tabBarBadge: null,
          tabBarActiveTintColor: colors.accent, // Special color for trending
        }}
      />
      
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          title: 'Search',
          tabBarBadge: null,
        }}
      />
      
      <Tab.Screen 
        name={SCREEN_NAMES.PROFILE} 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarBadge: null,
        }}
      />
    </Tab.Navigator>
  );
}