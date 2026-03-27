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
        paddingHorizontal: 16,
        paddingVertical: 7,
        marginHorizontal: 6,
        marginVertical: 1,
        borderRadius: 12,
        backgroundColor: pressed
          ? dark
            ? "rgba(242, 205, 180, 0.07)"
            : "rgba(93, 50, 17, 0.045)"
          : "transparent",
      })}
      onPress={onPress}
      android_ripple={{
        color: dark ? "rgba(242, 205, 180, 0.08)" : "rgba(93, 50, 17, 0.05)",
        borderless: false,
      }}
    >
      {renderIcon()}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{
            fontSize: 14.5,
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
          size={14}
          color={dark ? "rgba(242, 205, 180, 0.2)" : "rgba(93, 50, 17, 0.2)"}
        />
      )}
    </Pressable>
  );
};

// Section divider with label
const SectionDivider = ({ label, theme }) => {
  const dark = theme.dark;
  return (
    <View style={{ marginTop: 4, marginBottom: 3 }}>
      <View
        style={{
          height: StyleSheet.hairlineWidth,
          backgroundColor: dark
            ? "rgba(242, 205, 180, 0.1)"
            : "rgba(93, 50, 17, 0.08)",
          marginHorizontal: 20,
          marginBottom: label ? 8 : 0,
        }}
      />
      {label && (
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 0.8,
            textTransform: "uppercase",
            color: dark ? "rgba(242, 205, 180, 0.3)" : "rgba(93, 50, 17, 0.3)",
            paddingHorizontal: 22,
            paddingBottom: 2,
            fontFamily: "cursive",
          }}
        >
          {label}
        </Text>
      )}
    </View>
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
          width: "75%",
          backgroundColor: theme.dark ? "#1a1310" : "#faeed1",
          paddingTop: insets.top + 16,
          paddingHorizontal: 8,
          paddingBottom: insets.bottom + 16,
          borderLeftWidth: 0.5,
          borderLeftColor: theme.dark
            ? "rgba(242, 205, 180, 0.1)"
            : "rgba(93, 50, 17, 0.08)",
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
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

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 12,
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#341c09",
                  borderWidth: 1,
                  borderColor: theme.dark
                    ? "rgba(242, 205, 180, 0.18)"
                    : "rgba(93, 50, 17, 0.14)",
                }}
              >
                <Image
                  source={require("../assets/adaptive-icon.png")}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                  }}
                />
              </View>
              <Text
                style={{
                  marginLeft: 10,
                  fontSize: 19,
                  fontFamily: "cursive",
                  color: theme.colors.text,
                  fontWeight: "900",
                }}
              >
                HisVoice
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                width: 32,
                height: 32,
                borderRadius: 8,
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
                size={18}
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
            onPress={() => closeMenuAndNavigate("welcome")}
            theme={theme}
            showChevron
            iconSource="materialicons"
          />
          <MenuItem
            icon="search-circle-sharp"
            label="Search"
            onPress={() => closeMenuAndNavigate("Search")}
            theme={theme}
            showChevron
          />
          <MenuItem
            icon="bookmarks"
            label="Bookmarks"
            onPress={() => closeMenuAndNavigate("bookmarks")}
            theme={theme}
            showChevron
            iconSource="materialicons"
          />
          <MenuItem
            icon="history"
            label="Recents"
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
            onPress={() => closeMenuAndNavigate("About")}
            theme={theme}
            showChevron
          />
          <MenuItem
            icon="settings"
            label="Settings"
            onPress={() => closeMenuAndNavigate("Settings")}
            theme={theme}
            showChevron
          />

          {/* Filters Section */}
          <SectionDivider label="Filters" theme={theme} />
          <MenuItem
            icon="document-text-outline"
            label="Text Only"
            onPress={() => closeMenuAndExecute(filterOnlyText)}
            theme={theme}
            highlight={hasActiveFilters}
          />
          <MenuItem
            icon="musical-notes-outline"
            label="Audio Only"
            onPress={() => closeMenuAndExecute(filterOnlyAudio)}
            theme={theme}
            highlight={hasActiveFilters}
          />
          <MenuItem
            icon={isOriginalOrder ? "swap-vertical" : "funnel-outline"}
            label="Toggle Sort"
            onPress={() => closeMenuAndExecute(toggleSortOrder)}
            theme={theme}
          />
          <MenuItem
            icon="refresh-outline"
            label="Reset All"
            onPress={() => closeMenuAndExecute(restoreOriginalOrder)}
            theme={theme}
            highlight={hasActiveFilters}
          />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
