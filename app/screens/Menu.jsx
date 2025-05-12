import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../Logic/globalState";
import { useRouter } from "expo-router";

const MenuItem = ({ title, onPress, icon }) => {
  const { theme } = useAppContext();

  return (
    <TouchableOpacity
      style={[
        styles.menuCard,
        {
          backgroundColor: theme.dark
            ? theme.colors.secondary
            : theme.colors.background,
          shadowColor: theme.dark ? "rgba(0,0,0,0)" : "#000",
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuCardContent}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.dark
                ? "rgba(61, 161, 238, 0.2)"
                : "rgba(61, 161, 238, 0.1)",
            },
          ]}
        >
          <Ionicons name={icon} size={22} color={"#3da1ee"} />
        </View>
        <Text
          style={[
            styles.menuItemText,
            {
              color: theme.colors.text,
              fontFamily: "serif",
            },
          ]}
        >
          {title}
        </Text>
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.dark ? "#6e6e6e" : "#c7c7c7"}
        />
      </View>
    </TouchableOpacity>
  );
};

const MenuSection = ({ title, children }) => {
  const { theme } = useAppContext();

  return (
    <View style={styles.menuSection}>
      {title && (
        <View style={styles.sectionTitleContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontFamily: "serif" },
            ]}
          >
            {title}
          </Text>
          <View
            style={[styles.titleLine, { backgroundColor: theme.colors.text }]}
          />
        </View>
      )}
      <View style={styles.cardsContainer}>{children}</View>
    </View>
  );
};

const Menu = () => {
  const { theme } = useAppContext();
  const router = useRouter();

  const navigateTo = (screenName) => {
    router.push(`screens/${screenName}`, {
      transition: {
        animation: "slide_to_left",
        config: {
          duration: 300,
        },
      },
    });
  };

  const closeMenu = () => {
    router.navigate("screens/AllSermons", {
      transition: {
        animation: "slide_to_left",
        config: {
          duration: 50,
        },
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.primary }]}
    >
      <View style={styles.header}>
        <View style={styles.appTitleContainer}>
          <Text
            style={[
              styles.appTitle,
              { color: theme.colors.text, fontFamily: "serif" },
            ]}
          >
            His Voice
          </Text>
        </View>
        <TouchableOpacity
          onPress={closeMenu}
          style={[
            styles.closeButton,
            {
              backgroundColor: theme.dark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
        >
          <Ionicons name="close" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <MenuSection>
          <MenuItem
            title="Current Sermon"
            onPress={() => navigateTo("CurrentSermon")}
            icon="book-outline"
          />
        </MenuSection>

        <MenuSection title="Options">
          <MenuItem
            title="Settings"
            onPress={() => navigateTo("Settings")}
            icon="settings-outline"
          />
          <MenuItem
            title="All Sermons"
            onPress={() => navigateTo("AllSermons")}
            icon="library-outline"
          />
          <MenuItem
            title="Search"
            onPress={() => navigateTo("Search")}
            icon="search-outline"
          />
          <MenuItem
            title="Recent"
            onPress={() => navigateTo("Recent")}
            icon="time-outline"
          />
          <MenuItem
            title="About"
            onPress={() => navigateTo("About")}
            icon="information-circle-outline"
          />
        </MenuSection>

        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              { color: theme.colors.text + "80", fontFamily: "serif" },
            ]}
          >
            © 2025 His Voice App
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  appTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  menuSection: {
    marginBottom: 30,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginRight: 12,
  },
  titleLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  cardsContainer: {
    gap: 12,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  menuCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  arrowContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
  },
});

export default Menu;