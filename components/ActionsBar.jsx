import React, { useState, useEffect, useRef } from "react";
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
import { Ionicons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ActionsBar = ({
  theme,
  setIsLetterModalVisible,
  setIsYearModalVisible,
  filterOnlyText,
  filterOnlyAudio,
  toggleSortOrder,
}) => {
  const router = useRouter();
  const [showLabels, setShowLabels] = useState(true);
  const [currentLabelIndex, setCurrentLabelIndex] = useState(0);
  
  // Define button labels
  const buttonLabels = [
    "Menu",
    "Search",
    "Filter by letter",
    "Filter by year",
    "Text only",
    "Audio only",
    "Sort entries"
  ];
  
  // Animation values
  const labelOpacity = useRef(new Animated.Value(0)).current;
  const labelTranslateY = useRef(new Animated.Value(10)).current;
  
  useEffect(() => {
    if (showLabels) {
      // Start the animation sequence
      let timeout;
      const animateLabels = (index) => {
        if (index >= buttonLabels.length) {
          // Animation cycle completed
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
        timeout = setTimeout(() => {
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
            // Reset translateY for next animation
            labelTranslateY.setValue(10);
            // Move to next label after a short pause
            setTimeout(() => animateLabels(index + 1), 150);
          });
        }, 1500); // Show each label for 1.5 seconds
      };
      
      // Start animation sequence with the first label
      animateLabels(0);
      
      // Cleanup
      return () => clearTimeout(timeout);
    }
  }, [showLabels]);
  
  // Restart animation when user taps anywhere
  const restartAnimation = () => {
    if (!showLabels) {
      setShowLabels(true);
    }
  };
  
  // Calculate position for the floating label
  const getAnimatedLabelPosition = (index) => {
    // Starting position (leftmost position for first button)
    const startingLeft = 16 + 25; // Container padding + button radius
    // Space between button center points
    const buttonSpacing = 66; // Button width (50) + gap (16)
    
    // Calculate position based on index
    return startingLeft + (buttonSpacing * index);
  };
  
  return (
    <View>
      {/* Animated label overlay */}
      {showLabels && (
        <Animated.View
          style={[
            styles.animatedLabel,
            {
              opacity: labelOpacity,
              transform: [{ translateY: labelTranslateY }],
              left: getAnimatedLabelPosition(currentLabelIndex),
              backgroundColor: theme.dark ? "#444" : "#eee",
            },
          ]}
        >
          <Text style={{ 
            color: theme.colors.text,
            fontSize: 12,
            fontWeight: "bold",
          }}>
            {buttonLabels[currentLabelIndex]}
          </Text>
        </Animated.View>
      )}
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsScrollContainer}
        onTouchStart={restartAnimation}
      >
        {/* Menu Button */}
        <TouchableOpacity
          onPress={() => router.navigate("screens/Menu")}
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.dark === true ? "#22272a" : "white",
              shadowColor: theme.colors.text,
              borderColor: theme.dark ? "#747272" : "black",
              borderWidth: currentLabelIndex === 0 && showLabels ? 3 : 2,
            },
          ]}
        >
          <Image
            source={require("../assets/menu.png")}
            style={{ height: 200, width: 200 }}
            height={30}
            width={30}
          />
        </TouchableOpacity>
        
        {/* Search Button */}
        <TouchableOpacity
          onPress={() => router.navigate("screens/Search")}
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.dark === true ? "#22272a" : "white",
              shadowColor: theme.colors.text,
              borderColor: theme.dark ? "#747272" : "black",
              borderWidth: currentLabelIndex === 1 && showLabels ? 3 : 2,
            },
          ]}
        >
          <Ionicons name="search-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        {/* Filter by letter Button */}
        <TouchableOpacity
          onPress={() => setIsLetterModalVisible(true)}
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.dark === true ? "#22272a" : "white",
              shadowColor: theme.colors.text,
              borderColor: theme.dark ? "white" : "#121212",
              borderWidth: currentLabelIndex === 2 && showLabels ? 3 : 2,
            },
          ]}
        >
          <Ionicons name="text-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        {/* Filter by year Button */}
        <TouchableOpacity
          onPress={() => setIsYearModalVisible(true)}
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.dark === true ? "#22272a" : "white",
              shadowColor: theme.colors.text,
              borderColor: theme.dark ? "white" : "#121212",
              borderWidth: currentLabelIndex === 3 && showLabels ? 3 : 2,
            },
          ]}
        >
          <FontAwesome5 name="calendar-alt" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        {/* Text only Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.dark === true ? "#22272a" : "white",
              borderColor: theme.dark ? "#747272" : "black",
              borderWidth: currentLabelIndex === 4 && showLabels ? 3 : 2,
            },
          ]}
          onPress={filterOnlyText}
        >
          <View style={styles.actionButtonContent}>
            <Ionicons name="text" size={20} color={theme.colors.text} />
            <Ionicons name="filter" size={16} color={theme.colors.text} />
          </View>
        </TouchableOpacity>

        {/* Audio only Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.dark === true ? "#22272a" : "white",
              borderColor: theme.dark ? "#747272" : "black",
              borderWidth: currentLabelIndex === 5 && showLabels ? 3 : 2,
            },
          ]}
          onPress={filterOnlyAudio}
        >
          <View style={styles.actionButtonContent}>
            <Text style={{ fontSize: 20 }}>🔊</Text>
            <Ionicons name="filter" size={16} color={theme.colors.text} />
          </View>
        </TouchableOpacity>

        {/* Sort Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: theme.dark === true ? "#22272a" : "white",
              borderColor: theme.dark ? "#747272" : "black",
              borderWidth: currentLabelIndex === 6 && showLabels ? 3 : 2,
            },
          ]}
          onPress={toggleSortOrder}
        >
          <FontAwesome name="sort" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  actionsScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
    gap: 16,
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
    transform: [{ translateX: -25 }], // Center the label over the button
  },
  // Original styles preserved
  filtersContainer: {
    flexDirection: "row",
    gap: 10,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "white",
    height: 30,
    width: 30,
    borderRadius: 100,
    shadowColor: "#000",
    elevation: 5,
  },
  sortButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#202425",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default ActionsBar;