import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';


const AppThemeContext = createContext();

export const AppThemeProvider = ({ children }) => {
  // const { settings, setSettings } = useContext(SermonContext);
  const systemTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(true);

  

  const theme = {
    dark: isDarkMode,
    colors: {
      primary: isDarkMode ? '#151718' : '#fdfaee',
      background: isDarkMode ? '#0c0d0e' : '#fdfaee',
      secondary: isDarkMode ? '#202425' : '#fdfaee',
      text: isDarkMode ? '#e5e5e5' : '#031412',
      ltext: isDarkMode ? '#494d50' : '#031412',
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
