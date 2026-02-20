import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ToastAndroid,
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useFonts } from "expo-font";
import { useAppContext } from "../../Logic/globalState";
import { useNavigation } from "@react-navigation/native";
import DraggableFloatingButton from "../../components/FloatButton";

const { width, height } = Dimensions.get("window");

// Font configuration for Menu
const MENU_FONTS_CONFIG = {
  "ZillaSlab-Regular": require("../../assets/fonts/ZillaSlab-Regular.ttf"),
  "ZillaSlab-SemiBold": require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
};

const MenuItem = ({ title, onPress, icon, crossed, subtitle, isSpecial }) => {
  const { theme } = useAppContext();
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 400,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 400,
      friction: 10,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      style={styles.menuItemWrapper}
    >
      <Animated.View
        style={[
          styles.menuItem,
          {
            backgroundColor: theme.dark
              ? isSpecial
                ? "rgba(213, 122, 62, 0.08)"
                : "rgba(255, 255, 255, 0.03)"
              : isSpecial
                ? "rgba(93, 50, 17, 0.08)"
                : "rgba(0, 0, 0, 0.02)",
            borderColor: theme.dark
              ? isSpecial
                ? "rgba(213, 122, 62, 0.2)"
                : "rgba(255, 255, 255, 0.08)"
              : isSpecial
                ? "rgba(93, 50, 17, 0.2)"
                : "rgba(0, 0, 0, 0.05)",
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconBackground,
              {
                backgroundColor: theme.dark
                  ? isSpecial
                    ? "rgba(213, 122, 62, 0.15)"
                    : "rgba(255, 255, 255, 0.08)"
                  : isSpecial
                    ? "rgba(93, 50, 17, 0.15)"
                    : "rgba(0, 0, 0, 0.05)",
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={22}
              color={
                theme.dark
                  ? isSpecial
                    ? theme.colors.hlight
                    : theme.colors.text
                  : isSpecial
                    ? "#5d3211"
                    : theme.colors.text
              }
            />
          </View>
        </View>

        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.menuItemText,
              {
                color: theme.colors.text,
                fontFamily: "ZillaSlab",
                textDecorationLine: crossed ? "line-through" : "none",
                opacity: crossed ? 0.5 : 1,
              },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitleText, { color: theme.colors.text + "80" }]}
            >
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={theme.colors.text + "40"}
          />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const MenuSection = ({ title, children, icon }) => {
  const { theme } = useAppContext();

  return (
    <View style={styles.menuSection}>
      {title && (
        <View style={styles.sectionHeader}>
          {icon && (
            <View
              style={[
                styles.sectionIconContainer,
                {
                  backgroundColor: theme.dark
                    ? "rgba(213, 122, 62, 0.1)"
                    : "rgba(93, 50, 17, 0.1)",
                },
              ]}
            >
              <MaterialIcons
                name={icon}
                size={20}
                color={theme.dark ? theme.colors.hlight : "#5d3211"}
              />
            </View>
          )}
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontFamily: "ZillaSlab",
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

const Menu = () => {
  const { theme } = useAppContext();
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts(MENU_FONTS_CONFIG);
  const insets = useSafeAreaInsets();

  const navigateTo = (screenName) => {
    navigation.navigate(screenName);
  };

  const closeMenu = () => {
    navigation.navigate("AllSermons");
  };

  // Wait for fonts to load
  if (!fontsLoaded) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View
          style={{
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            flex: 1,
          }}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: theme.colors.text, fontFamily: "ZillaSlab" }}>
              Loading...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Background with gradient overlay */}
      <ImageBackground
        source={require("../../assets/gradbg.png")}
        style={styles.backgroundImage}
        blurRadius={3}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            theme.dark ? "rgba(28, 25, 23, 0.85)" : "rgba(250, 250, 250, 0.90)",
            theme.dark ? "rgba(28, 25, 23, 0.95)" : "rgba(250, 250, 250, 0.95)",
          ]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <DraggableFloatingButton />

      <View
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          flex: 1,
        }}
      >
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Menu
            </Text>
            <TouchableOpacity
              onPress={closeMenu}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.dark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.05)",
                },
              ]}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick Actions Section */}
          <MenuSection icon="star">
            <MenuItem
              title="Current Sermon"
              subtitle="Continue reading where you left off"
              onPress={() => navigateTo("currentsermon")}
              icon="book-outline"
              isSpecial={true}
            />
            <MenuItem
              title="My Bookmarks"
              subtitle="Saved passages and highlights"
              onPress={() => navigateTo("bookmarks")}
              icon="bookmark-outline"
              isSpecial={true}
            />
          </MenuSection>

          {/* Main Navigation */}
          <MenuSection title="Explore" icon="explore">
            <MenuItem
              title="All Sermons"
              subtitle="Browse the complete collection"
              onPress={() => navigateTo("AllSermons")}
              icon="library-outline"
            />
            <MenuItem
              title="Search"
              subtitle="Find specific topics or phrases"
              onPress={() => navigateTo("Search")}
              icon="search-outline"
            />
          </MenuSection>

          {/* Settings & Info */}
          <MenuSection title="More" icon="settings">
            <MenuItem
              title="Settings"
              subtitle="Customize your reading experience"
              onPress={() => navigateTo("Settings")}
              icon="settings-outline"
            />
            <MenuItem
              title="About"
              subtitle="App information and credits"
              onPress={() => navigateTo("About")}
              icon="information-circle-outline"
            />
            <MenuItem
              title="Sermon Notes"
              subtitle="Coming soon - Take and manage notes"
              onPress={() => {
                if (Platform.OS === "android") {
                  ToastAndroid.show(
                    "Feature coming soon! 🚀",
                    ToastAndroid.SHORT,
                  );
                } else {
                  Alert.alert(
                    "Coming Soon",
                    "This feature is under development 🚀",
                  );
                }
              }}
              icon="create-outline"
              crossed={true}
            />
          </MenuSection>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "ZillaSlab",
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  menuSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "ZillaSlab",
    letterSpacing: 0.3,
  },
  sectionContent: {
    gap: 8,
  },
  menuItemWrapper: {
    marginBottom: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    // ...Platform.select({
    //   ios: {
    //     shadowColor: "#000",
    //     shadowOffset: { width: 0, height: 1 },
    //     shadowOpacity: 0.05,
    //     shadowRadius: 3,
    //   },
    //   android: {
    //     elevation: 1,
    //   },
    // }),
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 17,
    fontWeight: "500",
    fontFamily: "ZillaSlab",
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: "400",
    fontFamily: "ZillaSlab",
    marginTop: 3,
    letterSpacing: 0.1,
    lineHeight: 16,
  },
  arrowContainer: {
    marginLeft: 12,
  },
});

export default Menu;
