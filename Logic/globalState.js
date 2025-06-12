import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, ToastAndroid } from "react-native";
import * as Updates from 'expo-updates';
// Separate configuration from component logic
const SERMON_MODULES = {
  earlySermons: () => import("../sermons/1964-1969/firstset"),
  secondSet: () => import("../sermons/1970/1970"),
  thirdSet: () => import("../sermons/1971/1971"),
  fourthSet: () => import("../sermons/1972/1972"),
  lastSet: () => import("../sermons/1973/1973"),
  audioSermons: () => import("../sermons/audio"),
};

// Storage keys in constants to avoid typos
const STORAGE_KEYS = {
  RECENTLY_OPENED: "recentlyOpenedSermons",
  SETTINGS: "sermonSettings",
  LAST_POSITIONS: "sermonLastPositions",
};

const INITIAL_SETTINGS = {
  darkMode: false,
  backgroundColor: "#fafafa",
  fontSize: 22,
  fontFamily: "ZillaSlab",
  textColor: "#031412", // Fixed inconsistency - textColor should match non-dark text
};

// Create context with a more descriptive default value
const SermonContext = createContext(null);

// Create custom hook for context usage
export const useAppContext = () => {
  const context = useContext(SermonContext);
  if (!context) {
    throw new Error("useSermonContext must be used within a SermonProvider");
  }
  return context;
};

