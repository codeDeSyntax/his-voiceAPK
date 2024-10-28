import React, { useEffect, useState } from 'react';
import { Suspense } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform } from 'react-native';
import StackNavigator from './components/StackNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { SermonProvider } from './Logic/globalState';
import { AppThemeProvider } from './Logic/theme';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert('Update available', 'Restarting to apply the update...');
          await Updates.reloadAsync(); // Will reload the app with the new update
        }
      } catch (e) {
        console.log('Error checking for updates', e);
      }
    }

    checkForUpdates();
  }, []);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Prevent the splash screen from auto-hiding
        await SplashScreen.preventAutoHideAsync();

        // Simulate any startup tasks (e.g., setting up context, state, etc.)
        await new Promise(resolve => setTimeout(resolve, 7000)); // 3 seconds delay
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
    return null; // Prevent rendering the app until it's fully ready
  }

  return (
    <AppThemeProvider>
      <SermonProvider>
        <NavigationContainer>
          <KeyboardAvoidingView
            style={{ flex: 1, }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <StackNavigator />
            <StatusBar style="light" backgroundColor="#22272a" />
          </KeyboardAvoidingView>
        </NavigationContainer>
      </SermonProvider>
    </AppThemeProvider>
  );
}
