import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  Platform,
  Text,
  Alert,
  ToastAndroid,
  ImageBackground,
  Animated,
} from "react-native";
import { useAppContext } from "../../Logic/globalState";
import { LinearGradient } from "expo-linear-gradient";

// Component imports
import SearchHeader from "../../components/SearchHeader";
import ActionsBar from "../../components/ActionsBar";
import SermonListView from "../../components/SermonListView";
import YearModal from "../../components/YearModal";
import LetterModal from "../../components/LetterModal";
import { StyleSheet } from "react-native";
import ListAppBar from "../../components/AppBar";
import { useNavigation } from "@react-navigation/native";
import DraggableFloatingButton from "../../components/FloatButton";

const years = Array.from({ length: 10 }, (_, i) => (1973 - i).toString());
const alphabet = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

// Background images for light mode
const lightBackgrounds = [
  require("../../assets/lib2.jpg"),
  require("../../assets/lib2.jpg"),
  // require("../../assets/cloud.png"),
];

// Background images for dark mode
const darkBackgrounds = [
  // require("../../assets/scroll.png"),
  require("../../assets/lib2.jpg"),
  require("../../assets/lib2.jpg"),
];

// Optimized Background Component
const AnimatedBackground = React.memo(({ theme }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // const backgrounds = useMemo(
  //   () => (theme.dark ? darkBackgrounds : lightBackgrounds),
  //   [theme.dark]
  // );

  // const animateBackground = useCallback(() => {
  //   Animated.parallel([
  //     Animated.timing(fadeAnim, {
  //       toValue: 0,
  //       duration: 600, // Reduced duration for snappier feel
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(scaleAnim, {
  //       toValue: 1.03, // Reduced scale for subtlety
  //       duration: 600,
  //       useNativeDriver: true,
  //     }),
  //   ]).start(() => {
  //     setCurrentIndex((prev) => (prev + 1) % backgrounds.length);
  //     scaleAnim.setValue(1);
  //     Animated.timing(fadeAnim, {
  //       toValue: 1,
  //       duration: 600,
  //       useNativeDriver: true,
  //     }).start();
  //   });
  // }, [fadeAnim, scaleAnim, backgrounds.length]);

  // useEffect(() => {
  //   // Clear existing timers
  //   if (timeoutRef.current) clearTimeout(timeoutRef.current);
  //   if (intervalRef.current) clearInterval(intervalRef.current);

  //   // Reset animation state when theme changes
  //   setCurrentIndex(0);
  //   fadeAnim.setValue(1);
  //   scaleAnim.setValue(1);

  //   // Start animation cycle
  //   timeoutRef.current = setTimeout(() => {
  //     animateBackground();
  //     intervalRef.current = setInterval(animateBackground, 60000); // Reduced interval
  //   }, 3000); // Reduced initial delay

  //   return () => {
  //     if (timeoutRef.current) clearTimeout(timeoutRef.current);
  //     if (intervalRef.current) clearInterval(intervalRef.current);
  //   };
  // }, [animateBackground, theme.dark]);

  return (
    <Animated.View
      style={[
        styles.backgroundContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <ImageBackground
        source={require("../../assets/lib2.jpg")} // Placeholder image
        style={styles.backgroundImage}
        blurRadius={4} // Slightly reduced blur for better performance
        resizeMode="repeat"
        fadeDuration={0} // Disable default fade for our custom animation
      >
        <View style={styles.backgroundOverlay} />
      </ImageBackground>
    </Animated.View>
  );
});

const SermonList = React.memo(() => {
  const navigation = useNavigation();
  const { setSelectedSermon, allSermons, theme, updateLastVisitedScreen } =
    useAppContext();

  const [searchText, setSearchText] = useState("");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedLetter, setSelectedLetter] = useState("All Letters");
  const [isYearModalVisible, setIsYearModalVisible] = useState(false);
  const [isLetterModalVisible, setIsLetterModalVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filteredSermons, setFilteredSermons] = useState(allSermons);
  const [originalSermons, setOriginalSermons] = useState(allSermons);
  const [isOriginalOrder, setIsOriginalOrder] = useState(true);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Track that user visited AllSermons screen
  useEffect(() => {
    updateLastVisitedScreen("AllSermons");
  }, [updateLastVisitedScreen]);

  // Store original order when sermons are loaded
  useEffect(() => {
    if (allSermons.length > 0) {
      setOriginalSermons(allSermons);
    }
  }, [allSermons]);

  // Memoized filter function for better performance
  const applyFilters = useCallback(() => {
    const hasFilters =
      searchText ||
      selectedYear !== "All Years" ||
      selectedLetter !== "All Letters";
    setHasActiveFilters(hasFilters);

    const filtered = allSermons.filter((sermon) => {
      const titleLower = sermon.title.toLowerCase();
      const searchLower = searchText.toLowerCase();

      const matchesSearch = !searchText || titleLower.includes(searchLower);
      const matchesYear =
        selectedYear === "All Years" || sermon.year === selectedYear;
      const matchesLetter =
        selectedLetter === "All Letters" ||
        titleLower.startsWith(selectedLetter.toLowerCase());

      return matchesSearch && matchesYear && matchesLetter;
    });

    let sorted;
    if (isOriginalOrder) {
      // Maintain original order by filtering the original array
      sorted = originalSermons.filter((sermon) =>
        filtered.some((f) => f.id === sermon.id)
      );
    } else {
      sorted = [...filtered].sort((a, b) => {
        const comparison = a.title.trim().localeCompare(b.title.trim());
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    setFilteredSermons(sorted);
  }, [
    allSermons,
    searchText,
    selectedYear,
    selectedLetter,
    sortOrder,
    isOriginalOrder,
    originalSermons,
  ]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Memoized filter functions
  const filterOnlyText = useCallback(() => {
    setFilteredSermons((prev) =>
      prev.filter((sermon) => sermon.type === "text")
    );
    setHasActiveFilters(true);
  }, []);

  const filterOnlyAudio = useCallback(() => {
    setFilteredSermons((prev) =>
      prev.filter((sermon) => sermon.type === "mp3")
    );
    setHasActiveFilters(true);
  }, []);

  const handleSermonClick = useCallback(
    async (sermon) => {
      try {
        // Show loading state immediately
        setSelectedSermon(sermon);

        // Navigate immediately to show loading screen
        if (navigation) {
          navigation.navigate("currentsermon");
        } else {
          console.error("Navigation object is undefined");
        }
      } catch (error) {
        console.error("Error in sermon navigation:", error);
        const message = "Error occurred";
        Platform.OS === "android"
          ? ToastAndroid.show(message, ToastAndroid.SHORT)
          : Alert.alert("Error", message);
      }
    },
    [setSelectedSermon, navigation]
  );

  const closeDropdown = useCallback(() => {
    setIsYearModalVisible(false);
    setIsLetterModalVisible(false);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setIsOriginalOrder(false);
  }, []);

  const restoreOriginalOrder = useCallback(() => {
    setIsOriginalOrder(true);
    setSearchText("");
    setSelectedYear("All Years");
    setSelectedLetter("All Letters");
    setHasActiveFilters(false);
  }, []);

  // Memoized components
  const listHeaderComponent = useMemo(
    () => (
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText, { color: theme.colors.text }]}>
          Sermon list contains both audio and transcribed versions. Audio
          versions are indicated with a microphone and are not available within
          the app now.
        </Text>
        <Text style={styles.warningText}>
          Rather, links of the sermons are available. They take you to the
          download page
        </Text>
      </View>
    ),
    [theme.colors.text]
  );

  const gradientColors = useMemo(
    () =>
      theme.dark
        ? [
            "#1c191730",
            "#1c191790",
            "#1c191790",
            "#1c1917",
            "#1c1917",
            "#1c1917",
            "#1c1917",
            "#1c1917",
            "#1c1917",
            "#1c1917",
          ]
        : [
            "rgba(255,255,255,0.33)",
            "rgba(255,255,255,0.3)",
            "rgba(255,255,255,255)",
            "rgba(255,255,255,255)",
            "rgba(255,255,255,255)",
            "rgba(255,255,255,255)",
            "rgba(255,255,255,255)",
          ],
    [theme.dark]
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <AnimatedBackground theme={theme} />

      <DraggableFloatingButton />

      <LinearGradient colors={gradientColors} style={styles.gradientContainer}>
        <ListAppBar theme={theme} />

        <ActionsBar
          theme={theme}
          setIsLetterModalVisible={setIsLetterModalVisible}
          setIsYearModalVisible={setIsYearModalVisible}
          filterOnlyText={filterOnlyText}
          filterOnlyAudio={filterOnlyAudio}
          toggleSortOrder={toggleSortOrder}
          restoreOriginalOrder={restoreOriginalOrder}
          isOriginalOrder={isOriginalOrder}
          hasActiveFilters={hasActiveFilters}
        />

        <SearchHeader
          theme={theme}
          searchText={searchText}
          setSearchText={setSearchText}
        />

        <SermonListView
          theme={theme}
          filteredSermons={filteredSermons}
          handleSermonClick={handleSermonClick}
          listHeaderComponent={listHeaderComponent}
          setSearchText={setSearchText}
          allSermons={allSermons}
          setFilteredSermons={setFilteredSermons}
        />
        <YearModal
          theme={theme}
          isVisible={isYearModalVisible}
          closeDropdown={closeDropdown}
          years={years}
          setSelectedYear={setSelectedYear}
        />

        <LetterModal
          theme={theme}
          isVisible={isLetterModalVisible}
          closeDropdown={closeDropdown}
          alphabet={alphabet}
          setSelectedLetter={setSelectedLetter}
        />
      </LinearGradient>
    </View>
  );
});

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // zIndex: -1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  gradientContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 40,
  },
  headerContainer: {
    paddingVertical: 10,
  },
  headerText: {
    fontStyle: "italic",
    fontWeight: "100",
    fontSize: 10,
  },
  warningText: {
    color: "red",
    fontStyle: "italic",
    fontWeight: "100",
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 10,
  },
});

export default SermonList;
