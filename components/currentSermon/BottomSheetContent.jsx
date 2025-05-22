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

  const submitSearch = useCallback(() => {
    if (searchPhrase.trim()) {
      const results = searchSermon(paragraphs, searchPhrase);
      setSearchResults(results);
      setCurrentResultIndex(0);

      if (results.length > 0 && paragraphLayouts[results[0]]) {
        scrollToParagraph(results[0]);
      }
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
              { color: theme.colors.text, fontFamily: "ZillaSlab" },
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
            style={[styles.receiptSectionHeader, { color: theme.colors.text }]}
          >
            CURRENT SERMON
          </Text>

          <View style={styles.receiptItem}>
            <Text style={[styles.receiptLabel, { color: theme.colors.text }]}>
              TITLE:
            </Text>
            <Text
              style={[styles.receiptValue, { color: theme.colors.text }]}
              numberOfLines={3}
            >
              {selectedSermon?.title || "N/A"}
            </Text>
          </View>

          {selectedSermon?.date && (
            <View style={styles.receiptItem}>
              <Text style={[styles.receiptLabel, { color: theme.colors.text }]}>
                DATE:
              </Text>
              <Text style={[styles.receiptValue, { color: theme.colors.text }]}>
                {selectedSermon.date}
              </Text>
            </View>
          )}

          {selectedSermon?.location && (
            <View style={styles.receiptItem}>
              <Text style={[styles.receiptLabel, { color: theme.colors.text }]}>
                LOCATION:
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
            style={[styles.receiptSectionHeader, { color: theme.colors.text }]}
          >
            TEXT SEARCH
          </Text>

          <View style={styles.receiptSearchRow}>
            <View
              style={[
                styles.receiptSearchContainer,
                { borderColor: theme.colors.text },
              ]}
            >
              <TextInput
                style={[
                  styles.receiptSearchInput,
                  { color: theme.colors.text },
                ]}
                placeholder="Enter search term..."
                placeholderTextColor="#666"
                value={searchPhrase}
                onChangeText={setSearchPhrase}
                returnKeyType="search"
                onSubmitEditing={submitSearch}
              />
              {searchPhrase ? (
                <TouchableOpacity
                  onPress={clearSearch}
                  style={styles.receiptClearButton}
                >
                  <Text
                    style={[
                      styles.receiptClearText,
                      { color: theme.colors.text },
                    ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={submitSearch}
              style={[
                styles.receiptSearchButton,
                {
                  borderColor: theme.colors.text,
                  backgroundColor: searchPhrase.trim()
                    ? theme.colors.text
                    : "transparent",
                },
              ]}
              disabled={!searchPhrase.trim()}
            >
              <Text
                style={[
                  styles.receiptSearchButtonText,
                  {
                    color: searchPhrase.trim()
                      ? theme.colors.background || "#fff"
                      : theme.colors.text,
                  },
                ]}
              >
                GO
              </Text>
            </TouchableOpacity>
          </View>

          {searching && (
            <View style={styles.receiptLoadingContainer}>
              <Text
                style={[
                  styles.receiptLoadingText,
                  { color: theme.colors.text },
                ]}
              >
                SEARCHING...
              </Text>
              <ActivityIndicator size="small" color={theme.colors.text} />
            </View>
          )}

          {searchPhrase && searchResults.length > 0 ? (
            <View style={styles.receiptResults}>
              <View style={styles.receiptResultsHeader}>
                <Text
                  style={[
                    styles.receiptResultsCount,
                    { color: theme.colors.text },
                  ]}
                >
                  MATCHES FOUND: {searchResults.length}
                </Text>
                <Text
                  style={[
                    styles.receiptResultsPosition,
                    { color: theme.colors.text },
                  ]}
                >
                  {currentResultIndex + 1}/{searchResults.length}
                </Text>
              </View>

              <View style={styles.receiptNavRow}>
                <TouchableOpacity
                  style={[
                    styles.receiptNavButton,
                    {
                      borderColor: theme.colors.text,
                      backgroundColor:
                        currentResultIndex === 0
                          ? "transparent"
                          : theme.colors.text,
                      opacity: currentResultIndex === 0 ? 0.3 : 1,
                    },
                  ]}
                  onPress={() => {
                    const newIndex = Math.max(0, currentResultIndex - 1);
                    setCurrentResultIndex(newIndex);
                    onNavigateToResult(searchResults[newIndex]);
                  }}
                  disabled={currentResultIndex === 0}
                >
                  <Text
                    style={[
                      styles.receiptNavButtonText,
                      {
                        color:
                          currentResultIndex === 0
                            ? theme.colors.text
                            : theme.colors.background || "#fff",
                      },
                    ]}
                  >
                    PREV
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.receiptNavButton,
                    {
                      borderColor: theme.colors.text,
                      backgroundColor:
                        currentResultIndex === searchResults.length - 1
                          ? "transparent"
                          : theme.colors.text,
                      opacity:
                        currentResultIndex === searchResults.length - 1
                          ? 0.3
                          : 1,
                    },
                  ]}
                  onPress={() => {
                    const newIndex = Math.min(
                      searchResults.length - 1,
                      currentResultIndex + 1
                    );
                    setCurrentResultIndex(newIndex);
                    onNavigateToResult(searchResults[newIndex]);
                  }}
                  disabled={currentResultIndex === searchResults.length - 1}
                >
                  <Text
                    style={[
                      styles.receiptNavButtonText,
                      {
                        color:
                          currentResultIndex === searchResults.length - 1
                            ? theme.colors.text
                            : theme.colors.background || "#fff",
                      },
                    ]}
                  >
                    NEXT
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : searchPhrase && searchResults.length === 0 && !searching ? (
            <View style={styles.receiptNoResults}>
              <Text
                style={[
                  styles.receiptNoResultsText,
                  { color: theme.colors.text },
                ]}
              >
                NO MATCHES FOUND
              </Text>
            </View>
          ) : null}
        </View>

        <ReceiptSeparator />

        {/* Actions Section */}
        <View style={styles.receiptSection}>
          <Text
            style={[styles.receiptSectionHeader, { color: theme.colors.text }]}
          >
            QUICK ACTIONS
          </Text>

          <View style={styles.receiptActionsGrid}>
            <TouchableOpacity
              style={[
                styles.receiptActionButton,
                { borderColor: theme.colors.text },
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
                { borderColor: theme.colors.text },
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
                { borderColor: theme.colors.text },
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
                { borderColor: theme.colors.text },
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
