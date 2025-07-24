import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SCREEN_NAMES } from '../utils/constants';

// Import your screen components
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={SCREEN_NAMES.LOGIN}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen 
        name={SCREEN_NAMES.LOGIN} 
        component={LoginScreen} 
      />
      <Stack.Screen 
        name={SCREEN_NAMES.REGISTER} 
        component={SignupScreen} 
      />
    </Stack.Navigator>
  );
}
