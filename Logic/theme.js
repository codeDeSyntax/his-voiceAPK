import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const AppThemeContext = createContext();

export const AppThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');

  

  const theme = {
    dark: isDarkMode,
    colors: {
      primary: isDarkMode ? '#2d2d2d' : '#fafefe',
      background: isDarkMode ? '#2d2d2d' : '#fafefe',
      surface: isDarkMode ? '#1f1f1f' : '#ffffff',
      text: isDarkMode ? '#e9fcf9' : '#031412',
    },
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const value = await AsyncStorage.getItem('sermonSettings');
        if (value !== null) {
          const settings = JSON.parse(value);
          if (settings.themeMode !== undefined) {
            setIsDarkMode(settings.themeMode);
          }
        }
      } catch (e) {
        console.log('Failed to load theme:', e);
      }
    };

    loadTheme();
  }, []);

  return (
    <AppThemeContext.Provider value={{ theme,setIsDarkMode,isDarkMode }}>
      {children}
    </AppThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(AppThemeContext);
