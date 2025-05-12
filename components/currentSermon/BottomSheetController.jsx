import React, { useRef, useState, useEffect } from "react";
import { View, TouchableOpacity, Animated, PanResponder, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import BottomSheetContent from "./BottomSheetContent";
import { styles } from "../../styles/currentsermon";

const CustomBottomSheetController = ({
  theme,
  selectedSermon,
  searchPhrase,
  setSearchPhrase,
  searchResults,
  currentResultIndex,
  setCurrentResultIndex,
  scrollToTop,
  scrollToBottom,
  navigateToResult,
  onBack,
}) => {
  // Screen dimensions
  const { height } = Dimensions.get("window");
  
  // Define snap points as percentages of screen height
  const snapPoints = [
    height * 0.3,  // 30%
    height * 0.55, // 55%
    height * 1.0,  // 80%
  ];
  
  // State to track bottom sheet visibility and position
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [currentSnapPoint, setCurrentSnapPoint] = useState(-1);
  
  // Animation values
  const translateY = useRef(new Animated.Value(height)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        translateY.setOffset(translateY._value);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        
        // Calculate current position
        const currentPosition = translateY._value + (height - snapPoints[currentSnapPoint]);
        
        // Determine whether to snap up, down, or close based on velocity and position
        if (gestureState.vy > 0.5) {
          // Fast downward swipe - go to next lower snap point or close
          if (currentSnapPoint === 0) {
            closeBottomSheet();
          } else {
            snapToIndex(currentSnapPoint - 1);
          }
        } else if (gestureState.vy < -0.5) {
          // Fast upward swipe - go to next higher snap point
          if (currentSnapPoint < snapPoints.length - 1) {
            snapToIndex(currentSnapPoint + 1);
          }
        } else {
          // Find nearest snap point based on current position
          let closestSnapIndex = -1;
          let closestDistance = Number.MAX_VALUE;
          
          snapPoints.forEach((point, index) => {
            const distance = Math.abs(height - point - currentPosition);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestSnapIndex = index;
            }
          });
          
          if (closestSnapIndex === -1) {
            closeBottomSheet();
          } else {
            snapToIndex(closestSnapIndex);
          }
        }
      }
    })
  ).current;
  
  // Handle button animation
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isBottomSheetOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isBottomSheetOpen]);
  
  // Calculate button rotation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });
  
  // Functions to control the bottom sheet
  const snapToIndex = (index) => {
    if (index >= 0 && index < snapPoints.length) {
      const finalPosition = height - snapPoints[index];
      setCurrentSnapPoint(index);
      setIsBottomSheetOpen(true);
      
      Animated.spring(translateY, {
        toValue: finalPosition,
        tension: 50,
        friction: 12,
        useNativeDriver: true,
      }).start();
    }
  };
  
  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setCurrentSnapPoint(-1);
    
    Animated.spring(translateY, {
      toValue: height,
      tension: 65,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };
  
  const handleTogglePress = () => {
    if (isBottomSheetOpen) {
      closeBottomSheet();
      console.log("Bottom sheet closed");
    } else {
      snapToIndex(2);
      console.log("Bottom sheet opened to snap point 0");
    }
  };
  
  // Overlay opacity based on bottom sheet position
  const overlayOpacity = translateY.interpolate({
    inputRange: [height - snapPoints[2], height],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  return (
    <>
      {/* Semi-transparent overlay */}
      {isBottomSheetOpen && (
        <Animated.View 
          style={[
            styles.overlay,
            { 
              opacity: overlayOpacity,
              backgroundColor: 'black',
            }
          ]}
          pointerEvents={isBottomSheetOpen ? "auto" : "none"}
          onTouchStart={() => closeBottomSheet()}
        />
      )}
      
      {/* Toggle button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          {
            backgroundColor: isBottomSheetOpen
              ? theme.colors.primary
              : theme.colors.background,
          },
        ]}
        onPress={handleTogglePress}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Feather
            name={isBottomSheetOpen ? "x" : "menu"}
            size={24}
            color={theme.colors.text}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Custom Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY: translateY }],
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        {/* Handle indicator */}
        <View 
          {...panResponder.panHandlers}
          style={styles.bottomSheetHandle}
        >
          <View style={styles.handleIndicator} />
        </View>
        
        {/* Bottom Sheet Content */}
        <BottomSheetContent
          theme={theme}
          selectedSermon={selectedSermon}
          searchPhrase={searchPhrase}
          setSearchPhrase={setSearchPhrase}
          searchResults={searchResults}
          currentResultIndex={currentResultIndex}
          setCurrentResultIndex={setCurrentResultIndex}
          onScrollToTop={scrollToTop}
          onScrollToBottom={scrollToBottom}
          onNavigateToResult={navigateToResult}
          onBack={onBack}
        />
      </Animated.View>
    </>
  );
};

export default CustomBottomSheetController;