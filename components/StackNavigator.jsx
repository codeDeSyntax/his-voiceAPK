import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './BottomTabNavigator';
import About from '../screens/About/About';

const Stack = createNativeStackNavigator();

function StackNavigator() {
  return (
    <Stack.Navigator initialRouteName="MainTabs">
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="About" 
        component={About} 
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

export default StackNavigator;
