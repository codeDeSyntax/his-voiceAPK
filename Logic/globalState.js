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
import * as Updates from "expo-updates";
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
  SETTINGS: "sermonSettings",
  LAST_POSITIONS: "sermonLastPositions",
  BOOKMARKS: "sermonBookmarks",
  HIGHLIGHTS: "sermonHighlights",
  LAST_SERMON: "lastOpenedSermon", // Store reference to last opened sermon
  LAST_SCREEN: "lastVisitedScreen", // Store the last visited screen
  NAVIGATION_HISTORY: "navigationHistory", // Store navigation history stack
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
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [isDarkMode, setIsDarkMode] = useState(INITIAL_SETTINGS.darkMode);
  const [sermonsLoaded, setSermonsLoaded] = useState(false);
  const [numberOfColumns, setNumberOfColumns] = useState(2);
  const [lastReadPositions, setLastReadPositions] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState({}); // Store paragraph highlights
  const [lastVisitedScreen, setLastVisitedScreen] = useState(null); // Track last visited screen
  const [navigationHistory, setNavigationHistory] = useState([]); // Track navigation history

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
  const updateLastReadPosition = useCallback(
    async (sermonId, paragraphIndex) => {
      try {
        const updatedPositions = {
          ...lastReadPositions,
          [sermonId]: paragraphIndex,
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
    },
    [lastReadPositions]
  );

  // Get last read position for a sermon
  const getLastReadPosition = useCallback(
    (sermonId) => {
      return lastReadPositions[sermonId] || 0;
    },
    [lastReadPositions]
  );

  // Load last opened sermon
  const loadLastOpenedSermon = useCallback(async () => {
    try {
      const storedLastSermon = await AsyncStorage.getItem(
        STORAGE_KEYS.LAST_SERMON
      );
      if (storedLastSermon && textSermons.length > 0) {
        const lastSermonRef = JSON.parse(storedLastSermon);

        // Find the full sermon object from our loaded sermons
        const fullSermon = textSermons.find(
          (sermon) => sermon.id === lastSermonRef.id
        );

        if (fullSermon) {
          console.log("Loading last opened sermon:", fullSermon.title);
          setSelectedSermonWithPosition(fullSermon);
          return true; // Successfully loaded last sermon
        } else {
          console.log("Last opened sermon not found, will load random sermon");
        }
      }
      return false; // No last sermon found or failed to load
    } catch (error) {
      console.error("Failed to load last opened sermon:", error);
      return false;
    }
  }, [textSermons, setSelectedSermonWithPosition]);

  // Handle selecting a random sermon
  const handleRandomSermons = useCallback(() => {
    if (textSermons.length > 0) {
      const randomIndex = Math.floor(Math.random() * textSermons.length);
      const randomSermon = textSermons[randomIndex];
      console.log("Loading random sermon:", randomSermon.title);
      setSelectedSermonWithPosition(randomSermon);
    }
  }, [textSermons, setSelectedSermonWithPosition]);

  // Enhanced setSelectedSermon to include last read position and save as last opened
  const setSelectedSermonWithPosition = useCallback(
    async (sermon) => {
      if (sermon) {
        const sermonWithPosition = {
          ...sermon,
          lastReadParagraph: getLastReadPosition(sermon.id),
        };
        setSelectedSermon(sermonWithPosition);

        // Save as last opened sermon (store only essential data)
        try {
          const sermonReference = {
            id: sermon.id,
            title: sermon.title,
            date: sermon.date,
            type: sermon.type,
            // Don't store the full sermon content, just enough to identify it
          };
          await AsyncStorage.setItem(
            STORAGE_KEYS.LAST_SERMON,
            JSON.stringify(sermonReference)
          );
        } catch (error) {
          console.error("Failed to save last opened sermon:", error);
        }
      } else {
        setSelectedSermon(null);
      }
    },
    [getLastReadPosition]
  );

  // Last visited screen management
  const updateLastVisitedScreen = useCallback(
    async (screenName) => {
      try {
        setLastVisitedScreen(screenName);
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_SCREEN, screenName);
        console.log("Last visited screen updated:", screenName);

        // Also add to navigation history
        await addToNavigationHistory(screenName);
      } catch (error) {
        console.error("Failed to save last visited screen:", error);
      }
    },
    [addToNavigationHistory]
  );

  const getLastVisitedScreen = useCallback(async () => {
    try {
      const savedScreen = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SCREEN);
      if (savedScreen) {
        setLastVisitedScreen(savedScreen);
        return savedScreen;
      }
      return null;
    } catch (error) {
      console.error("Failed to load last visited screen:", error);
      return null;
    }
  }, []);

  // Navigation History Management - Optimized for performance
  const addToNavigationHistory = useCallback(
    async (screenName) => {
      try {
        const newHistory = [...navigationHistory];

        // Remove the screen if it already exists in history to avoid duplicates
        const existingIndex = newHistory.findIndex(
          (screen) => screen === screenName
        );
        if (existingIndex !== -1) {
          newHistory.splice(existingIndex, 1);
        }

        // Add to the end of the array (most recent)
        newHistory.push(screenName);

        // Keep only the last 10 screens to prevent memory issues
        if (newHistory.length > 10) {
          newHistory.shift();
        }

        setNavigationHistory(newHistory);

        // Save to AsyncStorage asynchronously without blocking UI
        setTimeout(async () => {
          try {
            await AsyncStorage.setItem(
              STORAGE_KEYS.NAVIGATION_HISTORY,
              JSON.stringify(newHistory)
            );
          } catch (storageError) {
            console.error("Failed to save navigation history:", storageError);
          }
        }, 0);

        console.log("Navigation history updated:", newHistory);
      } catch (error) {
        console.error("Failed to save navigation history:", error);
      }
    },
    [navigationHistory]
  );

  const getPreviousScreen = useCallback(() => {
    // Return the second-to-last screen in history (previous screen)
    if (navigationHistory.length >= 2) {
      return navigationHistory[navigationHistory.length - 2];
    }
    // If no previous screen, default to AllSermons
    return "AllSermons";
  }, [navigationHistory]);

  // Optimized goBack - separates sync navigation from async storage
  const goBack = useCallback(async () => {
    try {
      const previousScreen = getPreviousScreen();

      // Update state immediately for responsive UI
      const newHistory = [...navigationHistory];
      if (newHistory.length > 0) {
        newHistory.pop();
      }
      setNavigationHistory(newHistory);

      // Save to storage asynchronously without blocking
      setTimeout(async () => {
        try {
          await AsyncStorage.setItem(
            STORAGE_KEYS.NAVIGATION_HISTORY,
            JSON.stringify(newHistory)
          );
        } catch (storageError) {
          console.error(
            "Failed to update navigation history storage:",
            storageError
          );
        }
      }, 0);

      return previousScreen;
    } catch (error) {
      console.error("Failed to update navigation history on back:", error);
      return "AllSermons";
    }
  }, [navigationHistory, getPreviousScreen]);

  const loadNavigationHistory = useCallback(async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(
        STORAGE_KEYS.NAVIGATION_HISTORY
      );
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setNavigationHistory(parsedHistory);
        return parsedHistory;
      }
      return [];
    } catch (error) {
      console.error("Failed to load navigation history:", error);
      return [];
    }
  }, []);

  const clearNavigationHistory = useCallback(async () => {
    try {
      setNavigationHistory([]);
      await AsyncStorage.removeItem(STORAGE_KEYS.NAVIGATION_HISTORY);
      console.log("Navigation history cleared");
    } catch (error) {
      console.error("Failed to clear navigation history:", error);
    }
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
      // Load settings
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings(parsedSettings);
        setIsDarkMode(parsedSettings.darkMode);
      }

      // Load last read positions
      const storedPositions = await AsyncStorage.getItem(
        STORAGE_KEYS.LAST_POSITIONS
      );
      if (storedPositions) {
        setLastReadPositions(JSON.parse(storedPositions));
      }

      // Load bookmarks
      const bookmarksValue = await AsyncStorage.getItem("bookmarks");
      if (bookmarksValue) {
        setBookmarks(JSON.parse(bookmarksValue));
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

  // Try to load last opened sermon, fallback to random if not found
  useEffect(() => {
    const initializeSelectedSermon = async () => {
      if (sermonsLoaded && textSermons.length > 0 && !selectedSermon) {
        console.log("Initializing sermon selection...");

        // First try to load the last opened sermon
        const lastSermonLoaded = await loadLastOpenedSermon();

        // If no last sermon found or failed to load, select random sermon
        if (!lastSermonLoaded) {
          console.log("No last sermon found, selecting random sermon");
          handleRandomSermons();
        }
      }
    };

    initializeSelectedSermon();
  }, [
    sermonsLoaded,
    textSermons,
    selectedSermon,
    loadLastOpenedSermon,
    handleRandomSermons,
  ]);

  // Load bookmarks from storage on app start
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const savedBookmarks = await AsyncStorage.getItem("bookmarks");
        if (savedBookmarks) {
          setBookmarks(JSON.parse(savedBookmarks));
        }
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      }
    };
    loadBookmarks();
  }, []);

  // Save bookmarks to storage whenever they change
  useEffect(() => {
    const saveBookmarks = async () => {
      try {
        await AsyncStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      } catch (error) {
        console.error("Error saving bookmarks:", error);
      }
    };
    saveBookmarks();
  }, [bookmarks]);

  // Add bookmark with optimistic updates
  const addBookmark = useCallback(
    async (sermon, paragraphIndex, paragraphText) => {
      try {
        const newBookmark = {
          id: `${sermon.id}-${paragraphIndex}-${Date.now()}`,
          sermon,
          paragraphIndex,
          paragraphText,
          date: new Date().toISOString(),
        };

        // Optimistic update - update UI immediately
        const updatedBookmarks = [...bookmarks, newBookmark];
        setBookmarks(updatedBookmarks);

        // Show immediate feedback
        if (Platform.OS === "android") {
          ToastAndroid.show("Bookmark added", ToastAndroid.SHORT);
        }

        // Save to AsyncStorage asynchronously (non-blocking)
        setTimeout(async () => {
          try {
            await AsyncStorage.setItem(
              STORAGE_KEYS.BOOKMARKS,
              JSON.stringify(updatedBookmarks)
            );
          } catch (storageError) {
            console.error("Failed to save bookmark to storage:", storageError);
            // Revert optimistic update if storage fails
            setBookmarks(bookmarks);
            if (Platform.OS === "android") {
              ToastAndroid.show("Failed to save bookmark", ToastAndroid.SHORT);
            }
          }
        }, 0);
      } catch (error) {
        console.error("Failed to add bookmark:", error);
        if (Platform.OS === "android") {
          ToastAndroid.show("Failed to add bookmark", ToastAndroid.SHORT);
        }
      }
    },
    [bookmarks]
  );

  // Remove bookmark with optimistic updates
  const removeBookmark = useCallback(
    async (sermon, paragraphIndex) => {
      try {
        // Find the bookmark to remove by sermon ID and paragraph index
        const bookmarkToRemove = bookmarks.find(
          (b) =>
            b.sermon.id === sermon.id && b.paragraphIndex === paragraphIndex
        );

        if (!bookmarkToRemove) {
          console.warn("Bookmark not found for removal");
          return;
        }

        // Optimistic update - update UI immediately
        const updatedBookmarks = bookmarks.filter(
          (b) => b.id !== bookmarkToRemove.id
        );
        setBookmarks(updatedBookmarks);

        // Show immediate feedback
        if (Platform.OS === "android") {
          ToastAndroid.show("Bookmark removed", ToastAndroid.SHORT);
        }

        // Save to AsyncStorage asynchronously (non-blocking)
        setTimeout(async () => {
          try {
            await AsyncStorage.setItem(
              STORAGE_KEYS.BOOKMARKS,
              JSON.stringify(updatedBookmarks)
            );
          } catch (storageError) {
            console.error(
              "Failed to remove bookmark from storage:",
              storageError
            );
            // Revert optimistic update if storage fails
            setBookmarks(bookmarks);
            if (Platform.OS === "android") {
              ToastAndroid.show(
                "Failed to remove bookmark",
                ToastAndroid.SHORT
              );
            }
          }
        }, 0);
      } catch (error) {
        console.error("Failed to remove bookmark:", error);
        if (Platform.OS === "android") {
          ToastAndroid.show("Failed to remove bookmark", ToastAndroid.SHORT);
        }
      }
    },
    [bookmarks]
  );

  // Load bookmarks from storage
  const loadBookmarks = useCallback(async () => {
    try {
      const storedBookmarks = await AsyncStorage.getItem(
        STORAGE_KEYS.BOOKMARKS
      );
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
    }
  }, []);

  // Optimized highlight management functions for better performance
  const addHighlight = useCallback(
    async (sermonId, paragraphIndex, color) => {
      try {
        const highlightKey = `${sermonId}-${paragraphIndex}`;

        // Early return if color is the same to prevent unnecessary updates
        if (highlights[highlightKey] === color) {
          return;
        }

        const updatedHighlights = {
          ...highlights,
          [highlightKey]: color,
        };

        // Batch state update for better performance
        setHighlights(updatedHighlights);

        // Use immediate storage write without setTimeout for better responsiveness
        AsyncStorage.setItem(
          STORAGE_KEYS.HIGHLIGHTS,
          JSON.stringify(updatedHighlights)
        ).catch((storageError) => {
          console.error("Failed to save highlight to storage:", storageError);
          // Revert only on storage failure
          setHighlights(highlights);
        });
      } catch (error) {
        console.error("Failed to add highlight:", error);
      }
    },
    [highlights]
  );

  const removeHighlight = useCallback(
    async (sermonId, paragraphIndex) => {
      try {
        const highlightKey = `${sermonId}-${paragraphIndex}`;

        // Early return if highlight doesn't exist
        if (!highlights[highlightKey]) {
          return;
        }

        const updatedHighlights = { ...highlights };
        delete updatedHighlights[highlightKey];

        // Batch state update for better performance
        setHighlights(updatedHighlights);

        // Use immediate storage write without setTimeout for better responsiveness
        AsyncStorage.setItem(
          STORAGE_KEYS.HIGHLIGHTS,
          JSON.stringify(updatedHighlights)
        ).catch((storageError) => {
          console.error(
            "Failed to remove highlight from storage:",
            storageError
          );
          // Revert only on storage failure
          setHighlights(highlights);
        });
      } catch (error) {
        console.error("Failed to remove highlight:", error);
      }
    },
    [highlights]
  );

  const getHighlight = useCallback(
    (sermonId, paragraphIndex) => {
      const highlightKey = `${sermonId}-${paragraphIndex}`;
      return highlights[highlightKey] || null;
    },
    [highlights]
  );

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load settings
        const storedSettings = await AsyncStorage.getItem(
          STORAGE_KEYS.SETTINGS
        );
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(parsedSettings);
          setIsDarkMode(parsedSettings.darkMode);
        }

        // Load last positions
        const storedPositions = await AsyncStorage.getItem(
          STORAGE_KEYS.LAST_POSITIONS
        );
        if (storedPositions) {
          setLastReadPositions(JSON.parse(storedPositions));
        }

        // Load bookmarks
        await loadBookmarks();

        // Load highlights
        const storedHighlights = await AsyncStorage.getItem(
          STORAGE_KEYS.HIGHLIGHTS
        );
        if (storedHighlights) {
          setHighlights(JSON.parse(storedHighlights));
        }

        // Load last visited screen
        await getLastVisitedScreen();

        // Load navigation history
        await loadNavigationHistory();

        // Load sermons
        await loadSermons();
      } catch (error) {
        console.error("Error initializing app:", error);
        setError("Failed to initialize app. Please try again later.");
      }
    };

    initializeApp();
  }, [loadSermons, loadBookmarks, getLastVisitedScreen, loadNavigationHistory]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      // Sermon data
      selectedSermon,
      setSelectedSermon: setSelectedSermonWithPosition,
      allSermons,
      textSermons,

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
      loadLastOpenedSermon,
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

      // Bookmarks
      bookmarks,
      addBookmark,
      removeBookmark,

      // Highlights
      highlights,
      addHighlight,
      removeHighlight,
      getHighlight,

      // Last visited screen management
      lastVisitedScreen,
      updateLastVisitedScreen,
      getLastVisitedScreen,

      // Navigation history management
      navigationHistory,
      addToNavigationHistory,
      getPreviousScreen,
      goBack,
      loadNavigationHistory,
      clearNavigationHistory,
    }),
    [
      selectedSermon,
      setSelectedSermonWithPosition,
      allSermons,
      textSermons,
      searchText,
      setSearchText,
      error,
      loading,
      sermonsLoaded,
      theme,
      isDarkMode,
      setIsDarkMode,
      settings,
      setSettings,
      lastReadPositions,
      updateLastReadPosition,
      getLastReadPosition,
      handleRandomSermons,
      loadLastOpenedSermon,
      updateSettings,
      loadSermons,
      numberOfColumns,
      setNumberOfColumns,
      bookmarks,
      addBookmark,
      removeBookmark,
      highlights,
      addHighlight,
      removeHighlight,
      getHighlight,
      lastVisitedScreen,
      updateLastVisitedScreen,
      getLastVisitedScreen,
      navigationHistory,
      addToNavigationHistory,
      getPreviousScreen,
      goBack,
      loadNavigationHistory,
      clearNavigationHistory,
    ]
  );

  return (
    <SermonContext.Provider value={contextValue}>
      {children}
    </SermonContext.Provider>
  );
};

export { SermonContext };
