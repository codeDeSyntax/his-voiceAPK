import React, { useState, useRef, useEffect } from "react";
import { Text } from "react-native-paper";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import PlaySermon from "../PlaySermon";
import { useAppContext } from "../../Logic/globalState";
import { styles } from "../../styles/currentsermon";
import { useNavigation } from "@react-navigation/native";

const CurrentSermon = () => {
  const { selectedSermon, settings, theme, searchText } = useAppContext();
  const navigation = useNavigation();
  const [searchResults, setSearchResults] = useState([]);
  const [searchPhrase, setSearchPhrase] = useState(searchText);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [showFloatingCard, setShowFloatingCard] = useState(false);
  const [hideTopBar, setHideTopBar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const topBarAnim = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showFloatingCard ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFloatingCard, fadeAnim]);

  useEffect(() => {
    Animated.spring(topBarAnim, {
      toValue: hideTopBar ? -100 : 0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [hideTopBar, topBarAnim]);

  const formatSermonIntoParagraphs = (text) => {
    if (!text) return [];

    // Split text into paragraphs based on various indicators
    // Look for multiple line breaks, periods followed by spaces, or specific sermon patterns
    const rawParagraphs = text
      // First normalize line breaks
      .replace(/\r\n/g, "\n")
      // Replace multiple spaces with single space
      .replace(/\s+/g, " ")
      // Split on obvious paragraph breaks (double line breaks)
      .split(/\n\s*\n/);

    // Further process each paragraph - if they're too long, break them up
    const formattedParagraphs = [];

    rawParagraphs.forEach((paragraph) => {
      // Skip empty paragraphs
      if (!paragraph.trim()) return;

      // If paragraph is very long, try to split at logical points
      if (paragraph.length > 800) {
        // Look for sentence endings followed by spaces as potential break points
        const sentences = paragraph.split(/(?<=[.!?])\s+/);

        let currentParagraph = "";
        sentences.forEach((sentence) => {
          if (currentParagraph.length + sentence.length > 800) {
            if (currentParagraph.trim()) {
              formattedParagraphs.push(currentParagraph.trim());
            }
            currentParagraph = sentence;
          } else {
            currentParagraph += " " + sentence;
          }
        });

        if (currentParagraph.trim()) {
          formattedParagraphs.push(currentParagraph.trim());
        }
      } else {
        formattedParagraphs.push(paragraph.trim());
      }
    });

    return formattedParagraphs;
  };

  const renderSermonText = () => {
    const cleanSermonText = selectedSermon?.sermon || "";
    const paragraphs = formatSermonIntoParagraphs(cleanSermonText);

    if (!searchPhrase) {
      return paragraphs.map((paragraph, index) => {
        // Check if paragraph contains "Endnote"
        if (paragraph.includes("Endnote")) {
          const parts = paragraph.split(/(Endnote)/gi);
          return (
            <Text
              key={`paragraph-${index}`}
              style={[
                { color: theme.colors.text, fontFamily: settings.fontFamily },
                styles.sermonText,
              ]}
            >
              {parts.map((part, partIndex) =>
                part.toLowerCase() === "endnote" ? (
                  <Text key={`endnote-${partIndex}`} style={styles.endnoteText}>
                    {part}
                  </Text>
                ) : (
                  <Text key={`text-${partIndex}`}>{part}</Text>
                )
              )}
            </Text>
          );
        }

        return (
          <Text
            key={`paragraph-${index}`}
            style={[
              { color: theme.colors.text, fontFamily: settings.fontFamily },
              styles.sermonText,
            ]}
          >
            {paragraph}
          </Text>
        );
      });
    }

    // For search results, highlight matching text
    return paragraphs.map((paragraph, index) => {
      if (paragraph.includes("Endnote")) {
        const parts = paragraph.split(/(Endnote)/gi);
        return (
          <Text
            key={`paragraph-${index}`}
            style={[
              { color: theme.colors.text, fontFamily: settings.fontFamily },
              styles.sermonText,
            ]}
          >
            {parts.map((part, partIndex) =>
              part.toLowerCase() === "endnote" ? (
                <Text key={`endnote-${partIndex}`} style={styles.endnoteText}>
                  {part}
                </Text>
              ) : (
                <Text key={`text-${partIndex}`}>{part}</Text>
              )
            )}
          </Text>
        );
      }

      // Split for search highlight
      const parts = paragraph.split(new RegExp(`(${searchPhrase})`, "gi"));
      return (
        <Text
          key={`paragraph-${index}`}
          style={[
            { color: theme.colors.text, fontFamily: settings.fontFamily },
            styles.sermonText,
          ]}
        >
          {parts.map((part, partIndex) =>
            part.toLowerCase() === searchPhrase.toLowerCase() ? (
              <Text
                key={`highlight-${partIndex}`}
                style={styles.highlightedText}
              >
                {part}
              </Text>
            ) : (
              <Text key={`text-${partIndex}`}>{part}</Text>
            )
          )}
        </Text>
      );
    });
  };

  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;

    // Only show topbar when actively scrolling up
    if (currentScrollY < lastScrollY && currentScrollY > 20) {
      setHideTopBar(true);
    }
    // Always show at the top of content
    else if (currentScrollY <= 20) {
      setHideTopBar(false);
    }
    // Hide topbar when scrolling down or when static
    else if (currentScrollY > lastScrollY || currentScrollY === lastScrollY) {
      setHideTopBar(true);
    }

    // Update the last scroll position
    setLastScrollY(currentScrollY);
  };

  const TopBar = () => (
    <Animated.View
      style={[
        styles.topBar,
        {
          transform: [{ translateY: topBarAnim }],
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("AllSermons")}
      >
        <Feather name="arrow-left" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.topBarTitleContainer}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.topBarTitle, { color: theme.colors.text }]}
        >
          {selectedSermon?.title}
        </Text>
      </View>

      <View style={styles.topBarButtonsContainer}>
        {searchPhrase ? (
          <TouchableOpacity
            style={styles.topBarButton}
            onPress={() => {
              setSearchPhrase("");
              setSearchResults([]);
            }}
          >
            <Feather name="x" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={() => {
                // Handle search action
                // This would open search interface
              }}
            >
              <Feather name="search" size={22} color={theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.topBarButton}
              onPress={() => {
                // Handle list action
                navigation.navigate("AllSermons");
              }}
            >
              <Feather name="list" size={22} color={theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.topBarButton}
              onPress={() => {
                // Handle menu action
                // This would open menu
              }}
            >
              <Feather name="menu" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </Animated.View>
  );

  const FloatingCard = () => (
    <Animated.View
      style={[
        styles.floatingCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={[styles.floatingCardTitle, { fontFamily: "serif" }]}>
        {selectedSermon?.title}
      </Text>
      {selectedSermon.date && (
        <Text style={[styles.floatingCardText, { fontStyle: "italic" }]}>
          {selectedSermon?.date}
        </Text>
      )}
      {selectedSermon?.location && (
        <Text style={styles.floatingCardText}>{selectedSermon?.location}</Text>
      )}
      {selectedSermon?.year && (
        <Text style={styles.floatingCardText}>{selectedSermon?.year}</Text>
      )}
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <TopBar />

      {selectedSermon?.type === "mp3" ? (
        <PlaySermon sermon={selectedSermon} />
      ) : (
        <ScrollView
          scrollEventThrottle={16}
          onScroll={handleScroll}
          decelerationRate="normal"
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollViewContainer,
            // { backgroundColor: theme.colors.primary },
          ]}
          onContentSizeChange={(width, height) => {
            setContentHeight(height);
          }}
        >
          <View>
            <Text style={[styles.titleText, { color: theme.colors.text }]}>
              {selectedSermon?.title}
            </Text>
            {selectedSermon?.location && (
              <Text style={[styles.locationText, { color: theme.colors.text }]}>
                {selectedSermon?.location}
              </Text>
            )}

            <View style={{ width: "100%" }}>{renderSermonText()}</View>
          </View>
        </ScrollView>
      )}

      {selectedSermon?.type === "text" && (
        <>
          <TouchableOpacity
            style={[
              styles.floatingButton,
              {
                bottom: 220,
                backgroundColor: theme.colors.background,
                elevation: 5,
              },
            ]}
            onPress={() => setShowFloatingCard(!showFloatingCard)}
          >
            <Feather name="info" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.floatingButton,
              {
                bottom: 150,
                backgroundColor: theme.colors.background,
                elevation: 5,
              },
            ]}
            onPress={() =>
              scrollViewRef.current?.scrollTo({ y: 0, animated: true })
            }
          >
            <Feather name="arrow-up" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.floatingButton,
              {
                bottom: 80,
                backgroundColor: theme.colors.background,
                elevation: 5,
              },
            ]}
            onPress={() =>
              scrollViewRef.current?.scrollTo({
                y: contentHeight,
                animated: true,
              })
            }
          >
            <Feather name="arrow-down" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          {showFloatingCard && <FloatingCard />}

          {searchText && searchResults.length > 0 && (
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() =>
                  setCurrentResultIndex((current) => Math.max(0, current - 1))
                }
              >
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>

              <Text style={styles.matchesText}>
                {`${currentResultIndex + 1} / ${searchResults.length}`}
              </Text>

              <TouchableOpacity
                style={styles.navButton}
                onPress={() =>
                  setCurrentResultIndex((current) =>
                    Math.min(searchResults.length - 1, current + 1)
                  )
                }
              >
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

export default CurrentSermon;
