import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const sermonModules = {
  earlySermons: () => import("../sermons/1964-1969/firstset"),
  secondSet: () => import("../sermons/1970/1970"),
  thirdSet: () => import("../sermons/1971/1971"),
  fourthSet: () => import("../sermons/1972/1972"),
  lastSet: () => import("../sermons/1973/1973"),
  audioSermons: () => import("../sermons/audio"),
};

const SermonContext = createContext();

const initialSettings = {
  darkMode: false,
  backgroundColor: "#fafafa",
  fontSize: 12,
  fontFamily: "serif",
  textColor: "#fafafa",
};

const SermonProvider = ({ children }) => {
  // State management
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [allSermons, setAllSermons] = useState([]);
  const [textSermons, setTextSermons] = useState([]); // New state for text sermons
  const [recentlyOpened, setRecentlyOpened] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [sermonsLoaded, setSermonsLoaded] = useState(false); // New state to track sermon loading

  const theme = useMemo(
    () => ({
      dark: isDarkMode,
      colors: {
        primary: isDarkMode ? '#151718' : '#fafafa',
        background: isDarkMode ? '#0c0d0e' : '#fafafa',
        secondary: isDarkMode ? '#202425' : '#fafafa',
        text: isDarkMode ? '#e5e5e5' : '#031412',
        ltext: isDarkMode ? '#494d50' : '#031412',
      },
    }),
    [isDarkMode]
  );

  // Preload and cache text sermons
  const handleRandomSermons = useCallback(() => {
    if (textSermons.length > 0) {
      const randomIndex = Math.floor(Math.random() * textSermons.length);
      setSelectedSermon(textSermons[randomIndex]);
    }
  }, [textSermons]);

  // Improved sermon loading with better error handling and state management
  const loadSermons = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load all sermon modules concurrently
      const loadedModules = await Promise.all(
        Object.values(sermonModules).map(importFn => importFn())
      );
      
      const fetchedSermons = loadedModules.reduce((acc, module) => 
        [...acc, ...Object.values(module)[0]], []);
      
      // Set all sermons
      setAllSermons(fetchedSermons);
      
      // Filter and set text sermons
      const filteredTextSermons = fetchedSermons.filter(sermon => sermon.type === 'text');
      setTextSermons(filteredTextSermons);
      
      setSermonsLoaded(true);
      setLoading(false);
      
      // Log the counts for debugging
      console.log('Total sermons loaded:', fetchedSermons.length);
      console.log('Text sermons loaded:', filteredTextSermons.length);
      
      return true; // Return success status
    } catch (err) {
      console.error("Error loading sermons:", err);
      setError("Failed to load sermons");
      setLoading(false);
      setSermonsLoaded(false);
      return false; // Return failure status
    }
  }, []);

  // Storage operations with loading indicators
  const storageOperations = {
    saveRecents: async (recents) => {
      try {
        await AsyncStorage.setItem("recentlyOpenedSermons", JSON.stringify(recents));
      } catch (e) {
        console.error("Error saving recents:", e);
      }
    },

    loadRecents: async () => {
      try {
        const value = await AsyncStorage.getItem("recentlyOpenedSermons");
        if (value) {
          setRecentlyOpened(JSON.parse(value));
        }
      } catch (e) {
        console.error("Error loading recents:", e);
      }
    },

    loadSettings: async () => {
      try {
        const storedSettings = await AsyncStorage.getItem("sermonSettings");
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(parsedSettings);
          setIsDarkMode(parsedSettings.darkMode);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }
  };

  // Initial load effect
  useEffect(() => {
    const initializeApp = async () => {
      await Promise.all([
        loadSermons(),
        storageOperations.loadRecents(),
        storageOperations.loadSettings()
      ]);
    };

    initializeApp();
  }, [loadSermons]);

  // Select random sermon only after sermons are loaded
  useEffect(() => {
    if (sermonsLoaded && textSermons.length > 0 && !selectedSermon) {
      handleRandomSermons();
    }
  }, [sermonsLoaded, textSermons, handleRandomSermons, selectedSermon]);

  const contextValue = useMemo(() => ({
    selectedSermon,
    setSelectedSermon,
    allSermons,
    setAllSermons,
    textSermons, // Add textSermons to context
    recentlyOpened,
    setRecentlyOpened,
    searchText,
    setSearchText,
    error,
    settings,
    setSettings,
    theme,
    isDarkMode,
    setIsDarkMode,
    handleRandomSermons,
    loading,
    sermonsLoaded // Add sermonsLoaded to context
  }), [
    selectedSermon,
    allSermons,
    textSermons,
    recentlyOpened,
    searchText,
    setSearchText,
    error,
    settings,
    theme,
    isDarkMode,
    handleRandomSermons,
    loading,
    sermonsLoaded
  ]);

  return (
    <SermonContext.Provider value={contextValue}>
      {children}
    </SermonContext.Provider>
  );
};

export { SermonContext, SermonProvider };