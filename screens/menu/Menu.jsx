import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../Logic/globalState";
import { useNavigation } from "@react-navigation/native";

const MenuItem = ({ title, onPress, icon }) => {
  const { theme } = useAppContext();
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      {icon && (
        <Ionicons
          name={icon}
          size={24}
          color={"#3da1ee"}
          style={styles.menuIcon}
        />
      )}
      <Text
        style={[
          styles.menuItemText,
          { color: theme.colors.text, fontFamily: "serif", fontSize: 15 },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const MenuSection = ({ title, children }) => {
  const { theme } = useAppContext();

  return (
    <View style={styles.menuSection}>
      {title && (
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text, fontFamily: "serif" },
          ]}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
};

const Menu = () => {
  const { theme } = useAppContext();
  const navigation = useNavigation();
  const navigateTo = (screenName) => {
    navigation.navigate(screenName, {
      transition: {
        animation: "slide_to_left",
        config: {
          duration: 300,
        },
      },
    });
  };

  const closeMenu = () => {
    // You can add any close menu logic here if needed
    navigation.navigate("AllSermons", {
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
        <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
          <Ionicons name="close" size={32} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <MenuSection>
          <MenuItem
            title="Current Sermon"
            onPress={() => navigateTo("currentsermon")}
            icon="book-outline"
          />
          <MenuItem
            title="Current Sermon Info & Notes"
            onPress={() => navigateTo("SermonInfo")}
            icon="information-circle-outline"
          />
        </MenuSection>

        {/* <MenuSection title="My Account">
          <MenuItem 
            title="Login" 
            onPress={() => navigateTo('Login')} 
            icon="log-in-outline"
          />
          <MenuItem 
            title="Alerts" 
            onPress={() => navigateTo('Alerts')} 
            icon="notifications-outline"
          />
          <MenuItem 
            title="My Highlights" 
            onPress={() => navigateTo('Highlights')} 
            icon="bookmark-outline"
          />
          <MenuItem 
            title="My Notes" 
            onPress={() => navigateTo('Notes')} 
            icon="create-outline"
          />
          <MenuItem 
            title="Play History" 
            onPress={() => navigateTo('PlayHistory')} 
            icon="time-outline"
          />
          <MenuItem 
            title="Audio Downloads" 
            onPress={() => navigateTo('Downloads')} 
            icon="download-outline"
          />
        </MenuSection> */}

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
    justifyContent: "flex-end",
    padding: 16,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 16,
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  menuIcon: {
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: "400",
  },
});

export default Menu;
