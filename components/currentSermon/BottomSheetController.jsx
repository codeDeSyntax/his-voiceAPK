import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, TouchableOpacity, Animated, Dimensions } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import TopCardContent from "./BottomSheetContent";
import { styles } from "../../styles/currentsermon";

const CustomTopCardController = ({
  theme,
  isCardOpen,
  setIsCardOpen,
  selectedSermon,
  searchSermon,
  paragraphs,
  paragraphLayouts,
  scrollToParagraph,
  searchPhrase,
  setSearchPhrase,
  searchResults,
  setSearchResults,
  searching,
  setSearching,
  currentResultIndex,
  setCurrentResultIndex,
  scrollToTop,
  scrollToBottom,
  navigateToResult,
  onBack,
}) => {
  // Screen dimensions
  const { width, height } = Dimensions.get("window");

  // Animation values
  const translateY = useRef(new Animated.Value(height)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Handle button animation
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isCardOpen ? 1 : 0,
      duration: 200, // Faster animation
      useNativeDriver: true,
    }).start();
  }, [isCardOpen]);

  // Calculate button rotation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Optimized functions to control the card
  const openCard = useCallback(() => {
    setIsCardOpen(true);
    Animated.spring(translateY, {
      toValue: 0,
      tension: 100, // Snappier animation
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [setIsCardOpen, translateY]);

  const closeCard = useCallback(() => {
    setIsCardOpen(false);
    Animated.spring(translateY, {
      toValue: height,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [setIsCardOpen, translateY, height]);

  const handleTogglePress = useCallback(() => {
    if (isCardOpen) {
      closeCard();
    } else {
      openCard();
    }
  }, [isCardOpen, closeCard, openCard]);

  return (
    <>
      {/* Toggle button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          {
            backgroundColor: theme.dark ? theme.colors.background : "#ececec",
            borderColor: theme.dark ? "#1a1919" : "#4276b7",
          },
        ]}
        onPress={handleTogglePress}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialIcons
            name={isCardOpen ? "cancel" : "menu-open"}
            size={24}
            color={theme.dark ? "#e5e5e5" : "#5d3211"}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Top Card */}
      {isCardOpen && (
        <Animated.View
          style={[
            styles.topCard,
            {
              transform: [{ translateY: translateY }],
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.text,
            },
          ]}
          pointerEvents="auto"
        >
          {/* Close button inside card */}
          <TouchableOpacity
            style={[
              styles.topCardCloseButton,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={closeCard}
            activeOpacity={0.7}
          >
            <Feather name="x" size={18} color={theme.colors.text} />
          </TouchableOpacity>

          {/* Card Content */}
          <TopCardContent
            theme={theme}
            selectedSermon={selectedSermon}
            searchPhrase={searchPhrase}
            setSearchPhrase={setSearchPhrase}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            currentResultIndex={currentResultIndex}
            setCurrentResultIndex={setCurrentResultIndex}
            onScrollToTop={scrollToTop}
            onScrollToBottom={scrollToBottom}
            onNavigateToResult={navigateToResult}
            onBack={onBack}
            searchSermon={searchSermon}
            paragraphs={paragraphs}
            paragraphLayouts={paragraphLayouts}
            scrollToParagraph={scrollToParagraph}
            searching={searching}
            setSearching={setSearching}
            isCardOpen={isCardOpen}
          />
        </Animated.View>
      )}
    </>
  );
};

export default CustomTopCardController;
