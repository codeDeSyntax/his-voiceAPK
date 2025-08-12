import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const SearchFeedback = ({
  isVisible,
  message = 'Paragraph found',
  theme,
  duration = 1500, // Reduced from 2000 for snappier feel
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);

      // Faster, more responsive animations
      const fadeIn = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150, // Faster fade in
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        })
      ]);

      const fadeOut = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200, // Faster fade out
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      ]);

      Animated.sequence([
        fadeIn,
        Animated.delay(duration - 350), // Adjusted delay
        fadeOut,
      ]).start();
    }
  }, [isVisible, duration]);

  if (!isVisible) return null;

  const containerStyle = {
    opacity: fadeAnim,
    backgroundColor: theme?.colors?.primary || '#000',
    transform: [
      { scale: scaleAnim },
      {
        translateY: fadeAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Text style={[styles.message, { color: theme?.colors?.text || '#fff' }]}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120, // Moved up a bit from the bottom
    alignSelf: 'center',
    paddingHorizontal: 20, // Increased padding
    paddingVertical: 12,
    borderRadius: 12, // More rounded
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 120, // Minimum width for better appearance
  },
  message: {
    fontSize: 14,
    fontWeight: '600', // Slightly bolder
    textAlign: 'center',
  },
});

export default React.memo(SearchFeedback);
