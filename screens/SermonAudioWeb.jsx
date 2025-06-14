import React, { useState, useEffect, useRef } from "react";
import { WebView } from "react-native-webview";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useAppContext } from "../Logic/globalState";
import Icon from "react-native-vector-icons/Ionicons";
import DraggableFloatingBackButton from "../components/FloatButton";

const { width, height } = Dimensions.get("window");

// // Magical Floating Orbs Loader Component
// const MagicalLoader = ({ theme }) => {
//   const orb1 = useRef(new Animated.Value(0)).current;
//   const orb2 = useRef(new Animated.Value(0)).current;
//   const orb3 = useRef(new Animated.Value(0)).current;
//   const orb4 = useRef(new Animated.Value(0)).current;
//   const pulse = useRef(new Animated.Value(0)).current;
//   const rotate = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     // Floating animation for orbs
//     const createFloatingAnimation = (animValue, delay = 0) => {
//       return Animated.loop(
//         Animated.sequence([
//           Animated.timing(animValue, {
//             toValue: 1,
//             duration: 2000 + delay,
//             useNativeDriver: true,
//           }),
//           Animated.timing(animValue, {
//             toValue: 0,
//             duration: 2000 + delay,
//             useNativeDriver: true,
//           }),
//         ])
//       );
//     };

//     // Pulse animation
//     const pulseAnimation = Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulse, {
//           toValue: 1,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulse, {
//           toValue: 0,
//           duration: 1500,
//           useNativeDriver: true,
//         }),
//       ])
//     );

//     // Rotation animation
//     const rotateAnimation = Animated.loop(
//       Animated.timing(rotate, {
//         toValue: 1,
//         duration: 8000,
//         useNativeDriver: true,
//       })
//     );

//     // Start all animations
//     createFloatingAnimation(orb1, 0).start();
//     createFloatingAnimation(orb2, 500).start();
//     createFloatingAnimation(orb3, 1000).start();
//     createFloatingAnimation(orb4, 1500).start();
//     pulseAnimation.start();
//     rotateAnimation.start();
//   }, []);

//   const getOrbTransform = (animValue, xOffset, yOffset) => ({
//     transform: [
//       {
//         translateX: animValue.interpolate({
//           inputRange: [0, 0.5, 1],
//           outputRange: [xOffset, xOffset + 30, xOffset],
//         }),
//       },
//       {
//         translateY: animValue.interpolate({
//           inputRange: [0, 0.5, 1],
//           outputRange: [yOffset, yOffset - 40, yOffset],
//         }),
//       },
//       {
//         scale: animValue.interpolate({
//           inputRange: [0, 0.5, 1],
//           outputRange: [0.8, 1.2, 0.8],
//         }),
//       },
//     ],
//   });

//   const rotationTransform = {
//     transform: [
//       {
//         rotate: rotate.interpolate({
//           inputRange: [0, 1],
//           outputRange: ["0deg", "360deg"],
//         }),
//       },
//     ],
//   };

//   const pulseTransform = {
//     transform: [
//       {
//         scale: pulse.interpolate({
//           inputRange: [0, 1],
//           outputRange: [1, 1.3],
//         }),
//       },
//     ],
//     opacity: pulse.interpolate({
//       inputRange: [0, 1],
//       outputRange: [0.7, 0.3],
//     }),
//   };

//   return (
//     <View style={styles.loaderContainer}>
//       {/* Central rotating ring */}
//       <Animated.View style={[styles.centralRing, rotationTransform]}>
//         <View
//           style={[
//             styles.ring,
//             {
//               borderColor: theme?.colors?.primary || "#6366f1",
//               borderWidth: 2,
//             },
//           ]}
//         />
//       </Animated.View>

//       {/* Pulsing center orb */}
//       <Animated.View style={[styles.centerOrb, pulseTransform]}>
//         <View
//           style={[
//             styles.orb,
//             {
//               backgroundColor: theme?.colors?.accent || "#8b5cf6",
//               shadowColor: theme?.colors?.accent || "#8b5cf6",
//             },
//           ]}
//         />
//       </Animated.View>

//       {/* Floating orbs */}
//       <Animated.View
//         style={[styles.floatingOrb, getOrbTransform(orb1, -60, -60)]}
//       >
//         <View style={[styles.smallOrb, { backgroundColor: "#ec4899" }]} />
//       </Animated.View>

