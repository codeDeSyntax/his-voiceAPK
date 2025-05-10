import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
};

const INITIAL_SETTINGS = {
  darkMode: false,
  backgroundColor: "#fafafa",
  fontSize: 12,
  fontFamily: "serif",
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

  // Theme derived from isDarkMode
  const theme = useMemo(
    () => ({
      dark: isDarkMode,
      colors: {
        primary: isDarkMode ? "#010302" : "#fafafa",
        background: isDarkMode ? "#0c0d0e" : "#fafafa",
        secondary: isDarkMode ? "#121212" : "#fafafa",
        text: isDarkMode ? "#e5e5e5" : "#031412",
        ltext: isDarkMode ? "#494d50" : "#031412",
        blueText: "",
      },
    }),
    [isDarkMode]
  );

  // Handle selecting a random sermon
  const handleRandomSermons = useCallback(() => {
    if (textSermons.length > 0) {
      const randomIndex = Math.floor(Math.random() * textSermons.length);
      setSelectedSermon(textSermons[randomIndex]);
    }
  }, [textSermons]);

  // Add sermon to recently opened
  const addToRecentlyOpened = useCallback((sermon) => {
    if (!sermon) return;

    setRecentlyOpened((prevRecents) => {
      // Remove if already exists
      const filteredRecents = prevRecents.filter((s) => s.id !== sermon.id);
      // Add to beginning of array
      const newRecents = [sermon, ...filteredRecents].slice(0, 10); // Limit to 10 items

      // Save to storage
      AsyncStorage.setItem(
        STORAGE_KEYS.RECENTLY_OPENED,
        JSON.stringify(newRecents)
      ).catch((err) => console.error("Error saving recents:", err));

      return newRecents;
    });
  }, []);

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
      setSelectedSermon,
      allSermons,
      textSermons,
      recentlyOpened,
      addToRecentlyOpened,

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

      // Actions
      handleRandomSermons,
      updateSettings,
      refreshSermons: loadSermons,
      numberOfColumns , setNumberOfColumns,

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
      setSelectedSermon,
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
      handleRandomSermons,
      updateSettings,
      loadSermons,
    ]
  );

  return (
    <SermonContext.Provider value={contextValue}>
      {children}
    </SermonContext.Provider>
  );
};

export { SermonContext };