export const SermonProvider = ({ children }) => {
  // State management
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [allSermons, setAllSermons] = useState([]);
  const [textSermons, setTextSermons] = useState([]);
  const [recentlyOpened, setRecentlyOpened] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [isDarkMode, setIsDarkMode] = useState(INITIAL_SETTINGS.darkMode);
  const [sermonsLoaded, setSermonsLoaded] = useState(false);
  const [numberOfColumns , setNumberOfColumns] = useState(2);
  const [lastReadPositions, setLastReadPositions] = useState({});

  // Theme derived from isDarkMode
  const theme = useMemo(
    () => ({
      dark: isDarkMode,
      colors: {
        primary: isDarkMode ? "#292524" : "#fafafa",
        background: isDarkMode ? "#1c1917" : "#fafafa",
        secondary: isDarkMode ? "#121212" : "#fafafa",
        text: isDarkMode ? "#f2cdb4" : "#1c1917",
        hlight: "#d57a3e",
        blueText: "",
      },
    }),
    [isDarkMode]
  );

  // Update last read position for a sermon
  const updateLastReadPosition = useCallback(async (sermonId, paragraphIndex) => {
    try {
      const updatedPositions = {
        ...lastReadPositions,
        [sermonId]: paragraphIndex
      };
      
      setLastReadPositions(updatedPositions);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(
        STORAGE_KEYS.LAST_POSITIONS,
        JSON.stringify(updatedPositions)
      );
    } catch (error) {
      console.error("Failed to update last read position:", error);
    }
  }, [lastReadPositions]);

  // Get last read position for a sermon
  const getLastReadPosition = useCallback((sermonId) => {
    return lastReadPositions[sermonId] || 0;
  }, [lastReadPositions]);

  // Handle selecting a random sermon
  const handleRandomSermons = useCallback(() => {
    if (textSermons.length > 0) {
      const randomIndex = Math.floor(Math.random() * textSermons.length);
      const randomSermon = textSermons[randomIndex];
      // Add last read position to sermon
      const sermonWithPosition = {
        ...randomSermon,
        lastReadParagraph: getLastReadPosition(randomSermon.id)
      };
      setSelectedSermon(sermonWithPosition);
    }
  }, [textSermons, getLastReadPosition]);

  // Enhanced setSelectedSermon to include last read position
  const setSelectedSermonWithPosition = useCallback((sermon) => {
    if (sermon) {
      const sermonWithPosition = {
        ...sermon,
        lastReadParagraph: getLastReadPosition(sermon.id)
      };
      setSelectedSermon(sermonWithPosition);
    } else {
      setSelectedSermon(null);
    }
  }, [getLastReadPosition]);

  // Add sermon to recently opened
  const addToRecentlyOpened = useCallback((sermon) => {
    if (!sermon) return;

    setRecentlyOpened((prevRecents) => {
      // Remove if already exists
      // dont allow for duplicates
      const sermonExists = prevRecents.some((s) => (s.id === sermon.id && s.title === sermon.title)); 
      if (sermonExists) {
       
        return prevRecents;
      }
      const filteredRecents = prevRecents.filter((s) => s.id !== sermon.id);
      // Add to beginning of array with last read position
      const newRecents = [{
        id: sermon.id,
        title: sermon.title,
        date: sermon.date,
        location: sermon?.location,
        type: sermon.type,
        year: sermon.year,
        lastReadParagraph: getLastReadPosition(sermon.id)
      }, ...filteredRecents].slice(0, 20); // Limit to 20 items

      // Save to storage
      AsyncStorage.setItem(
        STORAGE_KEYS.RECENTLY_OPENED,
        JSON.stringify(newRecents)
      ).catch((err) => console.error("Error saving recents:", err));

      return newRecents;
    });
  }, [getLastReadPosition]);

  // Load sermons from modules
  const loadSermons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all sermon modules concurrently
      const loadedModules = await Promise.all(
        Object.values(SERMON_MODULES).map((importFn) => importFn())
      );

      const fetchedSermons = loadedModules.reduce((acc, module) => {
        const moduleSermons = Object.values(module)[0];
        return [...acc, ...moduleSermons];
      }, []);

      // Set all sermons
      setAllSermons(fetchedSermons);

      // Filter and set text sermons
      const filteredTextSermons = fetchedSermons.filter(
        (sermon) => sermon.type === "text"
      );
      setTextSermons(filteredTextSermons);

      setSermonsLoaded(true);
      setLoading(false);

      return true; // Return success status
    } catch (err) {
      console.error("Error loading sermons:", err);
      setError("Failed to load sermons. Please try again later.");
      setLoading(false);
      setSermonsLoaded(false);
      return false; // Return failure status
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(
    async (newSettings) => {
      try {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        setIsDarkMode(updatedSettings.darkMode);

        await AsyncStorage.setItem(
          STORAGE_KEYS.SETTINGS,
          JSON.stringify(updatedSettings)
        );
        return true;
      } catch (error) {
        console.error("Failed to update settings:", error);
        return false;
      }
    },
    [settings]
  );

  // Load data from storage
  const loadStoredData = useCallback(async () => {
    try {
      // Load recents
      const recentsValue = await AsyncStorage.getItem(
        STORAGE_KEYS.RECENTLY_OPENED
      );
      if (recentsValue) {
        setRecentlyOpened(JSON.parse(recentsValue));
      }

      // Load settings
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        setIsDarkMode(parsedSettings.darkMode);
      }

      // Load last read positions
      const storedPositions = await AsyncStorage.getItem(STORAGE_KEYS.LAST_POSITIONS);
      if (storedPositions) {
        setLastReadPositions(JSON.parse(storedPositions));
      }
    } catch (error) {
      console.error("Failed to load stored data:", error);
    }
  }, []);

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      await Promise.all([loadSermons(), loadStoredData()]);
    };

    initializeApp();
  }, [loadSermons, loadStoredData]);

  // Select random sermon after sermons are loaded
  useEffect(() => {
    if (sermonsLoaded && textSermons.length > 0 && !selectedSermon) {
      handleRandomSermons();
    }
  }, [sermonsLoaded, textSermons, handleRandomSermons, selectedSermon]);

  // Update recently opened when sermon changes
  useEffect(() => {
    if (selectedSermon) {
      addToRecentlyOpened(selectedSermon);
    }
  }, [selectedSermon, addToRecentlyOpened]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      // Sermon data
      selectedSermon,
      setSelectedSermon: setSelectedSermonWithPosition,
      allSermons,
      textSermons,
      recentlyOpened,
      addToRecentlyOpened,
      setRecentlyOpened,

      // UI state
      searchText,
      setSearchText,
      error,
      loading,
      sermonsLoaded,

      // Theme and settings
      theme,
      isDarkMode,
      setIsDarkMode,
      settings,
      setSettings,

      // Position tracking
      lastReadPositions,
      updateLastReadPosition,
      getLastReadPosition,

      // Actions
      handleRandomSermons,
      updateSettings,
      refreshSermons: loadSermons,
      numberOfColumns,
      setNumberOfColumns,

      // Add additional helper functions
      filterSermonsByTag: (tag) => {
        return allSermons.filter(
          (sermon) => sermon.tags && sermon.tags.includes(tag)
        );
      },
      getSermonById: (id) => {
        return allSermons.find((sermon) => sermon.id === id);
      },
    }),
    [
      selectedSermon,
      setSelectedSermonWithPosition,
      allSermons,
      textSermons,
      recentlyOpened,
      searchText,
      setSearchText,
      error,
      loading,
      sermonsLoaded,
      theme,
      isDarkMode,
      settings,
      lastReadPositions,
      updateLastReadPosition,
      getLastReadPosition,
      handleRandomSermons,
      updateSettings,
      loadSermons,
      numberOfColumns,
      setNumberOfColumns,
    ]
  );

  return (
    <SermonContext.Provider value={contextValue}>
      {children}
    </SermonContext.Provider>
  );
};

export { SermonContext };