//       <Animated.View
//         style={[styles.floatingOrb, getOrbTransform(orb2, 60, -60)]}
//       >
//         <View style={[styles.smallOrb, { backgroundColor: "#06b6d4" }]} />
//       </Animated.View>

//       <Animated.View
//         style={[styles.floatingOrb, getOrbTransform(orb3, -60, 60)]}
//       >
//         <View style={[styles.smallOrb, { backgroundColor: "#10b981" }]} />
//       </Animated.View>

//       <Animated.View
//         style={[styles.floatingOrb, getOrbTransform(orb4, 60, 60)]}
//       >
//         <View style={[styles.smallOrb, { backgroundColor: "#f59e0b" }]} />
//       </Animated.View>

//       {/* Loading text with fade animation */}
//       <Animated.View
//         style={[
//           styles.loadingTextContainer,
//           {
//             opacity: pulse.interpolate({
//               inputRange: [0, 1],
//               outputRange: [0.6, 1],
//             }),
//           },
//         ]}
//       >
//         <Text
//           style={[
//             styles.loadingText,
//             {
//               color: theme?.colors?.text || "#374151",
//             },
//           ]}
//         >
//           Loading Sermon Audio
//         </Text>
//         <View style={styles.dots}>
//           <Animated.View
//             style={[
//               styles.dot,
//               {
//                 opacity: orb1.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0.3, 1],
//                 }),
//               },
//             ]}
//           />
//           <Animated.View
//             style={[
//               styles.dot,
//               {
//                 opacity: orb2.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0.3, 1],
//                 }),
//               },
//             ]}
//           />
//           <Animated.View
//             style={[
//               styles.dot,
//               {
//                 opacity: orb3.interpolate({
//                   inputRange: [0, 1],
//                   outputRange: [0.3, 1],
//                 }),
//               },
//             ]}
//           />
//         </View>
//       </Animated.View>
//     </View>
//   );
// };

// // Error Component
// const ErrorState = ({ onRetry, theme }) => (
//   <View style={styles.errorContainer}>
//     <View
//       style={[
//         styles.errorIcon,
//         {
//           backgroundColor: theme?.colors?.primary || "#f3f4f6",
//         },
//       ]}
//     >
//       <Icon name="wifi-outline" size={40} color="#ef4444" />
//     </View>

//     <Text
//       style={[
//         styles.errorTitle,
//         {
//           color: theme?.colors?.text || "#374151",
//         },
//       ]}
//     >
//       Connection Error
//     </Text>

//     <Text
//       style={[
//         styles.errorMessage,
//         {
//           color: theme?.colors?.textSecondary || "#6b7280",
//         },
//       ]}
//     >
//       Unable to load the sermon audio. Please check your internet connection and
//       try again.
//     </Text>

//     <TouchableOpacity
//       style={[
//         styles.retryButton,
//         {
//           backgroundColor: theme?.colors?.accent || "#6366f1",
//         },
//       ]}
//       onPress={onRetry}
//       activeOpacity={0.8}
//     >
//       <Icon
//         name="refresh"
//         size={20}
//         color="#ffffff"
//         style={{ marginRight: 8 }}
//       />
//       <Text style={styles.retryButtonText}>Try Again</Text>
//     </TouchableOpacity>
//   </View>
// );

export default function SermonAudioWebScreen() {
  const { selectedSermon, theme } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [key, setKey] = useState(0); // For WebView refresh

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setKey((prev) => prev + 1); // Force WebView to reload
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme?.colors?.background || "#ffffff",
        },
      ]}
    >
      <DraggableFloatingBackButton />
      <WebView
      
        key={key}
        source={{
          uri: selectedSermon?.audioUrl,
        }}
        style={[styles.webview, { opacity: loading ? 0 : 1 }]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleError}
        startInLoadingState={true}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}

      />

      {/* {loading && !error && <MagicalLoader theme={theme} />} */}
      {/* {error && <ErrorState onRetry={handleRetry} theme={theme} />} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },

  // Magical Loader Styles
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    zIndex: 1000,
  },
  centralRing: {
    position: "absolute",
  },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    backgroundColor: "transparent",
  },
  centerOrb: {
    position: "absolute",
  },
  orb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
  },
  floatingOrb: {
    position: "absolute",
  },
  smallOrb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingTextContainer: {
    position: "absolute",
    top: height * 0.6,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366f1",
    marginHorizontal: 3,
  },

  // Error State Styles
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    zIndex: 1000,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
