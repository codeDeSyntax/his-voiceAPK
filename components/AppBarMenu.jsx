import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ImageBackground,
  Modal,
  Animated,
  Easing,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
  Feather,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Menu item component with flexible icon support
const MenuItem = ({
  icon,
  iconSource = "ionicons",
  iconSize = 24,
  label,
  onPress,
  theme,
  highlight = false,
  showChevron = false,
  subtitle,
}) => {
  const dark = theme.dark;
  const activeColor = dark
    ? "rgba(242, 205, 180, 0.92)"
    : "rgba(93, 50, 17, 0.82)";
  const textColor = highlight ? activeColor : theme.colors.text;
  const iconColor = highlight
    ? activeColor
    : dark
      ? "rgba(242, 205, 180, 0.75)"
      : "rgba(93, 50, 17, 0.68)";

  const ICON_COMPONENTS = {
    ionicons: Ionicons,
    antdesign: AntDesign,
    materialcommunityicons: MaterialCommunityIcons,
    materialicons: MaterialIcons,
    feather: Feather,
  };

  const renderIcon = () => {
    const iconConfig =
      typeof icon === "object" && icon !== null
        ? {
            name: icon.name,
            source: icon.source || iconSource,
            size: icon.size || iconSize,
          }
        : {
            name: icon,
            source: iconSource,
            size: iconSize,
          };

    const sourceKey = String(iconConfig.source || "ionicons").toLowerCase();
    const IconComponent = ICON_COMPONENTS[sourceKey] || Ionicons;

    return (
      <IconComponent
        name={iconConfig.name}
        size={iconConfig.size}
        color={iconColor}
      />
    );
  };

  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginHorizontal: 8,
        marginVertical: 2,
        borderRadius: 14,
        backgroundColor: highlight
          ? dark
            ? "rgba(242, 205, 180, 0.10)"
            : "rgba(93, 50, 17, 0.075)"
          : pressed
          ? dark
            ? "rgba(242, 205, 180, 0.08)"
            : "rgba(93, 50, 17, 0.052)"
          : "transparent",
      })}
      onPress={onPress}
      android_ripple={{
        color: dark ? "rgba(242, 205, 180, 0.08)" : "rgba(93, 50, 17, 0.05)",
        borderless: false,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: highlight
            ? dark
              ? "rgba(242, 205, 180, 0.12)"
              : "rgba(93, 50, 17, 0.10)"
            : dark
              ? "rgba(242, 205, 180, 0.065)"
              : "rgba(93, 50, 17, 0.055)",
        }}
      >
        {renderIcon()}
      </View>
      <View style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
        <Text
          style={{
            fontSize: 14,
            color: textColor,
            fontFamily: "Merriweather",
            letterSpacing: 0.1,
          }}
        >
          {label}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontSize: 11,
              color: dark
                ? "rgba(242, 205, 180, 0.35)"
                : "rgba(93, 50, 17, 0.35)",
              fontFamily: "Merriweather",
              marginTop: 1,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={15}
          color={dark ? "rgba(242, 205, 180, 0.28)" : "rgba(93, 50, 17, 0.28)"}
        />
      )}
    </Pressable>
  );
};

