import React, { useRef, useState, useEffect } from "react";
import { View, TouchableOpacity, Animated, Dimensions } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import TopCardContent from "./BottomSheetContent";
import { styles } from "../../styles/currentsermon";

const CustomTopCardController = ({
  theme,
  isCardOpen,
  setIsCardOpen,
  selectedSermon,
  paragraphs,
  paragraphLayouts,
  scrollToParagraph,
  scrollToTop,
  scrollToBottom,
  onBack,
}) => {
  // Screen dimensions
  const { width, height } = Dimensions.get("window");

  // State to track card visibility and animation completion
  const [isAnimating, setIsAnimating] = useState(false);

  // Animation values
  const translateY = useRef(new Animated.Value(height)).current; // Start off-screen at the bottom
  const rotateAnim = useRef(new Animated.Value(0)).current;

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

    Animated.spring(translateY, {
      toValue: 0,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const closeCard = () => {
    setIsCardOpen(false);

    Animated.spring(translateY, {
      toValue: height,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };
  const handleTogglePress = () => {
    if (isCardOpen) {
      closeCard();
    } else {
      openCard();
    }
  };

  // Create wrapper functions that close the sheet after scrolling
  const handleScrollToTopAndClose = () => {
    scrollToTop();
    // Close the sheet after a short delay to let the scroll animation start
    setTimeout(() => {
      closeCard();
    }, 300);
  };

  const handleScrollToBottomAndClose = () => {
    scrollToBottom();
    // Close the sheet after a short delay to let the scroll animation start
    setTimeout(() => {
      closeCard();
    }, 300);
  };

  return (
    <>
      {/* Toggle button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          {
            backgroundColor: theme.dark ? theme.colors.background : "#ececec",
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
            onScrollToTop={handleScrollToTopAndClose}
            onScrollToBottom={handleScrollToBottomAndClose}
            onBack={onBack}
            paragraphs={paragraphs}
            paragraphLayouts={paragraphLayouts}
            scrollToParagraph={scrollToParagraph}
            isCardOpen={isCardOpen}
          />
        </Animated.View>
      )}
    </>
  );
};

export default CustomTopCardController;
