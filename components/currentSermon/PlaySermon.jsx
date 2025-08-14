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
  ToastAndroid,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../../Logic/globalState";
import { useNavigation } from "@react-navigation/native";
import DraggableFloatingBackButton from "../FloatButton";

const DownloadSermon = () => {
  const { selectedSermon, theme } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const audioUrl = selectedSermon?.audioUrl || "";
  const isDark = theme.dark;
  const navigation = useNavigation();

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
    navigation.navigate("audiowebscreen");
   

  };

  // Function to simulate download
  const startDownload = async () => {
    navigation.navigate("audiowebscreen");
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

  // Receipt Header Component
  const ReceiptHeader = () => (
    <View style={styles.receiptHeader}>
      <Text style={[styles.receiptTitle, { color: theme.colors.text }]}>
        DOWNLOAD/PLAY SERMON
      </Text>
      <View style={styles.dottedLine} />
      <Text
        style={[styles.receiptSubtitle, { color: isDark ? "#888" : "#666" }]}
      >
        {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
      </Text>
    </View>
  );

  // Dotted Separator Component
  const DottedSeparator = ({ style }) => (
    <View style={[styles.dottedSeparator, style]}>
      {Array.from({ length: 50 }).map((_, i) => (
        <Text key={i} style={[styles.dot, { color: isDark ? "#444" : "#ccc" }]}>
          •
        </Text>
      ))}
    </View>
  );

  return (
    <View style={[styles.fullScreenContainer]}>
      <ImageBackground
        source={require("../../assets/gradbg.png")}
        style={styles.bgImage}
        resizeMode="cover"
        blurRadius={4}
      >
        <LinearGradient
          colors={[
            isDark ? "rgba(28, 25, 23, 0.47)" : "rgba(250, 250, 250, 0.87)",
            isDark ? "rgba(28, 25, 23, 0.45)" : "rgba(250, 250, 250, 0.95)",
          ]}
          style={StyleSheet.absoluteFill}
        >
          <DraggableFloatingBackButton/>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
              <Text
                style={[styles.backButtonText, { color: theme.colors.text }]}
              >
                Back
              </Text>
            </TouchableOpacity>
            <View style={styles.spacer} />
          </View>

          <ScrollView
            // contentContainerStyle={sty}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              {/* Receipt Paper Container */}
              <Animated.View
                style={[
                  styles.receiptPaper,
                  {
                    // backgroundColor: theme.colors.secondary,
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {/* Receipt Header */}
                <ReceiptHeader />

                {/* Sermon Details */}
                <View style={styles.receiptSection}>
                  <Text
                    style={[
                      styles.sectionLabel,
                      { color: isDark ? "#888" : "#666" },
                    ]}
                  >
                    ITEM DETAILS:
                  </Text>
                  <Text
                    style={[styles.sermonTitle, { color:isDark ? "#f5d60d" : "#69431a" }]}
                  >
                    {selectedSermon?.title || "Sermon Title"}
                  </Text>
                  <View style={styles.receiptRow}>
                    <Text
                      style={[
                        styles.receiptLabel,
                        { color: isDark ? "#aaa" : "#777" },
                      ]}
                    >
                      Minister:
                    </Text>
                    <Text
                      style={[
                        styles.receiptValue,
                        { color: theme.colors.text },
                      ]}
                    >
                      Brother Bob
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text
                      style={[
                        styles.receiptLabel,
                        { color: isDark ? "#aaa" : "#777" },
                      ]}
                    >
                      Date:
                    </Text>
                    <Text
                      style={[
                        styles.receiptValue,
                        { color: theme.colors.text },
                      ]}
                    >
                      {selectedSermon?.date || "Date"}
                    </Text>
                  </View>
                  <View style={styles.receiptRow}>
                    <Text
                      style={[
                        styles.receiptLabel,
                        { color: isDark ? "#aaa" : "#777" },
                      ]}
                    >
                      Format:
                    </Text>
                    <Text
                      style={[
                        styles.receiptValue,
                        { color: theme.colors.text },
                      ]}
                    >
                      Audio MP3
                    </Text>
                  </View>
                </View>

                <DottedSeparator />

                {/* URL Section */}
                <View style={styles.receiptSection}>
                  <Text
                    style={[
                      styles.sectionLabel,
                      { color: isDark ? "#888" : "#666" },
                    ]}
                  >
                    AUDIO URL:
                  </Text>
                  <View
                    style={[
                      styles.urlBox,
                      {
                        backgroundColor: isDark ? "#1a1a1a" : "#f8f8f8",
                        borderColor: isDark ? "#333" : "#ddd",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.urlText,
                        { color: isDark ? "#bbb" : "#58370e" },
                      ]}
                      numberOfLines={2}
                      ellipsizeMode="middle"
                    >
                      {audioUrl || "No URL available"}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.copyBtn,
                        {
                          backgroundColor: isCopied ? "#2d5a2d" : "#404040",
                        },
                      ]}
                      onPress={copyToClipboard}
                      activeOpacity={0.7}
                      disabled={!audioUrl}
                    >
                      <FontAwesome5
                        name={isCopied ? "check" : "copy"}
                        size={12}
                        color="white"
                      />
                      <Text style={styles.copyBtnText}>
                        {isCopied ? "✓" : "COPY"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <DottedSeparator />

                {/* Action Items */}
                <View style={styles.receiptSection}>
                  <Text
                    style={[
                      styles.sectionLabel,
                      { color: isDark ? "#888" : "#666" },
                    ]}
                  >
                    AVAILABLE ACTIONS:
                  </Text>

                  <View style={styles.actionsList}>
                    <TouchableOpacity
                      onPress={openInBrowser}
                      activeOpacity={0.8}
                      disabled={isLoading || !audioUrl}
                      style={[styles.actionItem,{backgroundColor:theme.dark? "#382311" : "#f8f8f8",paddingHorizontal:4,paddingRight:10,borderRadius:20}]}
                    >
                      <View style={styles.actionIcon}>
                        <Ionicons
                          name="play-circle-outline"
                          size={20}
                          color={isDark ? "#bd571b" : "#bd571b"}
                        />
                      </View>
                      <View style={[styles.actionDetails,]}>
                        <Text
                          style={[
                            styles.actionName,
                            { color: theme.colors.text },
                          ]}
                        >
                          Listen to AUDIO
                        </Text>
                        <Text
                          style={[
                            styles.actionDesc,
                            { color: isDark ? "#888" : "#666" },
                          ]}
                        >
                          Play in browser
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.actionPrice,
                          { color: isDark ? "#aaa" : "#777" },
                        ]}
                      >
                        FREE
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={startDownload}
                      activeOpacity={0.8}
                      disabled={isLoading || !audioUrl}
                    style={[styles.actionItem,{backgroundColor:theme.dark? "#382311" : "#f8f8f8",paddingHorizontal:4,paddingRight:10,borderRadius:20}]}
                    >
                      <View style={styles.actionIcon}>
                        <MaterialIcons
                          name="cloud-download"
                          size={20}
                          color={isDark ? "#bd571b" : "#bd571b"}
                        />
                      </View>
                      <View style={styles.actionDetails}>
                        <Text
                          style={[
                            styles.actionName,
                            { color: theme.colors.text },
                          ]}
                        >
                          DOWNLOAD AUDIO
                        </Text>
                        <Text
                          style={[
                            styles.actionDesc,
                            { color: isDark ? "#888" : "#666" },
                          ]}
                        >
                          Save for offline
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.actionPrice,
                          { color: isDark ? "#aaa" : "#777" },
                        ]}
                      >
                        FREE
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <DottedSeparator />

                <DottedSeparator />

              </Animated.View>

              {/* Main Action Button */}
              <Animated.View
                style={[
                  {
                    opacity: fadeAnim,
                    transform: [
                      { scale: scaleAnim },
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
               
              </Animated.View>

              {/* Additional Options */}
              <Animated.View
                style={[
                  styles.additionalOptions,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              ></Animated.View>
            </View>
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
  },
  bgImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlayContent: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 44,
    paddingHorizontal: 0,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 44,
    height: 60,
    width: "100%",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
  },
  spacer: {
    flex: 1,
  },

  container: {
    flex: 1,
    padding: 20,
    // paddingBottom: 40,
  },
  receiptPaper: {
    borderRadius: 8,
    padding: 20,
    // marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // elevation: 5,
    // borderWidth: 1,
    // borderColor: "rgba(0,0,0,0.05)",
  },
  receiptHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  receiptTitle: {
    fontSize: 16,
    // fontWeight: "bold",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  receiptSubtitle: {
    fontSize: 12,
    marginTop: 8,
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  dottedLine: {
    width: "80%",
    height: 1,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderStyle: "dotted",
    borderColor: "#888",
    marginVertical: 8,
  },
  dottedSeparator: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 15,
    opacity: 0.6,
  },
  dot: {
    fontSize: 8,
    marginHorizontal: 1,
  },
  receiptSection: {
    marginVertical: 12,
  },
  sectionLabel: {
    fontSize: 12,
    // fontWeight: "bold",
    letterSpacing: 1.5,
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  sermonTitle: {
    fontSize: 16,
    // fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  receiptLabel: {
    fontSize: 14,
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  urlBox: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    borderStyle: "dashed",
  },
  urlText: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
    marginBottom: 8,
  },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  copyBtnText: {
    color: "white",
    fontSize: 10,
    // fontWeight: "bold",
    marginLeft: 4,
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  actionsList: {
    marginTop: 8,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginVertical:2
  },
  actionIcon: {
    width: 30,
    alignItems: "center",
  },
  actionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  actionName: {
    fontSize: 14,
    // fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  actionDesc: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  actionPrice: {
    fontSize: 14,
    // fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#333",
    borderStyle: "dashed",
  },
  totalLabel: {
    fontSize: 16,
    // fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  totalValue: {
    fontSize: 16,
    // fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  freeLabel: {
    textAlign: "center",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 8,
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  receiptFooter: {
    alignItems: "center",
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    marginVertical: 2,
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  barcode: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 30,
    marginTop: 12,
  },
  barcodeBar: {
    height: Math.random() * 20 + 10,
    marginHorizontal: 0.5,
  },
  mainActionButton: {
    borderRadius: 8,
    overflow: "hidden",
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 26,
  },
  progressBarContainer: {
    position: "absolute",
    bottom: -8,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
  activityIndicator: {
    position: "absolute",
    left: "35%",
  },
  mainButtonText: {
    color: "white",
    fontSize: 16,
    // fontWeight: "bold",
    marginLeft: 10,
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
  additionalOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  optionText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 8,
    fontFamily: Platform.OS === "ios" ? "ZillaSlab" : "ZillaSlab",
  },
});

export default DownloadSermon;