// Section divider with label
const SectionDivider = ({ label, theme }) => {
  const dark = theme.dark;
  return (
    <View style={{ marginTop: 12, marginBottom: 5 }}>
      <View
        style={{
          height: StyleSheet.hairlineWidth,
          backgroundColor: dark
            ? "rgba(242, 205, 180, 0.085)"
            : "rgba(93, 50, 17, 0.075)",
          marginHorizontal: 18,
          marginBottom: label ? 9 : 0,
        }}
      />
      {label && (
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            color: dark
              ? "rgba(242, 205, 180, 0.38)"
              : "rgba(93, 50, 17, 0.38)",
            paddingHorizontal: 20,
            paddingBottom: 1,
            fontFamily: "ZillaSlab-SemiBold",
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

const FilterIconButton = ({ icon, label, onPress, theme, active = false }) => {
  const dark = theme.dark;
  const color = active
    ? dark
      ? "#f2cdb4"
      : "#5d3211"
    : dark
      ? "rgba(242,205,180,0.70)"
      : "rgba(93,50,17,0.62)";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={`sidebar-filter-${label.toLowerCase().replace(/\s+/g, "-")}`}
      style={({ pressed }) => ({
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: active
          ? dark
            ? "rgba(242,205,180,0.13)"
            : "rgba(93,50,17,0.11)"
          : pressed
            ? dark
              ? "rgba(242,205,180,0.10)"
              : "rgba(93,50,17,0.08)"
          : dark
            ? "rgba(242,205,180,0.065)"
            : "rgba(93,50,17,0.055)",
        borderWidth: active ? 1 : 0,
        borderColor: active
          ? dark
            ? "rgba(242,205,180,0.26)"
            : "rgba(93,50,17,0.18)"
          : "transparent",
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <Ionicons name={icon} size={22} color={color} />
    </Pressable>
  );
};

// Main AppBar Menu component
const AppBarMenu = ({
  visible,
  onClose,
  theme,
  filterOnlyText,
  filterOnlyAudio,
  toggleSortOrder,
  restoreOriginalOrder,
  isOriginalOrder,
  hasActiveFilters,
}) => {
  const router = useNavigation();
  const insets = useSafeAreaInsets();
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMenuModalVisible(true);
      menuAnim.setValue(0);
      Animated.timing(menuAnim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else if (menuModalVisible) {
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setMenuModalVisible(false));
    }
  }, [visible, menuModalVisible, menuAnim]);

  const closeMenuAndNavigate = useCallback(
    (screenName) => {
      onClose();
      router?.navigate(screenName);
    },
    [onClose, router],
  );

  const closeMenuAndExecute = useCallback(
    (callback) => {
      onClose();
      callback();
    },
    [onClose],
  );

  if (!menuModalVisible) return null;

  return (
    <Modal
      visible={menuModalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          opacity: menuAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          }),
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Sidebar */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "80%",
          backgroundColor: theme.dark ? "#1b1410" : "#fbefd5",
          paddingTop: insets.top + 14,
          paddingHorizontal: 10,
          paddingBottom: insets.bottom + 16,
          borderLeftWidth: 0.5,
          borderLeftColor: theme.dark
            ? "rgba(242, 205, 180, 0.12)"
            : "rgba(93, 50, 17, 0.10)",
          borderTopLeftRadius: 28,
          borderBottomLeftRadius: 28,
          overflow: "hidden",
          transform: [
            {
              translateX: menuAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [46, 0],
              }),
            },
          ],
          opacity: menuAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.92, 1],
          }),
        }}
      >
        <View pointerEvents="none" style={styles.topImageWrap}>
          <ImageBackground
            source={require("../assets/browntrees.jpg")}
            style={styles.topImage}
            resizeMode="cover"
          >
            <LinearGradient
              colors={
                theme.dark
                  ? [
                      "rgba(26, 19, 16, 0.1)",
                      "rgba(26, 19, 16, 0.7)",
                      "#1a1310",
                    ]
                  : [
                      "rgba(250, 238, 209, 0.08)",
                      "rgba(250, 238, 209, 0.66)",
                      "#faeed1",
                    ]
              }
              locations={[0, 0.32, 0.6]}
              style={StyleSheet.absoluteFill}
            />
          </ImageBackground>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 10,
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.dark
                    ? "rgba(242,205,180,0.10)"
                    : "rgba(93,50,17,0.08)",
                  borderWidth: 1,
                  borderColor: theme.dark
                    ? "rgba(242, 205, 180, 0.16)"
                    : "rgba(93, 50, 17, 0.12)",
                }}
              >
                <Image
                  source={require("../assets/adaptive-icon.png")}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                  }}
                />
              </View>
              <View style={{ marginLeft: 11, flex: 1 }}>
                <Text
                  style={{
                    fontSize: 19,
                    fontFamily: "ZillaSlab-SemiBold",
                    color: theme.colors.text,
                  }}
                  numberOfLines={1}
                >
                  HisVoice
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: "ZillaSlab",
                    color: theme.dark
                      ? "rgba(242,205,180,0.44)"
                      : "rgba(93,50,17,0.44)",
                    marginTop: 1,
                  }}
                  numberOfLines={1}
                >
                  Sermon Library
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              testID="sidebar-close-button"
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed
                  ? theme.dark
                    ? "rgba(242, 205, 180, 0.16)"
                    : "rgba(93, 50, 17, 0.12)"
                  : theme.dark
                    ? "rgba(242, 205, 180, 0.1)"
                    : "rgba(93, 50, 17, 0.08)",
              })}
            >
              <Ionicons
                name="chevron-back"
                size={19}
                color={
                  theme.dark
                    ? "rgba(242, 205, 180, 0.85)"
                    : "rgba(93, 50, 17, 0.8)"
                }
              />
            </Pressable>
          </View>

          {/* General Section */}
          <SectionDivider label="General" theme={theme} />
          <MenuItem
            icon="maps-home-work"
            label="Home"
            subtitle="Opening screen"
            onPress={() => closeMenuAndNavigate("welcome")}
            theme={theme}
            showChevron
            iconSource="materialicons"
          />
          <MenuItem
            icon="search-circle-sharp"
            label="Search"
            subtitle="Search all sermons"
            onPress={() => closeMenuAndNavigate("Search")}
            theme={theme}
            showChevron
          />
          <MenuItem
            icon="bookmarks"
            label="Bookmarks"
            subtitle="Saved paragraphs"
            onPress={() => closeMenuAndNavigate("bookmarks")}
            theme={theme}
            showChevron
            iconSource="materialicons"
          />
          <MenuItem
            icon="history"
            label="Recents"
            subtitle="Recently opened"
            onPress={() => closeMenuAndNavigate("Recents")}
            theme={theme}
            showChevron
            iconSource="materialcommunityicons"
          />

          {/* Tools Section */}
          <SectionDivider label="Tools" theme={theme} />
          <MenuItem
            icon="information-circle"
            label="About"
            subtitle="App information"
            onPress={() => closeMenuAndNavigate("About")}
            theme={theme}
            showChevron
          />
          <MenuItem
            icon="settings"
            label="Settings"
            subtitle="Display and app"
            onPress={() => closeMenuAndNavigate("Settings")}
            theme={theme}
            showChevron
          />

          {/* Filters Section */}
          <SectionDivider label="Filters" theme={theme} />
          <View style={styles.filterButtonRow}>
            <FilterIconButton
              icon="document-text-outline"
              label="Text only"
              onPress={() => closeMenuAndExecute(filterOnlyText)}
              theme={theme}
              active={hasActiveFilters}
            />
            <FilterIconButton
              icon="musical-notes-outline"
              label="Audio only"
              onPress={() => closeMenuAndExecute(filterOnlyAudio)}
              theme={theme}
              active={hasActiveFilters}
            />
            <FilterIconButton
              icon={isOriginalOrder ? "swap-vertical" : "funnel-outline"}
              label="Toggle sort"
              onPress={() => closeMenuAndExecute(toggleSortOrder)}
              theme={theme}
            />
            <FilterIconButton
              icon="refresh-outline"
              label="Reset all filters"
              onPress={() => closeMenuAndExecute(restoreOriginalOrder)}
              theme={theme}
              active={hasActiveFilters}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  filterButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 8,
  },
  topImageWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "34%",
  },
  topImage: {
    width: "100%",
    height: "100%",
  },
});

export default AppBarMenu;
