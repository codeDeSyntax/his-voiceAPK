import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './BottomTabNavigator';
import About from '../screens/About/About';
import Welcome from '../screens/Welcome/Welcome';
import { KeyboardAvoidingView, Platform} from 'react-native';

const Stack = createNativeStackNavigator();

function StackNavigator() {
  return (
  
     <Stack.Navigator initialRouteName="welcome" >
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
      <Stack.Screen 
        name="welcome" 
        component={Welcome} 
        options={{headerShown: false}}
      />
    </Stack.Navigator>
    
  );
}

export default StackNavigator;
