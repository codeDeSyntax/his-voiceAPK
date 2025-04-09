import React, { Suspense } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './BottomTabNavigator';
import About from '../screens/About/About';
import Welcome from '../screens/Welcome/Welcome';
import UpdateScreen from '../screens/Updating';
import { Alert } from 'react-native';

const Stack = createNativeStackNavigator();

// Separate component to wrap Welcome in Suspense
const WelcomeWithSuspense = ({navigation}) => (
  <Suspense fallback={<Alert title="Loading..." />}>
    <Welcome navigation={navigation} />
  </Suspense>
);

function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="welcome">
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="About" 
        component={About} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="welcome" 
        component={WelcomeWithSuspense} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="updating" 
        component={UpdateScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}

export default StackNavigator;
