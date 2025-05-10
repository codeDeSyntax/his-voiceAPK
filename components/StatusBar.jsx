import React, { useState, useEffect, useRef } from 'react';
import { 
  StatusBar as RNStatusBar, 
  View, 
  Dimensions,
  PanResponder, 
  Platform,
  BackHandler
} from 'react-native';
import { useAppContext } from '../Logic/globalState';

const THRESHOLD = 15; // Reduced threshold distance to show the status bar
const HIDE_DELAY = 1500; // Reduced time to hide status bar after inactivity

const AppStatusBar = () => {
  const { theme } = useAppContext();
  const [isVisible, setIsVisible] = useState(false);
  const lastTouch = useRef(new Date().getTime());
  const hideTimer = useRef(null);

 

  
  // Create pan responder to detect touches at the top of the screen
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        // Only respond to touches near the top of the screen
        const { locationY } = evt.nativeEvent;
        return locationY < 80; // Reduced detection area
      },
      onPanResponderGrant: () => {
        // Touch detected at top - show status bar
        lastTouch.current = new Date().getTime();
        showStatusBar();
      },
      onPanResponderMove: (evt, gestureState) => {
        // If pulling down from top edge
        if (gestureState.dy > THRESHOLD) {
          showStatusBar();
        }
      }
    })
  ).current;

  // Handle scroll event from a ScrollView/FlatList
  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    
    // If scroll position is near top
    if (contentOffset.y < THRESHOLD) {
      showStatusBar();
    } else {
      // Reset hide timer as user is actively scrolling
      scheduleHide();
    }
  };

  // Show the status bar without animation
  const showStatusBar = () => {
    // Clear any existing hide timer
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    
    setIsVisible(true);
    // Schedule hiding after delay
    scheduleHide();
  };

  // Hide the status bar without animation
  const hideStatusBar = () => {
    setIsVisible(false);
  };

  // Schedule the status bar to hide after inactivity
  const scheduleHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    
    hideTimer.current = setTimeout(() => {
      hideStatusBar();
    }, HIDE_DELAY);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  return (
    <View 
      style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
      {...panResponder.panHandlers}
    >
      <RNStatusBar 
        barStyle={theme.dark ? "light-content" : "dark-content"} 
        backgroundColor={theme.dark ? "black" : "white"}
        animated={false}
        hidden={!isVisible}
        
      />
    </View>
  );
};

// Export a HOC that can wrap scrollable components
export const withStatusBarHandler = (Component) => {
  return (props) => {
    const statusBarRef = useRef(null);
    
    const handleScroll = (event) => {
      // Trigger status bar behavior
      if (statusBarRef.current) {
        statusBarRef.current.handleScroll(event);
      }
      
      // Make sure to call the original onScroll if it exists
      if (props.onScroll) {
        props.onScroll(event);
      }
    };
    
    return (
      <>
        <AppStatusBar ref={statusBarRef} />
        <Component {...props} onScroll={handleScroll} />
      </>
    );
  };
};

export default AppStatusBar;