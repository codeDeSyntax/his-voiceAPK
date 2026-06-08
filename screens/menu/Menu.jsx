import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../../Logic/globalState";
import { useNavigation } from "@react-navigation/native";
import DraggableFloatingButton from "../../components/FloatButton";
import MenuSidebar from "../../components/MenuSidebar";

const Menu = () => {
  const { theme } = useAppContext();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const closeMenu = () => {
    navigation.navigate("AllSermons");
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <DraggableFloatingButton />
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
