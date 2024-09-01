import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import StackNavigator from './components/StackNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { SermonProvider } from './Logic/globalState';
import { AppThemeProvider } from './Logic/theme';

export default function App() {
  return (
    <AppThemeProvider>
      <SermonProvider>
        <NavigationContainer>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
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
