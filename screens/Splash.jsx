// components/CustomSplash.js
import { View, Image, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export default function CustomSplash({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true
      }).start(() => {
        onFinish();
      });
    }, 1500); // fake loading delay
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image source={require('../assets/splash.png')} style={styles.image} />
      <Text style={styles.text}>Loading His Voice...</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4b2d16',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain'
  },
  text: {
    marginTop: 20,
    color: 'white',
    fontSize: 18
  }
});
