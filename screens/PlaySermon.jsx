import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../Logic/globalState";
import { useNavigation } from "@react-navigation/native";

const DownloadSermon = () => {
  const { selectedSermon, theme } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const audioUrl = selectedSermon?.audioUrl || "";
  const isDark = theme.dark;
  const navigation  = useNavigation()
  
  // Animations using Animated API (no external library)
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];
  const progressAnim = useState(new Animated.Value(0))[0];
  
  // Animation sequences
  useEffect(() => {
    Animated.stagger(100, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Function to copy URL to clipboard
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(audioUrl);
      setIsCopied(true);
      
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      alert("Failed to copy to clipboard");
    }
  };

  // Function to open URL in external browser
  const openInBrowser = async () => {
    if (!audioUrl) {
      alert("No URL available");
      return;
    }

    setIsLoading(true);
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    
    try {
      const supported = await Linking.canOpenURL(audioUrl);
      if (supported) {
        await Linking.openURL(audioUrl);
      } else {
        alert("Cannot open this URL");
      }
    } catch (error) {
      alert("Failed to open URL");
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        progressAnim.setValue(0);
      }, 500);
    }
  };

  // Function to simulate download
  const downloadSermon = async () => {
    if (!audioUrl) {
      alert("No URL available");
      return;
    }

    setIsLoading(true);
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
    
    try {
      setTimeout(() => {
        alert("Download completed!");
        setIsLoading(false);
        progressAnim.setValue(0);
      }, 3000);
    } catch (error) {
      alert("Download failed");
      setIsLoading(false);
      progressAnim.setValue(0);
    }
  };

  // Button press animation
  const onPressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.96,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };
  
  const onPressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView 
      style={[
        styles.safeArea, 
        { backgroundColor: theme.colors.primary }
      ]}
    >
    
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={theme.colors.text} 
          />
          <Text style={[
            styles.backButtonText,
            { color: theme.colors.text }
          ]}>
            Back
          </Text>
        </TouchableOpacity>
        <View style={styles.spacer} />
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Sermon Title Card */}
          <Animated.View 
            style={[
              styles.titleCard,
              { 
                backgroundColor: theme.colors.secondary,
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}]
              }
            ]}
          >
            <Text
              style={[
                styles.title,
                { color: theme.colors.text }
              ]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {selectedSermon?.title || "Sermon Title"}
            </Text>
            
            {/* Minister Name & Date */}
            <View style={styles.sermonMeta}>
              <Text style={[
                styles.metaText,
                { color: isDark ? '#B0B0B0' : '#666666' }
              ]}>
                {selectedSermon?.minister || "Minister Name"}
              </Text>
              <View style={[
                styles.datePill,
                { 
                  backgroundColor: isDark ? 'rgba(138, 43, 226, 0.2)' : 'rgba(138, 43, 226, 0.15)' 
                }
              ]}>
                <Text style={[
                  styles.dateText,
                  { color: theme.colors.text }
                ]}>
                  {selectedSermon?.date || "Date"}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* URL Card */}
          <Animated.View 
            style={[
              styles.urlCard,
              { 
                backgroundColor: theme.colors.secondary,
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}]
              }
            ]}
          >
            <Text style={[
              styles.urlLabel,
              { color: isDark ? '#B0B0B0' : '#666666' }
            ]}>
              AUDIO URL
            </Text>
            <View style={[
              styles.urlContainer,
              { backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0' }
            ]}>
              <Text
                style={[
                  styles.urlText,
                  { color: isDark ? '#FFFFFF' : '#333333' }
                ]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {audioUrl || "No URL available"}
              </Text>
              <TouchableOpacity
                style={[
                  styles.copyButton,
                  isCopied && styles.copiedButton
                ]}
                onPress={copyToClipboard}
                activeOpacity={0.7}
                disabled={!audioUrl}
              >
                <FontAwesome5
                  name={isCopied ? "check" : "copy"}
                  size={16}
                  color="white"
                />
                <Text style={styles.copyButtonText}>
                  {isCopied ? "Copied!" : "Copy"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Action Cards */}
          <Animated.View 
            style={[
              styles.actionsGrid,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}]
              }
            ]}
          >
            {/* Play Button */}
            <TouchableOpacity
              onPress={openInBrowser}
              activeOpacity={0.8}
              disabled={isLoading || !audioUrl}
              style={[
                styles.actionCard,
                { backgroundColor: theme.colors.secondary }
              ]}
            >
              <View style={[
                styles.iconContainer,
                { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.15)' }
              ]}>
                <Ionicons name="play-circle" size={32} color="#4CAF50" />
              </View>
              <Text style={[
                styles.actionTitle,
                { color: isDark ? '#FFFFFF' : '#333333' }
              ]}>
                Play
              </Text>
              <Text style={[
                styles.actionSubtitle,
                { color: isDark ? '#B0B0B0' : '#666666' }
              ]}>
                Stream in browser
              </Text>
            </TouchableOpacity>

            {/* Download Button */}
            <TouchableOpacity
              onPress={downloadSermon}
              activeOpacity={0.8}
              disabled={isLoading || !audioUrl}
              style={[
                styles.actionCard,
                { backgroundColor: theme.colors.secondary }
              ]}
            >
              <View style={[
                styles.iconContainer,
                { backgroundColor: isDark ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.15)' }
              ]}>
                <MaterialIcons name="cloud-download" size={32} color="#2196F3" />
              </View>
              <Text style={[
                styles.actionTitle,
                { color: isDark ? '#FFFFFF' : '#333333' }
              ]}>
                Download
              </Text>
              <Text style={[
                styles.actionSubtitle,
                { color: isDark ? '#B0B0B0' : '#666666' }
              ]}>
                Save for offline
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Main Action Button */}
          <Animated.View 
            style={[
              { 
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0]
                  })}
                ]
              }
            ]}
          >
            <TouchableOpacity
              onPress={openInBrowser}
              style={styles.mainActionButton}
              activeOpacity={0.85}
              disabled={isLoading || !audioUrl}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
            >
              <LinearGradient
                colors={isDark ? ['#4169E1', '#2196F3'] : ['#4169E1', '#8A2BE2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" style={styles.activityIndicator} />
                    <Text style={styles.mainButtonText}>Opening...</Text>
                    
                    {/* Progress bar */}
                    <View style={styles.progressBarContainer}>
                      <Animated.View 
                        style={[
                          styles.progressBar,
                          { width: progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%']
                          })}
                        ]} 
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Ionicons name="mic-circle" size={22} color="white" />
                    <Text style={styles.mainButtonText}>Listen Now</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Additional Features */}
          <Animated.View 
            style={[
              styles.featuresContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })}]
              }
            ]}
          >
            <TouchableOpacity style={[
              styles.featureBox,
              { backgroundColor: theme.colors.secondary }
            ]}>
              <View style={styles.featureIcon}>
                <Ionicons name="share-social-outline" size={20} color={isDark ? '#B0B0B0' : '#666666'} />
              </View>
              <Text style={[
                styles.featureText,
                { color: isDark ? '#B0B0B0' : '#666666' }
              ]}>
                Share Sermon
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[
              styles.featureBox,
              { backgroundColor: theme.colors.secondary }
            ]}>
              <View style={styles.featureIcon}>
                <Ionicons name="bookmark-outline" size={20} color={isDark ? '#B0B0B0' : '#666666'} />
              </View>
              <Text style={[
                styles.featureText,
                { color: isDark ? '#B0B0B0' : '#666666' }
              ]}>
                Save for Later
              </Text>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Footer Text */}
          <View style={styles.footer}>
            <Text style={[
              styles.footerText,
              { color: isDark ? '#888888' : '#999999' }
            ]}>
              Tap any button to open in your browser
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
    width: '100%',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 4,
  },
  spacer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  titleCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  sermonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  datePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  urlCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  urlLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 10,
    letterSpacing: 1,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  urlText: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  copyButton: {
    backgroundColor: '#4169E1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  copiedButton: {
    backgroundColor: '#4CAF50',
  },
  copyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 6,
  },
  actionSubtitle: {
    fontSize: 13,
  },
  mainActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 10,
    shadowColor: "#4169E1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 26,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: -8,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
  },
  activityIndicator: {
    position: 'absolute',
    left: '35%',
  },
  mainButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  featureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 13,
    fontStyle: "italic",
  },
});

export default DownloadSermon;