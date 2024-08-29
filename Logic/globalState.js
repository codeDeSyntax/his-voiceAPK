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
  const [settings, setSettings] = useState({
    backgroundColor: "#2d2d2d",
    fontSize: 12,
    fontFamily: "monospace",
    textColor: "#fafafa",
  });

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

  // load recently opened sermons from local storage
  useEffect(() => {
    const loadRecents = async () => {
      try {
        const value = await AsyncStorage.getItem("recentlyOpenedSermons");
        if (value !== null) {
          setRecentlyOpened(JSON.parse(value));
          // console.log(recentlyOpened.length);
        }
      } catch (e) {
        console.log(e);
        
      }
    }

    loadRecents();
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const oldSettings = await AsyncStorage.getItem("sermonSettings");
        // console.log("Loaded settings from storage:", oldSettings);
        if (oldSettings) {
          setSettings(JSON.parse(oldSettings));
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
      }}
    >
      {children}
    </SermonContext.Provider>
  );
};

export { SermonContext, SermonProvider };
