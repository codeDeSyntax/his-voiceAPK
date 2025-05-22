import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const SearchFeedback = ({
  isVisible,
  message = 'Paragraph found',
  theme,
  duration = 2000,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (isVisible) {
      fadeAnim.setValue(0); // Reset first to avoid glitches

      const fadeIn = Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      });

      const fadeOut = Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      });

      Animated.sequence([
        fadeIn,
        Animated.delay(duration - 600),
        fadeOut,
      ]).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const containerStyle = {
    opacity: fadeAnim,
    backgroundColor: theme?.colors?.primary || '#000',
    transform: [
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
    bottom: 100,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default React.memo(SearchFeedback);
