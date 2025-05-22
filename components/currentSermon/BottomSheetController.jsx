import React, { useRef, useState, useEffect } from "react";
import { View, TouchableOpacity, Animated, Dimensions } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import TopCardContent from "./BottomSheetContent";
import { styles } from "../../styles/currentsermon";

const CustomTopCardController = ({
  theme,
  isCardOpen, setIsCardOpen,
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
  currentResultIndex,
  setCurrentResultIndex,
  scrollToTop,
  scrollToBottom,
  navigateToResult,
  onBack,
}) => {
  // Screen dimensions
  const { width, height } = Dimensions.get("window");

  // State to track card visibility
  // const [isCardOpen, setIsCardOpen] = useState(false);

  // Animation values
  const translateX = useRef(new Animated.Value(width * 0.8)).current; // Start off-screen to the right
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Handle button animation
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isCardOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isCardOpen]);

  // Calculate button rotation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  // Functions to control the card
  const openCard = () => {
    setIsCardOpen(true);

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeCard = () => {
    setIsCardOpen(false);

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: width * 0.8,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTogglePress = () => {
    if (isCardOpen) {
      closeCard();
    } else {
      openCard();
    }
  };

  return (
    <>
      {/* Semi-transparent overlay */}
      <Animated.View
        style={[
          styles.topCardOverlay,
          {
            opacity: isCardOpen ? 1 : 0
          },
        ]}
        pointerEvents={isCardOpen ? "auto" : "none"}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={closeCard}
        />
      </Animated.View>

      {/* Toggle button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          {
            backgroundColor: theme.dark ? "#1a1919" : "#ececec",
            // borderWidth: 1,
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
            color={theme.dark ? "#e5e5e5" : "#4276b7"}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Top Card */}
      {isCardOpen && (
        <Animated.View
          style={[
            styles.topCard,
            {
              transform: [{ translateX: translateX }],
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.text,
            },
          ]}
          pointerEvents={isCardOpen ? "auto" : "none"}
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
            isCardOpen={isCardOpen}
          />
        </Animated.View>
      )}
    </>
  );
};

export default CustomTopCardController;
