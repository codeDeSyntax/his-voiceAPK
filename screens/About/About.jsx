import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useAppContext } from "../../Logic/globalState";
import DraggableFloatingBackButton from "../../components/FloatButton";

function About({ navigation }) {
  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  const { theme } = useAppContext();
  const isDark = theme.dark;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      /> */}

      {/* Modern Header with Blur Effect */}
      {/* <View style={styles.headerContainer}> */}
      {/* <BlurView
          style={StyleSheet.absoluteFill}
          blurType={isDark ? 'dark' : 'light'}
          blurAmount={10}
        /> */}
      {/* <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="chevron-back" size={24} color={theme.colors.primary} />
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>About</Text>
          <View style={styles.headerRight} />
        </View>
      </View> */}
      <DraggableFloatingBackButton />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(700)}
          style={styles.heroContainer}
        >
          <LinearGradient
            colors={isDark ? [theme.colors.primary, theme.colors.primary] : [theme.colors.primary, theme.colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={[styles.heroTitle,{color:theme.colors.text}]}>His Voice</Text>
              <Text style={[styles.heroSubtitle,{color:theme.colors.text}]}>Sermons & Teachings</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.content}>
          {/* About Card */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(700)}
            style={[styles.card, { backgroundColor: theme.colors.secondary }]}
          >
            <View style={styles.cardHeader}>
              <Icon
                name="information-circle-outline"
                size={24}
                color={theme.colors.text}
              />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                About the App
              </Text>
            </View>
            <View style={styles.divider} />
            <Text style={[styles.text, { color: theme.colors.text }]}>
              Welcome to <Text style={styles.highlightText}>His Voice</Text>.
              This app contains audio sermons and transcribed sermons of the
              Prophet Robert Lambert Lee. A sermon may have both audio and text
              versions.
            </Text>
          </Animated.View>

          {/* Apps Card */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(700)}
            style={[styles.card, { backgroundColor: theme.colors.secondary }]}
          >
            <View style={styles.cardHeader}>
              <Icon
                name="apps-outline"
                size={24}
                color={theme.colors.text}
              />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Available Platforms
              </Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.platformButton}
              onPress={() => handleLinkPress("https://hisvoice.tiiny.site")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isDark ? [theme.colors.primary, theme.colors.primary] : [theme.colors.primary, theme.colors.primary]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Icon
                  name="desktop-outline"
                  size={20}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText,{color:theme.colors.text}]}>Desktop Version</Text>
                <Icon name="open-outline" size={18} color={theme.colors.text} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Visit Site Card */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(700)}
            style={[styles.card, { backgroundColor: theme.colors.secondary }]}
          >
            <View style={styles.cardHeader}>
              <Icon
                name="globe-outline"
                size={24}
                color={theme.colors.text}
              />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Website
              </Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.websiteContainer}
              onPress={() => handleLinkPress("https://hisvoice.tiiny.site")}
              activeOpacity={0.7}
            >
              <Icon
                name="link-outline"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={styles.link}>hisvoice.tiiny.site</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Image Card */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(700)}
            style={[
              styles.imageCard,
              { backgroundColor: theme.colors.secondary },
            ]}
          >
            <Image
              source={require("../../assets/siteImg.jpg")}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageText}>Visit this url</Text>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => handleLinkPress("https://hisvoice.tiiny.site")}
              >
                <Text style={styles.imageButtonText}>Explore</Text>
                <Icon name="arrow-forward" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Social Media Section */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(700)}
            style={styles.socialContainer}
          >
            <Text style={[styles.socialTitle, { color: theme.colors.text }]}>
              Contact
            </Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: isDark ? "#333" : "#f1f1f1" },
                ]}
              >
                <Icon
                  name="logo-facebook"
                  size={22}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: isDark ? "#333" : "#f1f1f1" },
                ]}
              >
                <Icon
                  name="logo-twitter"
                  size={22}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: isDark ? "#333" : "#f1f1f1" },
                ]}
              >
                <Icon
                  name="logo-youtube"
                  size={22}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: isDark ? "#333" : "#f1f1f1" },
                ]}
              >
                <Icon
                  name="mail-outline"
                  size={22}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.text }]}>
              © 2025 His Voice App. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header Styles
  headerContainer: {
    height: 100,
    paddingTop: 50,
    borderBottomWidth: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 50,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 4,
    fontFamily: "serif",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "serif",
  },
  headerRight: {
    width: 60, // For balanced header
  },

  // Scroll Content
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    padding: 16,
  },

  // Hero Section
  heroContainer: {
    height: 180,
    marginBottom: 20,
  },
  heroGradient: {
    flex: 1,
    borderRadius: 0,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  heroContent: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    letterSpacing: 1,
    fontFamily: "serif",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 8,
    fontFamily: "serif",
  },

  // Card Styles
  card: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
    fontFamily: "serif",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(150, 150, 150, 0.2)",
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    fontFamily: "serif",
  },
  highlightText: {
    fontWeight: "800",
    color: "#723718",
    fontSize: 18,
    fontFamily: "serif",
  },

  // Button Styles
  platformButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    fontFamily: "serif",
  },

  // Website Link
  websiteContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  link: {
    fontSize: 16,
    color: "#9d4911",
    marginLeft: 10,
    fontWeight: "500",
    fontFamily: "serif",
  },

  // Image Card
  imageCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  image: {
    width: "100%",
    height: 200,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  imageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "serif",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3eb7ee",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  imageButtonText: {
    color: "white",
    marginRight: 4,
    fontWeight: "500",
  },

  // Social Section
  socialContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    fontFamily: "serif",
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },

  // Footer
  footer: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.6,
    fontFamily: "serif",
    textDecorationLine: "line-through",
  },
});

export default About;
