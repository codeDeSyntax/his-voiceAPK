import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ActivityIndicator, 
  Dimensions, 
  Platform, 
  Image,
  Animated 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const UpdateScreen = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation setup
    const pulseAnimation = Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]);

    // Start animation with error handling
    const animationLoop = Animated.loop(pulseAnimation);
    animationLoop.start((result) => {
      if (!result.finished) {
        console.warn('Animation was interrupted');
      }
    });

    // Cleanup function
    return () => {
      animationLoop.stop();
    };
  }, []);

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {/* Update Image */}
      <Animated.View style={[
        styles.imageContainer,
        {
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Image 
          source={require('../assets/cloud.png')}
          style={styles.image}
          resizeMode="contain"
          onError={(error) => console.warn('Image loading error:', error.nativeEvent.error)}
        />
      </Animated.View>

      {/* Loading Indicator and Text */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color="#60a5fa" // Lighter blue for better contrast
        />
        <Text style={styles.updateText}>Applying Update</Text>
        <Text style={styles.subText}>Please don't close the application</Text>
      </View>

      {/* Version Text */}
      {/* <Text style={styles.versionText}>Version 2.0.4</Text> */}
    </View>
  );

  return (
    <LinearGradient
      colors={['#151718', '#151718']} // Darker colors
      style={styles.container}
      onError={(error) => console.warn('Gradient error:', error)}
    >
      {Platform.OS === 'ios' ? (
        <BlurView 
          intensity={20} 
          tint="dark" 
          style={styles.blurContainer}
          onError={(error) => console.warn('BlurView error:', error)}
        >
          {renderContent()}
        </BlurView>
      ) : (
        <View style={styles.androidContainer}>
          {renderContent()}
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    padding: 32,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)', // More subtle border
    backgroundColor: '#202425', // Darker background
    width: width * 0.85,
    alignItems: 'center',
  },
  androidContainer: {
    padding: 32,
    borderRadius: 24,
    backgroundColor: '#202425', // Darker background
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)', // More subtle border
    width: width * 0.85,
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  imageContainer: {
    width: 160,
    height: 160,
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  updateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f8fafc', // Lighter text for better contrast
    marginTop: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  subText: {
    fontSize: 14,
    color: '#94a3b8', // Lighter gray for better contrast
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  versionText: {
    fontSize: 12,
    color: '#475569', // Darker gray for less emphasis
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default UpdateScreen;