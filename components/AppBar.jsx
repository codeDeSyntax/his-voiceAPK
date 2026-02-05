import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { styles } from "../styles/Allsermons";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { responsiveFontSize } from "../Utils/responsiveUtils";
import { useFonts } from "expo-font";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ListAppBar = ({
  theme,
  viewMode = "table",
  toggleViewMode,
  setIsLetterModalVisible,
  setIsYearModalVisible,
  filterOnlyText,
  filterOnlyAudio,
  toggleSortOrder,
  restoreOriginalOrder,
  isOriginalOrder,
  hasActiveFilters,
}) => {
  const router = useNavigation();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Philosopher: require("../assets/fonts/Philosopher-Regular.ttf"),
  });

  const openImageModal = () => {
    setImageModalVisible(true);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeImageModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setImageModalVisible(false));
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        paddingTop: insets.top + 8,
        paddingBottom: 16,
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Logo Image */}
          <TouchableOpacity onPress={openImageModal} activeOpacity={0.7}>
            <Image
              source={require("../assets/roundedLam.jpg")}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
            />
          </TouchableOpacity>

          {/* Home Button */}
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.dark
                ? "rgba(255, 255, 255, 0.06)"
                : "rgba(93, 50, 17, 0.06)",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => {
              router?.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "welcome" }],
                }),
              );
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="home-outline" size={22} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.dark
                ? "rgba(255, 255, 255, 0.06)"
                : "rgba(93, 50, 17, 0.06)",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => router?.navigate("Search")}
            activeOpacity={0.7}
          >
            <Ionicons
              name="search-outline"
              size={22}
              color={theme.colors.text}
            />
          </TouchableOpacity>

          <View style={{ position: "relative" }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.dark
                  ? "rgba(255, 255, 255, 0.06)"
                  : "rgba(93, 50, 17, 0.06)",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                setFiltersVisible(!filtersVisible);
                setMenuVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="options-outline"
                size={22}
                color={theme.colors.text}
              />
              {hasActiveFilters && (
                <View
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#ef4444",
                  }}
                />
              )}
            </TouchableOpacity>

            {/* Filters Dropdown - Inline */}
            {filtersVisible && (
              <View style={menuStyles.dropdownWrapper}>
                <View
                  style={[
                    menuStyles.dropdown,
                    {
                      backgroundColor: theme.dark ? "#2c2420" : "#ffffff",
                      borderColor: theme.dark
                        ? "rgba(242, 205, 180, 0.15)"
                        : "rgba(93, 50, 17, 0.15)",
                    },
                  ]}
                >
                  <View style={menuStyles.dropdownHeader}>
                    <Text
                      style={[
                        menuStyles.dropdownTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Filters & Sort
                    </Text>
                    <TouchableOpacity onPress={() => setFiltersVisible(false)}>
                      <Ionicons
                        name="close"
                        size={20}
                        color={theme.colors.text}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={menuStyles.divider} />

                  <ScrollView style={{ maxHeight: 350 }}>
                    <DropdownItem
                      icon="text-outline"
                      label="Filter by Letter"
                      onPress={() => {
                        setFiltersVisible(false);
                        setIsLetterModalVisible(true);
                      }}
                      theme={theme}
                    />
                    <DropdownItem
                      icon="calendar-outline"
                      label="Filter by Year"
                      onPress={() => {
                        setFiltersVisible(false);
                        setIsYearModalVisible(true);
                      }}
                      theme={theme}
                    />

                    <View style={[menuStyles.divider, { marginVertical: 4 }]} />

                    <DropdownItem
                      icon="document-text-outline"
                      label="Text Only"
                      onPress={() => {
                        setFiltersVisible(false);
                        filterOnlyText();
                      }}
                      theme={theme}
                      highlight={hasActiveFilters}
                    />
                    <DropdownItem
                      icon="musical-notes-outline"
                      label="Audio Only"
                      onPress={() => {
                        setFiltersVisible(false);
                        filterOnlyAudio();
                      }}
                      theme={theme}
                      highlight={hasActiveFilters}
                    />

                    <View style={[menuStyles.divider, { marginVertical: 4 }]} />

                    <DropdownItem
                      icon={
                        isOriginalOrder ? "swap-vertical" : "funnel-outline"
                      }
                      label="Toggle Sort"
                      onPress={() => {
                        setFiltersVisible(false);
                        toggleSortOrder();
                      }}
                      theme={theme}
                    />
                    <DropdownItem
                      icon="refresh-outline"
                      label="Reset Filters"
                      onPress={() => {
                        setFiltersVisible(false);
                        restoreOriginalOrder();
                      }}
                      theme={theme}
                      highlight={hasActiveFilters}
                    />
                  </ScrollView>
                </View>
              </View>
            )}
          </View>

          <View style={{ position: "relative" }}>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.dark
                  ? "rgba(255, 255, 255, 0.06)"
                  : "rgba(93, 50, 17, 0.06)",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                setMenuVisible(!menuVisible);
                setFiltersVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="menu-outline"
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>

            {/* Main Menu Dropdown - Inline */}
            {menuVisible && (
              <View style={menuStyles.dropdownWrapper}>
                <View
                  style={[
                    menuStyles.dropdown,
                    {
                      backgroundColor: theme.dark ? "#2c2420" : "#ffffff",
                      borderColor: theme.dark
                        ? "rgba(242, 205, 180, 0.15)"
                        : "rgba(93, 50, 17, 0.15)",
                    },
                  ]}
                >
                  <View style={menuStyles.dropdownHeader}>
                    <Text
                      style={[
                        menuStyles.dropdownTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      Quick Actions
                    </Text>
                    <TouchableOpacity onPress={() => setMenuVisible(false)}>
                      <Ionicons
                        name="close"
                        size={20}
                        color={theme.colors.text}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={menuStyles.divider} />

                  <ScrollView style={{ maxHeight: 350 }}>
                    <DropdownItem
                      icon="home-outline"
                      label="Home"
                      onPress={() => {
                        setMenuVisible(false);
                        router?.navigate("welcome");
                      }}
                      theme={theme}
                      showChevron
                    />
                    <DropdownItem
                      icon="search-outline"
                      label="Search"
                      onPress={() => {
                        setMenuVisible(false);
                        router?.navigate("Search");
                      }}
                      theme={theme}
                      showChevron
                    />
                    <DropdownItem
                      icon="bookmark-outline"
                      label="Bookmarks"
                      onPress={() => {
                        setMenuVisible(false);
                        router?.navigate("bookmarks");
                      }}
                      theme={theme}
                      showChevron
                    />
                    <DropdownItem
                      icon="information-circle-outline"
                      label="About"
                      onPress={() => {
                        setMenuVisible(false);
                        router?.navigate("About");
                      }}
                      theme={theme}
                      showChevron
                    />

                    <View style={[menuStyles.divider, { marginVertical: 4 }]} />

                    <DropdownItem
                      icon="settings-outline"
                      label="Settings"
                      onPress={() => {
                        setMenuVisible(false);
                        router?.navigate("Settings");
                      }}
                      theme={theme}
                      showChevron
                    />
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Invisible overlay to close dropdowns when clicking outside */}
      {(menuVisible || filtersVisible) && (
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: 10000,
          }}
          onPress={() => {
            setMenuVisible(false);
            setFiltersVisible(false);
          }}
        />
      )}

      {/* Image Modal - Passport Size */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeImageModal}
      >
        <Animated.View
          style={[
            {
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              alignItems: "center",
              justifyContent: "center",
            },
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
            activeOpacity={1}
            onPress={closeImageModal}
          >
            <Image
              source={require("../assets/roundedLam.jpg")}
              style={{
                width: 220,
                height: 280,
                borderRadius: 12,
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: insets.top + 16,
              right: 16,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={closeImageModal}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </View>
  );
};

// Dropdown item component
const DropdownItem = ({
  icon,
  label,
  onPress,
  theme,
  highlight = false,
  showChevron = false,
}) => (
  <Pressable
    style={({ pressed }) => [
      menuStyles.item,
      {
        backgroundColor: pressed
          ? theme.dark
            ? "rgba(242, 205, 180, 0.08)"
            : "rgba(93, 50, 17, 0.08)"
          : "transparent",
      },
    ]}
    onPress={onPress}
    android_ripple={{
      color: theme.dark
        ? "rgba(242, 205, 180, 0.12)"
        : "rgba(93, 50, 17, 0.12)",
    }}
  >
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: highlight
          ? theme.dark
            ? "rgba(255, 107, 107, 0.12)"
            : "rgba(231, 76, 60, 0.1)"
          : theme.dark
            ? "rgba(80, 61, 49, 0.4)"
            : "rgba(93, 50, 17, 0.06)",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons
        name={icon}
        size={18}
        color={
          highlight ? (theme.dark ? "#ff6b6b" : "#e74c3c") : theme.colors.text
        }
      />
    </View>
    <Text
      style={[
        menuStyles.itemText,
        {
          color: highlight
            ? theme.dark
              ? "#ff6b6b"
              : "#e74c3c"
            : theme.colors.text,
          flex: 1,
          fontFamily: "ZillaSlab",
        },
      ]}
    >
      {label}
    </Text>
    {showChevron && (
      <Ionicons
        name="chevron-forward"
        size={16}
        color={theme.colors.text + "60"}
      />
    )}
  </Pressable>
);

const menuStyles = StyleSheet.create({
  dropdownWrapper: {
    position: "absolute",
    top: 48,
    right: 0,
    minWidth: 240,
    zIndex: 1000,
  },
  dropdown: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    opacity: 0.3,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  itemText: {
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
});

export default ListAppBar;
