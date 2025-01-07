import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import sermons using dynamic imports for code splitting
const sermonModules = {
  earlySermons: () => import("../sermons/1964-1969/firstset"),
  secondSet: () => import("../sermons/1970/1970"),
  thirdSet: () => import("../sermons/1971/1971"),
  fourthSet: () => import("../sermons/1972/1972"),
  lastSet: () => import("../sermons/1973/1973"),
  audioSermons: () => import("../sermons/audio"),
};

const SermonContext = createContext();

// Separate initial states
const initialSettings = {
  darkMode: false,
  backgroundColor: "#fafafa",
  fontSize: 12,
  fontFamily: require("../assets/fonts/Philosopher-Regular.ttf"),
  textColor: "#fafafa",
};

const SermonProvider = ({ children }) => {
  // State management
  const [selectedSermon, setSelectedSermon] = useState({});
  const [allSermons, setAllSermons] = useState([]);
  const [recentlyOpened, setRecentlyOpened] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settings, setSettings] = useState(initialSettings);

  // Memoize theme object to prevent unnecessary rerenders
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

  // Memoize handlers
  const handleRandomSermons = useCallback(() => {
    if (allSermons.length > 0) {
      const sermonIndex = Math.floor(Math.random() * allSermons.length);
      setSelectedSermon(allSermons[sermonIndex]);
      console.log(selectedSermon)
    }
  }, [allSermons]);

  // Optimize sermon loading with chunking and async loading
  const loadSermons = async () => {
    try {
      const loadedModules = await Promise.all(
        Object.values(sermonModules).map(importFn => importFn())
      );
      
      const fetchedSermons = loadedModules.reduce((acc, module) => 
        [...acc, ...Object.values(module)[0]], []);
      
      setAllSermons(fetchedSermons);
      setLoading(false);
    } catch (err) {
      setError("Failed to load sermons");
      setLoading(false);
      console.error("Error loading sermons:", err);
    }
  };

  // Optimize storage operations
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

  // Effect for initial sermon loading
  useEffect(() => {
    loadSermons();
  }, []);

  //Effecct for random sermon
  // useEffect(() => {
  //   handleRandomSermons();
  // }, []);

  // Effect for loading recent sermons
  useEffect(() => {
    storageOperations.loadRecents();
  }, []);

  // Effect for loading settings
  useEffect(() => {
    storageOperations.loadSettings();
  }, []);

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({
    selectedSermon,
    setSelectedSermon,
    allSermons,
    setAllSermons,
    recentlyOpened,
    setRecentlyOpened,
    searchTerm,
    setSearchTerm,
    error,
    settings,
    setSettings,
    theme,
    isDarkMode,
    setIsDarkMode,
    handleRandomSermons,
    loading
  }), [
    selectedSermon,
    allSermons,
    recentlyOpened,
    searchTerm,
    error,
    settings,
    theme,
    isDarkMode,
    handleRandomSermons,
    loading
  ]);

  return (
    <SermonContext.Provider value={contextValue}>
      {children}
    </SermonContext.Provider>
  );
};

export { SermonContext, SermonProvider };