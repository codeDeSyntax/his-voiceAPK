import React from 'react';
import { useEffect,useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './BottomTabNavigator';
import About from '../screens/About/About';
import Welcome from '../screens/Welcome/Welcome';
import { KeyboardAvoidingView, Platform} from 'react-native';
import UpdateScreen from '../screens/Updating';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

const Stack = createNativeStackNavigator();

function StackNavigator() {
  const [isUpdating , setIsUpdating] = useState(false)

  useEffect(() => {
    async function checkForUpdates() {
      if (__DEV__) {
        console.log("Skipping updates check in development mode");
        return;
      }
      try {
        setIsUpdating(true)
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          // Alert.alert('Update available', 'Restarting to apply the update...');
          setIsUpdating(false)
          await Updates.reloadAsync(); // Will reload the app with the new update
          
        }
      } catch (e) {
        console.log('Error checking for updates', e);
      }
    }
  
    checkForUpdates();
  }, []);
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
      <Stack.Screen 
        name="updating" 
        component={UpdateScreen} 
        options={{headerShown: false}}
      />
    </Stack.Navigator>
    
  );
}

export default StackNavigator;
