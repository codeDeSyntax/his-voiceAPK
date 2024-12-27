import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import StackNavigator from './components/StackNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { SermonProvider } from './Logic/globalState';
import { Alert,Text } from 'react-native';
import UpdateScreen from './screens/Updating';


export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  
  useEffect(() => {
    async function prepareApp() {
      try {
        // Prevent the splash screen from auto-hiding
        await SplashScreen.preventAutoHideAsync();

        // Simulate any startup tasks (e.g., setting up context, state, etc.)
        await new Promise(resolve => setTimeout(resolve, 5000)); // 3 seconds delay
      } catch (e) {
        console.warn(e);
      } finally {
        // Mark the app as ready and hide the splash screen
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepareApp();
  }, []);

  if (!appIsReady) {
    return <UpdateScreen/>; // Prevent rendering the app until it's fully ready
  }

  return (
    <>
      <SermonProvider>
        <NavigationContainer>
            <StatusBar style="light" backgroundColor="#22272a" />
            <StackNavigator />
        </NavigationContainer>
      </SermonProvider>
    </>
  );
}
