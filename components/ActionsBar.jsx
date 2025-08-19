import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from "react-native";
import {
  Ionicons,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Memoized action button component
const ActionButton = React.memo(
  ({ onPress, style, children, isHighlighted, theme }) => {
    const buttonStyle = useMemo(
      () => [
        styles.actionButton,
        {
          backgroundColor: theme.dark
            ? isHighlighted
              ? "rgba(255, 255, 255, 0.15)"
              : "rgba(80, 61, 49, 0.8)"
            : isHighlighted
            ? "rgba(93, 50, 17, 0.15)"
            : "#3a210fa0",
          borderColor: theme.dark
            ? isHighlighted
              ? "rgba(255, 255, 255, 0.4)"
              : "rgba(255, 255, 255, 0.2)"
            : isHighlighted
            ? "rgba(93, 50, 17, 0.4)"
            : "rgba(251, 251, 251, 0.859)",
          borderWidth: isHighlighted ? 2 : 1,
          shadowColor: theme.dark ? "#000" : "#5d3211",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.dark ? 0.3 : 0.1,
          shadowRadius: isHighlighted ? 6 : 3,
          elevation: isHighlighted ? 5 : 3,
          transform: [{ scale: isHighlighted ? 1.05 : 1 }],
        },
        style,
      ],
      [theme.dark, theme.colors.text, isHighlighted, style]
    );

    return (
      <TouchableOpacity onPress={onPress} style={buttonStyle}>
        {children}
      </TouchableOpacity>
    );
  }
);

ActionButton.displayName = "ActionButton";

// Memoized animated label component
const AnimatedLabel = React.memo(
  ({
    showLabels,
    currentLabelIndex,
    labelOpacity,
    labelTranslateY,
    buttonLabels,
    theme,
  }) => {
    const labelStyle = useMemo(
      () => [
        styles.animatedLabel,
        {
          opacity: labelOpacity,
          transform: [{ translateY: labelTranslateY }],
          left: 16 + 25 + 66 * currentLabelIndex, // Optimized calculation
          backgroundColor: theme.dark ? "#444" : "#eee",
        },
      ],
      [labelOpacity, labelTranslateY, currentLabelIndex, theme.dark]
    );

    const textStyle = useMemo(
      () => ({
        color: theme.colors.text,
        fontSize: 12,
        fontWeight: "bold",
      }),
      [theme.colors.text]
    );

    if (!showLabels) return null;

    return (
      <Animated.View style={labelStyle}>
        <Text style={textStyle}>{buttonLabels[currentLabelIndex]}</Text>
      </Animated.View>
    );
  }
);

AnimatedLabel.displayName = "AnimatedLabel";

const ActionsBar = ({
  theme,
  setIsLetterModalVisible,
  setIsYearModalVisible,
  filterOnlyText,
  filterOnlyAudio,
  toggleSortOrder,
  restoreOriginalOrder,
  isOriginalOrder,
  hasActiveFilters,
}) => {
  const router = useNavigation();
  const [showLabels, setShowLabels] = useState(true);
  const [currentLabelIndex, setCurrentLabelIndex] = useState(0);

  // Memoized button labels to prevent recreation
  const buttonLabels = useMemo(
    () => [
      "Menu",
      "Search",
      "Filter by letter",
      "Filter by year",
      hasActiveFilters || !isOriginalOrder
        ? "Restore original list"
        : "Restore original order",
      "Text only",
      "Audio only",
      "Sort entries",
    ],
    [hasActiveFilters, isOriginalOrder]
  );

  // Animation values with refs to prevent recreation
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const labelTranslateY = useRef(new Animated.Value(10)).current;
  const timeoutRef = useRef(null);

  // Memoized animation function
  const animateLabels = useCallback(
    (index) => {
      if (index >= buttonLabels.length) {
        setShowLabels(false);
        return;
      }

      setCurrentLabelIndex(index);

      // Fade in and slide up
      Animated.parallel([
        Animated.timing(labelOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(labelTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();

      // After showing for a moment, fade out and prepare for next label
      timeoutRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(labelOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
          Animated.timing(labelTranslateY, {
            toValue: -10,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
        ]).start(() => {
          labelTranslateY.setValue(10);
          setTimeout(() => animateLabels(index + 1), 150);
        });
      }, 1500);
    },
    [buttonLabels.length, labelOpacity, labelTranslateY]
  );

  // Memoized restart animation function
  const restartAnimation = useCallback(() => {
    if (!showLabels) {
      setShowLabels(true);
    }
  }, [showLabels]);

  // Memoized navigation handlers
  const navigateToMenu = useCallback(() => router.navigate("Menu"), [router]);
  const navigateToSearch = useCallback(
    () => router.navigate("Search"),
    [router]
  );
  const showLetterModal = useCallback(
    () => setIsLetterModalVisible(true),
    [setIsLetterModalVisible]
  );
  const showYearModal = useCallback(
    () => setIsYearModalVisible(true),
    [setIsYearModalVisible]
  );

  useEffect(() => {
    if (showLabels) {
      animateLabels(0);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [showLabels, animateLabels]);

  // Memoized styles
  const scrollContainerStyle = useMemo(() => styles.actionsScrollContainer, []);
  const menuImageStyle = useMemo(() => ({ height: 30, width: 30 }), []);
  const actionButtonContentStyle = useMemo(
    () => styles.actionButtonContent,
    []
  );
  const audioTextStyle = useMemo(() => ({ fontSize: 20 }), []);

  return (
    <View
      style={{
        backgroundColor: theme.dark
          ? "rgba(80, 61, 49, 0.25)"
          : "rgba(255, 255, 255, 0.1)",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: theme.dark
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(93, 50, 17, 0.1)",
      }}
    >
      <AnimatedLabel
        showLabels={showLabels}
        currentLabelIndex={currentLabelIndex}
        labelOpacity={labelOpacity}
        labelTranslateY={labelTranslateY}
        buttonLabels={buttonLabels}
        theme={theme}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          scrollContainerStyle,
          {
            paddingHorizontal: 20,
            gap: 12,
          },
        ]}
        onTouchStart={restartAnimation}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
      >
        {/* Menu Button */}
        <ActionButton
          onPress={navigateToMenu}
          isHighlighted={currentLabelIndex === 0 && showLabels}
          theme={theme}
        >
          {theme.dark ? (
            <Image
              source={require("../assets/nmenu.png")}
              style={menuImageStyle}
              resizeMode="contain"
            />
          ) : (
            <MaterialIcons
              name="grid-view"
              size={24}
              color={theme.dark ? theme.colors.text : "white"}
            />
          )}
          {/* <MaterialIcons name="gri" size={24} color={theme.dark ? theme.colors.text  : "white"}/> */}
        </ActionButton>

        {/* Search Button */}
        <ActionButton
          onPress={navigateToSearch}
          isHighlighted={currentLabelIndex === 1 && showLabels}
          theme={theme}
        >
          <Ionicons
            name="search-outline"
            size={24}
            color={theme.dark ? theme.colors.text : "white"}
          />
        </ActionButton>

        {/* Filter by letter Button */}
        <ActionButton
          onPress={showLetterModal}
          isHighlighted={currentLabelIndex === 2 && showLabels}
          theme={theme}
          // style={{ borderColor: theme.dark ? "white" : "#121212" }}
        >
          <Ionicons
            name="text-outline"
            size={24}
            color={theme.dark ? theme.colors.text : "white"}
          />
        </ActionButton>

        {/* Filter by year Button */}
        <ActionButton
          onPress={showYearModal}
          isHighlighted={currentLabelIndex === 3 && showLabels}
          theme={theme}
          // style={{ borderColor: theme.dark ? "white" : "#12212" }}
        >
          <FontAwesome5
            name="calendar-alt"
            size={24}
            color={theme.dark ? theme.colors.text : "white"}
          />
        </ActionButton>

        {/* Restore Original Order Button */}
        <ActionButton
          onPress={restoreOriginalOrder}
          isHighlighted={currentLabelIndex === 4 && showLabels}
          theme={theme}
          style={{
            opacity: !hasActiveFilters && isOriginalOrder ? 0.5 : 1,
            borderColor:
              !hasActiveFilters && isOriginalOrder
                ? theme.dark
                  ? "#555"
                  : "#ccc"
                : theme.dark
                ? "#747272"
                : "#4a2916",
            borderWidth: hasActiveFilters || !isOriginalOrder ? 3 : 2,
          }}
        >
          <MaterialIcons
            name="restore"
            size={24}
            color={theme.dark ? theme.colors.text : "white"}
          />
          {/* Active filters indicator */}
          {(hasActiveFilters || !isOriginalOrder) && (
            <View
              style={[
                styles.filterBadge,
                { backgroundColor: theme.dark ? "#ff6b6b" : "#e74c3c" },
              ]}
            >
              <Text style={styles.filterBadgeText}>!</Text>
            </View>
          )}
        </ActionButton>

        {/* Text only Button */}
        <ActionButton
          onPress={filterOnlyText}
          isHighlighted={currentLabelIndex === 5 && showLabels}
          theme={theme}
        >
          <View style={actionButtonContentStyle}>
            <Ionicons
              name="text"
              size={20}
              color={theme.dark ? theme.colors.text : "white"}
            />
            <Ionicons
              name="filter"
              size={16}
              color={theme.dark ? theme.colors.text : "white"}
            />
          </View>
        </ActionButton>

        {/* Audio only Button */}
        <ActionButton
          onPress={filterOnlyAudio}
          isHighlighted={currentLabelIndex === 6 && showLabels}
          theme={theme}
        >
          <View style={actionButtonContentStyle}>
            <Text style={audioTextStyle}>🔊</Text>
            <Ionicons
              name="filter"
              size={16}
              color={theme.dark ? theme.colors.text : "white"}
            />
          </View>
        </ActionButton>

        {/* Sort Button */}
        <ActionButton
          onPress={toggleSortOrder}
          isHighlighted={currentLabelIndex === 7 && showLabels}
          theme={theme}
        >
          <FontAwesome
            name="sort"
            size={24}
            color={theme.dark ? theme.colors.text : "white"}
          />
        </ActionButton>
      </ScrollView>
    </View>
  );
};

// Optimized styles - moved outside component to prevent recreation
const styles = StyleSheet.create({
  actionsScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 5,
    borderStyle: "dotted",
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  animatedLabel: {
    position: "absolute",
    top: -30,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    transform: [{ translateX: -25 }],
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  filterBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default React.memo(ActionsBar);
