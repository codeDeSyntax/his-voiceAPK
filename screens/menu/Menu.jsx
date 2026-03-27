import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { useAppContext } from "../../Logic/globalState";
import { useNavigation } from "@react-navigation/native";
import DraggableFloatingButton from "../../components/FloatButton";
import MenuSidebar from "../../components/MenuSidebar";

// Font configuration for Menu
const MENU_FONTS_CONFIG = {
  "ZillaSlab-Regular": require("../../assets/fonts/ZillaSlab-Regular.ttf"),
  "ZillaSlab-SemiBold": require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
};

const Menu = () => {
  const { theme } = useAppContext();
  const navigation = useNavigation();
  const [fontsLoaded] = useFonts(MENU_FONTS_CONFIG);
  const insets = useSafeAreaInsets();

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
      {/* Floating Button */}
      <DraggableFloatingButton />

      {/* Menu Sidebar with safe area insets */}
      <View
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          flex: 1,
        }}
      >
        <MenuSidebar closeMenu={closeMenu} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Menu;
