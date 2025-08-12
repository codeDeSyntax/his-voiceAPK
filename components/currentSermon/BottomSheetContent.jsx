import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { styles } from "../../styles/currentsermon";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";

const TopCardContent = ({
  theme,
  selectedSermon,
  searchPhrase,
  setSearchPhrase,
  searchResults,
  setSearchResults,
  searching,
  setSearching,
  currentResultIndex,
  setCurrentResultIndex,
  onScrollToTop,
  onScrollToBottom,
  onNavigateToResult,
  onBack,
  searchSermon,
  paragraphs,
  paragraphLayouts,
  scrollToParagraph,
  isCardOpen,
}) => {
  const scrollViewRef = useRef(null);
  const router = useNavigation();
  // add ZillaSlab font family to the search input
  const [fontsLoaded] = useFonts({
    ZillaSlab: require("../../assets/fonts/ZillaSlab-Regular.ttf"),
    ZillaSlabsm: require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
  });

  const submitSearch = useCallback(() => {
    if (searchPhrase.trim()) {
      // Set searching to true before starting the search
      setSearching(true);

      // Simulate a more realistic search delay (remove for production if search is actually slow)
      setTimeout(() => {
        const results = searchSermon(paragraphs, searchPhrase);
        setSearchResults(results);
        setCurrentResultIndex(0);

        // Note: Scroll handling is now managed by CurrentSermon component to avoid conflicts
        // The main component will handle scrolling based on priority system

        // Clear the search input after successful search
        setSearchPhrase("");

        // Set searching to false once search is complete
        setSearching(false);
      }, 100); // 500ms delay to show loading indicator
    } else {
      setSearchResults([]);
    }
  }, [
    searchPhrase,
    searchSermon,
    paragraphs,
    setSearchResults,
    setCurrentResultIndex,
    paragraphLayouts,
    scrollToParagraph,
    setSearching,
    setSearchPhrase, // Add this dependency
  ]);

  const clearSearch = useCallback(() => {
    setSearchPhrase("");
    setSearchResults([]);
    setCurrentResultIndex(0);
  }, [setSearchPhrase, setSearchResults, setCurrentResultIndex]);

  // Receipt-style separator component
  const ReceiptSeparator = () => (
    <View style={styles.receiptSeparator}>
      <Text style={[styles.receiptDots, { color: theme.colors.text }]}>
        • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
      </Text>
    </View>
  );

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const { date: currentDate, time: currentTime } = getCurrentDateTime();

  return (
    <View
      style={[
        styles.topCardContainer,
        {
          borderColor: theme.dark ? "" : "red",
          display: !isCardOpen && "none",
        },
      ]}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.topCardScrollContent}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Receipt Header */}
        <View style={styles.receiptHeader}>
          <Image
            source={require("../../assets/roundedLam.jpg")}
            style={{ height: 40, width: 40 }}
          />
          <Text
            style={[
              styles.receiptTitle,
              { color: theme.colors.text, fontFamily: "ZillaSlabsm" },
            ]}
          >
            Search paragraph or phrase
          </Text>

          <Text style={[styles.receiptDateTime, { color: theme.colors.text }]}>
            {currentDate} {currentTime}
          </Text>
        </View>

        <ReceiptSeparator />

        {/* Sermon Information Section */}
        <View style={styles.receiptSection}>
          <Text
            style={[
              styles.receiptSectionHeader,
              { color: theme.colors.text, fontFamily: "ZillaSlabsm" },
            ]}
          >
            CURRENT SERMON
          </Text>

          <View style={styles.receiptItem}>
            <Text
              style={[
                styles.receiptLabel,
                { color: "#5d3211", fontFamily: "ZillaSlab" },
              ]}
            >
              <MaterialIcons name="book-online" size={16} />
            </Text>
            <Text
              style={[
                styles.receiptValue,
                {
                  color: theme.dark ? "white" : "#5d3211",
                  fontFamily: "ZillaSlab",
                },
              ]}
              numberOfLines={3}
            >
              {selectedSermon?.title || "N/A"}
            </Text>
          </View>

          {selectedSermon?.date && (
            <View style={styles.receiptItem}>
              <Text
                style={[
                  styles.receiptLabel,
                  { color: theme.colors.text, fontFamily: "ZillaSlab" },
                ]}
              >
                <MaterialIcons name="date-range" size={16} />
              </Text>
              <Text
                style={[
                  styles.receiptValue,
                  { color: theme.colors.text, fontFamily: "ZillaSlab" },
                ]}
              >
                {selectedSermon.date}
              </Text>
            </View>
          )}

          {selectedSermon?.location && (
            <View style={styles.receiptItem}>
              <Text
                style={[
                  styles.receiptLabel,
                  { color: theme.colors.text, fontFamily: "ZillaSlab" },
                ]}
              >
                <MaterialIcons name="location-on" size={16} />
              </Text>
              <Text style={[styles.receiptValue, { color: theme.colors.text }]}>
                {selectedSermon.location}
              </Text>
            </View>
          )}
        </View>

        <ReceiptSeparator />

        {/* Search Section */}
        <View style={styles.receiptSection}>
          <Text
            style={[
              styles.receiptSectionHeader,
              { color: theme.colors.text, fontFamily: "ZillaSlabsm" },
            ]}
          >
            TEXT SEARCH
          </Text>

          <View style={styles.searchInputContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  color: theme.colors.text,
                  borderColor: theme.dark ? theme.colors.primary : "#bbb8b8",
                  fontFamily: "ZillaSlab",
                },
              ]}
              placeholder="Search paragraph or phrase..."
              placeholderTextColor={
                theme.dark ? theme.colors.text + "50" : "#5d321190"
              }
              value={searchPhrase}
              onChangeText={setSearchPhrase}
              returnKeyType="search"
            />
            {searching ? (
              <ActivityIndicator
                style={styles.searchLoader}
                color={theme.dark ? theme.colors.hlight : "#5d3211"}
                size="small"
              />
            ) : searchPhrase ? (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.searchLoader}
              >
                <Feather
                  name="x"
                  size={24}
                  color={theme.dark ? theme.colors.text : "#5d3211"}
                />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={submitSearch}
              style={[
                styles.searchButton,
                {
                  backgroundColor: theme.dark
                    ? theme.colors.primary
                    : "#5d3211",
                  borderColor: theme.dark ? theme.colors.primary : "#5d3211",
                },
              ]}
            >
              <Text
                style={[
                  styles.searchButtonText,
                  {
                    color: theme.dark ? theme.colors.text : "#fff",
                  },
                ]}
              >
                GO
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Results Section */}
          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <Text
                style={[
                  styles.receiptSectionHeader,
                  { color: theme.colors.text },
                ]}
              >
                {`${searchResults.length} ${
                  searchResults.length === 1 ? "MATCH" : "MATCHES"
                } FOUND`}
              </Text>

              <View style={styles.searchNavigationContainer}>
                <TouchableOpacity
                  onPress={() =>
                    onNavigateToResult(
                      currentResultIndex > 0
                        ? currentResultIndex - 1
                        : searchResults.length - 1
                    )
                  }
                  style={styles.searchNavigationButton}
                >
                  <MaterialIcons
                    name="keyboard-arrow-up"
                    size={24}
                    color={theme.dark ? theme.colors.text : "#5d3211"}
                  />
                </TouchableOpacity>

                <Text
                  style={[
                    styles.searchResultsText,
                    { color: theme.colors.text },
                  ]}
                >
                  {`${currentResultIndex + 1} of ${searchResults.length}`}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    onNavigateToResult(
                      currentResultIndex < searchResults.length - 1
                        ? currentResultIndex + 1
                        : 0
                    )
                  }
                  style={styles.searchNavigationButton}
                >
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={24}
                    color={theme.dark ? theme.colors.text : "#5d3211"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <ReceiptSeparator />

        {/* Actions Section */}
        <View style={styles.receiptSection}>
          <Text
            style={[
              styles.receiptSectionHeader,
              { color: theme.colors.text, fontFamily: "ZillaSlabsm" },
            ]}
          >
            QUICK ACTIONS
          </Text>

          <View style={styles.receiptActionsGrid}>
            <TouchableOpacity
              style={[
                styles.receiptActionButton,
                {
                  borderColor: theme.colors.text,
                  backgroundColor: theme.dark
                    ? theme.colors.primary + "90"
                    : "#f5f5f5",
                },
              ]}
              onPress={onScrollToTop}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.receiptActionCode, { color: theme.colors.text }]}
              >
                01
              </Text>
              <Text
                style={[styles.receiptActionText, { color: theme.colors.text }]}
              >
                SCROLL TOP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.receiptActionButton,
                {
                  borderColor: theme.colors.text,
                  backgroundColor: theme.dark
                    ? theme.colors.primary + "90"
                    : "#f5f5f5",
                },
              ]}
              onPress={onScrollToBottom}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.receiptActionCode, { color: theme.colors.text }]}
              >
                02
              </Text>
              <Text
                style={[styles.receiptActionText, { color: theme.colors.text }]}
              >
                SCROLL END
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.receiptActionButton,
                {
                  borderColor: theme.colors.text,
                  backgroundColor: theme.dark
                    ? theme.colors.primary + "90"
                    : "#f5f5f5",
                },
              ]}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.receiptActionCode, { color: theme.colors.text }]}
              >
                03
              </Text>
              <Text
                style={[styles.receiptActionText, { color: theme.colors.text }]}
              >
                SERMON LIST
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.receiptActionButton,
                {
                  borderColor: theme.colors.text,
                  backgroundColor: theme.dark
                    ? theme.colors.primary + "90"
                    : "#f5f5f5",
                },
              ]}
              onPress={() => router.push("Settings")}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.receiptActionCode, { color: theme.colors.text }]}
              >
                04
              </Text>
              <Text
                style={[styles.receiptActionText, { color: theme.colors.text }]}
              >
                SETTINGS
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ReceiptSeparator />

        {/* Receipt Footer */}
        <View style={styles.receiptFooter}>
          <Text
            style={[styles.receiptFooterText, { color: theme.colors.text }]}
          >
            THANK YOU FOR USING
          </Text>
          <Text
            style={[styles.receiptFooterText, { color: theme.colors.text }]}
          >
            SERMON SEARCH SYSTEM
          </Text>
          <Text
            style={[styles.receiptFooterSmall, { color: theme.colors.text }]}
          >
            ═══════════════════════
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default TopCardContent;
