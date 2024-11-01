import React, { createContext, useState, useEffect } from "react";
import earlySermons from "../sermons/1964-1969/firstset";
import secondSet from "../sermons/1970/1970";
import thirdSet from "../sermons/1971/1971";
import fourthSet from "../sermons/1972/1972";
import lastSet from "../sermons/1973/1973";
import audioSermons from "../sermons/audio";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SermonContext = createContext();

const sermonCollection = [
  ...earlySermons,
  ...secondSet,
  ...thirdSet,
  ...fourthSet,
  ...lastSet,
];

const SermonProvider = ({ children }) => {
  const [selectedSermon, setSelectedSermon] = useState("");
  const [allSermons, setAllSermons] = useState([]);
  const [recentlyOpened, setRecentlyOpened] = useState([]);
  const [searchTerm, setSearchTerm] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize dark mode state and settings
  const [isDarkMode, setIsDarkMode] = useState(false); // Set default value
  const [settings, setSettings] = useState({
    darkMode: isDarkMode,
    backgroundColor: "#fafafa",
    fontSize: 12,
    fontFamily: "serif",
    textColor: "#fafafa",
  });

  // Define theme based on isDarkMode
  const theme = {
    dark: isDarkMode,
    colors: {
      primary: isDarkMode ? '#151718' : '#fafafa',
      background: isDarkMode ? '#0c0d0e' : '#fafafa',
      secondary: isDarkMode ? '#202425' : '#fafafa',
      text: isDarkMode ? '#e5e5e5' : '#031412',
      ltext: isDarkMode ? '#494d50' : '#031412',
    },
  };

  // Randomly selects a sermon from the collection
  const handleRandomSermons = () => {
    let sermonIndex = Math.floor(Math.random() * sermonCollection.length);
    setSelectedSermon(sermonCollection[sermonIndex]);
  };

  useEffect(() => {
    handleRandomSermons();
    try {
      const fetchedSermons = [
        ...earlySermons,
        ...secondSet,
        ...thirdSet,
        ...fourthSet,
        ...lastSet,
        ...audioSermons,
      ];
      setAllSermons(fetchedSermons);
      setLoading(false);
    } catch (err) {
      setError("Failed to load sermons");
      setLoading(false);
    }
  }, []);

  // Load recently opened sermons from local storage
  useEffect(() => {
    const loadRecents = async () => {
      try {
        const value = await AsyncStorage.getItem("recentlyOpenedSermons");
        if (value !== null) {
          setRecentlyOpened(JSON.parse(value));
        }
      } catch (e) {
        console.log(e);
      }
    };

    loadRecents();
  }, []);

  // Load settings from AsyncStorage and update dark mode
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const oldSettings = await AsyncStorage.getItem("sermonSettings");
        console.log("Loaded settings from storage:", oldSettings);
        if (oldSettings) {
          const parsedSettings = JSON.parse(oldSettings);
          setSettings(parsedSettings);
          setIsDarkMode(parsedSettings.darkMode);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, []);

  return (
    <SermonContext.Provider
      value={{
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
      }}
    >
      {children}
    </SermonContext.Provider>
  );
};

export { SermonContext, SermonProvider };
