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
import {
  getAllSermonsMetadata,
  getSermonById,
  getSermonsByType,
  initializeDatabase,
} from "../database/sermonDB";
import { databaseExists } from "../database/downloadDatabase";
import { ensureReadingFontLoaded } from "../Utils/fontLoader";

// Storage keys in constants to avoid typos
const STORAGE_KEYS = {
  SETTINGS: "sermonSettings",
  LAST_POSITIONS: "sermonLastPositions",
  BOOKMARKS: "sermonBookmarks",
  HIGHLIGHTS: "sermonHighlights",
  LAST_SERMON: "lastOpenedSermon", // Store reference to last opened sermon
  RECENTS: "recentSermons",
};

const INITIAL_SETTINGS = {
  darkMode: false,
  backgroundColor: "#faeed1",
  fontSize: 22,
  fontFamily: "ZillaSlab",
  textColor: "#5d3211", // Deep brown for light mode on beige background
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
  const [searchPhrase, setSearchPhrase] = useState(""); // Search query
  const [searchResults, setSearchResults] = useState([]); // Filtered sermons from search
  const [expandedSearchResults, setExpandedSearchResults] = useState(new Set()); // Track which results are expanded
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  // isDarkMode is derived from settings — no separate state needed.
  // Keeping setIsDarkMode as a thin wrapper preserves the public context API.
  const isDarkMode = settings.darkMode;
  const [sermonsLoaded, setSermonsLoaded] = useState(false);
  const [numberOfColumns, setNumberOfColumns] = useState(2);
  const [lastReadPositions, setLastReadPositions] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [highlights, setHighlights] = useState({}); // Store paragraph highlights
  const [recentSermons, setRecentSermons] = useState([]);
  const [readingFontsRevision, setReadingFontsRevision] = useState(0);

  // Theme derived from settings.darkMode — updates whenever dark mode changes
  const theme = useMemo(
    () => ({
      dark: settings.darkMode,
      colors: {
        primary: settings.darkMode ? "#2c2420" : "#faeed1",
        background: settings.darkMode ? "#221b17" : "#faeed1",
        secondary: settings.darkMode ? "#1a1410" : "#f5e6d3",
        text: settings.darkMode ? "#ffffff" : "#5d3211",
        hlight: "#d57a3e",
        blueText: "",
      },
    }),
    [settings.darkMode],
  );

  // Clean up last read positions older than 30 days
  const cleanExpiredPositions = useCallback((positions) => {
    const now = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const cleanedPositions = {};

    Object.entries(positions).forEach(([sermonId, data]) => {
      // Handle both old format (just paragraph number) and new format (object with timestamp)
      if (typeof data === "number") {
        // Old format - keep it and add current timestamp
        cleanedPositions[sermonId] = {
          paragraph: data,
          timestamp: now,
        };
      } else if (data && typeof data === "object" && data.timestamp) {
        // New format - check if expired
        if (now - data.timestamp < thirtyDaysInMs) {
          cleanedPositions[sermonId] = data;
        } else {
          console.log(
            `Removing expired last read position for sermon ${sermonId}`,
          );
        }
      }
    });

    return cleanedPositions;
  }, []);

  // Update last read position for a sermon
  const updateLastReadPosition = useCallback(
    async (sermonId, paragraphIndex) => {
      try {
        let updatedPositions = null;
        let didChange = false;

        setLastReadPositions((prevPositions) => {
          if (!sermonId || paragraphIndex < 0) {
            updatedPositions = prevPositions;
            return prevPositions;
          }

          const existing = prevPositions[sermonId];
          const existingParagraph =
            typeof existing === "number"
              ? existing
              : (existing?.paragraph ?? 0);

          // Guard against accidental resets when cleanup runs before a list has
          // fully positioned and still reports paragraph 0.
          if (paragraphIndex === 0 && existingParagraph > 0) {
            updatedPositions = prevPositions;
            return prevPositions;
          }

          const nextPositions = {
            ...prevPositions,
            [sermonId]: {
              paragraph: paragraphIndex,
              timestamp: Date.now(),
            },
          };

          updatedPositions = nextPositions;
          didChange = true;
          return nextPositions;
        });

        if (didChange && updatedPositions) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.LAST_POSITIONS,
            JSON.stringify(updatedPositions),
          );
        }
      } catch (error) {
        console.error("Failed to update last read position:", error);
      }
    },
    [],
  );

  // Get last read position for a sermon
  const getLastReadPosition = useCallback(
    (sermonId) => {
      const position = lastReadPositions[sermonId];

      // Handle both old format (number) and new format (object)
      if (typeof position === "number") {
        return position;
      } else if (
        position &&
        typeof position === "object" &&
        position.paragraph !== undefined
      ) {
        return position.paragraph;
      }

      return 0;
    },
    [lastReadPositions],
  );

  // Load last opened sermon
  const loadLastOpenedSermon = useCallback(async () => {
    try {
      const storedLastSermon = await AsyncStorage.getItem(
        STORAGE_KEYS.LAST_SERMON,
      );
      if (storedLastSermon && textSermons.length > 0) {
        const lastSermonRef = JSON.parse(storedLastSermon);

        // Find the full sermon object from our loaded sermons
        const fullSermon = textSermons.find(
          (sermon) => sermon.id === lastSermonRef.id,
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

  // Track recently opened sermons (max 20, deduped, newest first)
  const MAX_RECENTS = 20;
  const addToRecents = useCallback(async (sermon) => {
    try {
      const entry = {
        id: sermon.id,
        title: sermon.title,
        date: sermon.date,
        type: sermon.type,
        location: sermon.location,
        openedAt: Date.now(),
      };
      let updated;
      setRecentSermons((prev) => {
        const filtered = prev.filter((r) => r.id !== sermon.id);
        updated = [entry, ...filtered].slice(0, MAX_RECENTS);
        return updated;
      });
      if (updated) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.RECENTS,
          JSON.stringify(updated),
        );
      }
    } catch (error) {
      console.error("Failed to update recent sermons:", error);
    }
  }, []);

  // Enhanced setSelectedSermon to include last read position and lazy load full content
  const setSelectedSermonWithPosition = useCallback(
    async (sermon) => {
      if (sermon) {
        try {
          // If sermon doesn't have full content (sermon field), load it from database
          let fullSermon = sermon;

          if (!sermon.sermon) {
            const sermonFromDB = await getSermonById(sermon.id);

            if (sermonFromDB) {
              fullSermon = sermonFromDB;
            } else {
              console.error("Failed to load sermon content from database");
            }
          }

          const sermonWithPosition = {
            ...fullSermon,
            lastReadParagraph: getLastReadPosition(fullSermon.id),
          };
          setSelectedSermon(sermonWithPosition);

          // Track in recents
          addToRecents(fullSermon);

          // Save as last opened sermon (store only essential data)
          try {
            const sermonReference = {
              id: fullSermon.id,
              title: fullSermon.title,
              date: fullSermon.date,
              type: fullSermon.type,
            };
            await AsyncStorage.setItem(
              STORAGE_KEYS.LAST_SERMON,
              JSON.stringify(sermonReference),
            );
          } catch (error) {
            console.error("Failed to save last opened sermon:", error);
          }
        } catch (error) {
          console.error("Error in setSelectedSermonWithPosition:", error);
          // Fallback: set sermon without full content
          setSelectedSermon(sermon);
        }
      } else {
        setSelectedSermon(null);
      }
    },
    [getLastReadPosition, addToRecents],
  );

  // Load sermons from SQLite database
  const loadSermons = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if local database file exists before executing SQLite operations
      const hasDatabase = await databaseExists();
      if (!hasDatabase) {
        if (__DEV__) {
          console.log(
            "📥 Database not downloaded yet. Waiting for user download.",
          );
        }
        setAllSermons([]);
        setTextSermons([]);
        setSermonsLoaded(false);
        setLoading(false);
        return false;
      }

      if (__DEV__) console.log("Initializing database...");
      await initializeDatabase();

      // Load sermons metadata from database (fast - no full text)
      if (__DEV__) console.log("Loading sermons from database...");
      const fetchedSermons = await getAllSermonsMetadata();
      if (__DEV__) {
        console.log(`✅ Loaded ${fetchedSermons.length} sermons from database`);
      }

      // Set all sermons
      setAllSermons(fetchedSermons);

      // Filter text sermons
      const filteredTextSermons = fetchedSermons.filter(
        (sermon) => sermon.type === "text",
      );
      setTextSermons(filteredTextSermons);

      setSermonsLoaded(true);
      setLoading(false);

      return true;
    } catch (err) {
      console.error("❌ Error loading sermons:", err);
      setError("Failed to load sermons. Please try again later.");
      setLoading(false);
      setSermonsLoaded(false);
      return false;
    }
  }, []);

  // Update settings
  // Uses functional setSettings so this callback never needs to capture the
  // current `settings` value — keeping it stable (empty deps) and breaking
  // the cascade that caused infinite re-renders in auto-save effects.
  const updateSettings = useCallback(async (newSettings) => {
    try {
      if (newSettings.fontFamily) {
        const loaded = await ensureReadingFontLoaded(newSettings.fontFamily);
        if (loaded) {
          setReadingFontsRevision((revision) => revision + 1);
        }
      }

      let merged;
      setSettings((prev) => {
        merged = { ...prev, ...newSettings };
        return merged;
      });
      // merged is assigned synchronously by React before the await
      if (merged) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.SETTINGS,
          JSON.stringify(merged),
        );
      }
      return true;
    } catch (error) {
      console.error("Failed to update settings:", error);
      return false;
    }
  }, []);

  // Load all persisted data from storage — single source of truth on startup.
  const loadStoredData = useCallback(async () => {
    try {
      // Load settings
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        if (parsedSettings.fontFamily) {
          const loaded = await ensureReadingFontLoaded(
            parsedSettings.fontFamily,
          );
          if (loaded) {
            setReadingFontsRevision((revision) => revision + 1);
          }
        }
        setSettings(parsedSettings);
      }

      // Load last read positions and clean expired ones
      const storedPositions = await AsyncStorage.getItem(
        STORAGE_KEYS.LAST_POSITIONS,
      );
      if (storedPositions) {
        const parsedPositions = JSON.parse(storedPositions);
        const cleanedPositions = cleanExpiredPositions(parsedPositions);
        setLastReadPositions(cleanedPositions);

        // If any positions were cleaned, save the updated data
        if (
          Object.keys(cleanedPositions).length !==
          Object.keys(parsedPositions).length
        ) {
          console.log(
            `Cleaned ${Object.keys(parsedPositions).length - Object.keys(cleanedPositions).length} expired last read positions`,
          );
          await AsyncStorage.setItem(
            STORAGE_KEYS.LAST_POSITIONS,
            JSON.stringify(cleanedPositions),
          );
        }
      }

      // Load bookmarks — prefer the canonical key; fall back to the legacy
      // "bookmarks" key for users upgrading from an older version.
      let bookmarksRaw = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (!bookmarksRaw) {
        bookmarksRaw = await AsyncStorage.getItem("bookmarks");
      }
      if (bookmarksRaw) {
        setBookmarks(JSON.parse(bookmarksRaw));
      }

      // Load highlights
      const storedHighlights = await AsyncStorage.getItem(
        STORAGE_KEYS.HIGHLIGHTS,
      );
      if (storedHighlights) {
        setHighlights(JSON.parse(storedHighlights));
      }

      // Load recent sermons
      const storedRecents = await AsyncStorage.getItem(STORAGE_KEYS.RECENTS);
      if (storedRecents) {
        setRecentSermons(JSON.parse(storedRecents));
      }
    } catch (error) {
      console.error("Failed to load stored data:", error);
    }
  }, [cleanExpiredPositions]);

  useEffect(() => {
    let isActive = true;

    const syncReadingFont = async () => {
      const loaded = await ensureReadingFontLoaded(settings.fontFamily);
      if (isActive && loaded) {
        setReadingFontsRevision((revision) => revision + 1);
      }
    };

    syncReadingFont();

    return () => {
      isActive = false;
    };
  }, [settings.fontFamily]);

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      await loadStoredData();
      await loadSermons();
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

  // Bookmarks are loaded once in loadStoredData (called from the main
  // initializeApp effect above). addBookmark / removeBookmark handle all
  // subsequent persistence, so no additional effects are needed here.

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
              JSON.stringify(updatedBookmarks),
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
    [bookmarks],
  );

  // Remove bookmark with optimistic updates
  const removeBookmark = useCallback(
    async (sermon, paragraphIndex) => {
      try {
        // Find the bookmark to remove by sermon ID and paragraph index
        const bookmarkToRemove = bookmarks.find(
          (b) =>
            b.sermon.id === sermon.id && b.paragraphIndex === paragraphIndex,
        );

        if (!bookmarkToRemove) {
          console.warn("Bookmark not found for removal");
          return;
        }

        // Optimistic update - update UI immediately
        const updatedBookmarks = bookmarks.filter(
          (b) => b.id !== bookmarkToRemove.id,
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
              JSON.stringify(updatedBookmarks),
            );
          } catch (storageError) {
            console.error(
              "Failed to remove bookmark from storage:",
              storageError,
            );
            // Revert optimistic update if storage fails
            setBookmarks(bookmarks);
            if (Platform.OS === "android") {
              ToastAndroid.show(
                "Failed to remove bookmark",
                ToastAndroid.SHORT,
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
    [bookmarks],
  );

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
          JSON.stringify(updatedHighlights),
        ).catch((storageError) => {
          console.error("Failed to save highlight to storage:", storageError);
          // Revert only on storage failure
          setHighlights(highlights);
        });
      } catch (error) {
        console.error("Failed to add highlight:", error);
      }
    },
    [highlights],
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
          JSON.stringify(updatedHighlights),
        ).catch((storageError) => {
          console.error(
            "Failed to remove highlight from storage:",
            storageError,
          );
          // Revert only on storage failure
          setHighlights(highlights);
        });
      } catch (error) {
        console.error("Failed to remove highlight:", error);
      }
    },
    [highlights],
  );

  const getHighlight = useCallback(
    (sermonId, paragraphIndex) => {
      const highlightKey = `${sermonId}-${paragraphIndex}`;
      return highlights[highlightKey] || null;
    },
    [highlights],
  );

  // All startup data loading (settings, positions, bookmarks, highlights) is
  // handled by loadStoredData() called in the main initializeApp effect above.
  // This duplicate effect has been removed.

  // Thin wrapper so existing consumers of setIsDarkMode from context continue
  // to work — internally it goes through updateSettings to keep state consistent.
  const setIsDarkMode = useCallback(
    (value) => {
      updateSettings({ darkMode: value });
    },
    [updateSettings],
  );

  // Lifted out of the useMemo factory so they are stable useCallback references
  // with correct deps, rather than inline arrow functions that recreate on every
  // useMemo recomputation.
  const filterSermonsByTag = useCallback(
    (tag) =>
      allSermons.filter((sermon) => sermon.tags && sermon.tags.includes(tag)),
    [allSermons],
  );

  const findSermonInState = useCallback(
    (id) => allSermons.find((sermon) => sermon.id === id),
    [allSermons],
  );

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
      searchPhrase,
      setSearchPhrase,
      searchResults,
      setSearchResults,
      expandedSearchResults,
      setExpandedSearchResults,
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

      // Helper functions — stable useCallback references defined above
      filterSermonsByTag,
      findSermonInState,

      // Bookmarks
      bookmarks,
      addBookmark,
      removeBookmark,

      // Highlights
      highlights,
      addHighlight,
      removeHighlight,
      getHighlight,

      // Recents
      recentSermons,

      // Bumps when optional reading fonts finish loading
      readingFontsRevision,
    }),
    [
      selectedSermon,
      setSelectedSermonWithPosition,
      allSermons,
      textSermons,
      searchText,
      setSearchText,
      searchPhrase,
      setSearchPhrase,
      searchResults,
      setSearchResults,
      expandedSearchResults,
      setExpandedSearchResults,
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
      filterSermonsByTag,
      findSermonInState,
      recentSermons,
      readingFontsRevision,
    ],
  );

  return (
    <SermonContext.Provider value={contextValue}>
      {children}
    </SermonContext.Provider>
  );
};

export { SermonContext };
