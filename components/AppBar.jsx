import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassButton } from "../styles/glassButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Animated dropdown panel rendered inside a Modal with backdrop
const AnimatedDropdown = ({ visible, onClose, theme, insets, children, title }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      slideAnim.setValue(0);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          damping: 22,
          stiffness: 280,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible]);

  if (!modalVisible) return null;

  const dark = theme.dark;
  const panelBg = dark ? "#1a1310" : "#fefcf9";
  const panelBorder = dark
    ? "rgba(242, 205, 180, 0.08)"
    : "rgba(93, 50, 17, 0.06)";

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: dark ? "rgba(0,0,0,0.5)" : "rgba(30,20,10,0.25)",
          opacity: backdropAnim,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        style={{
          position: "absolute",
          top: insets.top + 60,
          right: 16,
          width: Math.min(SCREEN_WIDTH - 32, 280),
          backgroundColor: panelBg,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: panelBorder,
          // Layered shadows for depth
          shadowColor: dark ? "#000" : "#5d3211",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: dark ? 0.4 : 0.15,
          shadowRadius: 24,
          elevation: 16,
          overflow: "hidden",
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-12, 0],
              }),
            },
            {
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
          opacity: slideAnim,
        }}
      >
        {/* Inner glow at top */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 50,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: dark
              ? "rgba(255,255,255,0.03)"
              : "rgba(255,255,255,0.6)",
          }}
        />

        {/* Header */}
        <View style={menuStyles.panelHeader}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              letterSpacing: 0.6,
              textTransform: "uppercase",
              color: dark
                ? "rgba(242, 205, 180, 0.5)"
                : "rgba(93, 50, 17, 0.45)",
              fontFamily: "ZillaSlab_smb",
            }}
          >
            {title}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={8}
            style={({ pressed }) => ({
              width: 28,
              height: 28,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed
                ? dark
                  ? "rgba(242, 205, 180, 0.12)"
                  : "rgba(93, 50, 17, 0.08)"
                : dark
                  ? "rgba(242, 205, 180, 0.06)"
                  : "rgba(93, 50, 17, 0.04)",
            })}
          >
            <Ionicons
              name="close"
              size={15}
              color={
                dark ? "rgba(242, 205, 180, 0.5)" : "rgba(93, 50, 17, 0.4)"
              }
            />
          </Pressable>
        </View>

        {/* Thin divider */}
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: dark
              ? "rgba(242, 205, 180, 0.08)"
              : "rgba(93, 50, 17, 0.06)",
            marginHorizontal: 16,
          }}
        />

        {/* Content */}
        <View style={{ paddingVertical: 6 }}>{children}</View>
      </Animated.View>
    </Modal>
  );
};

// Sleek menu item — no icon box, just icon + label inline
const MenuItem = ({
  icon,
  label,
  onPress,
  theme,
  highlight = false,
  showChevron = false,
  subtitle,
}) => {
  const dark = theme.dark;
  const activeColor = dark ? "#ff9a8b" : "#c0392b";
  const textColor = highlight ? activeColor : theme.colors.text;
  const iconColor = highlight
    ? activeColor
    : dark
      ? "rgba(242, 205, 180, 0.7)"
      : "rgba(93, 50, 17, 0.6)";

  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 11,
        marginHorizontal: 6,
        borderRadius: 12,
        backgroundColor: pressed
          ? dark
            ? "rgba(242, 205, 180, 0.08)"
            : "rgba(93, 50, 17, 0.05)"
          : "transparent",
      })}
      onPress={onPress}
      android_ripple={{
        color: dark
          ? "rgba(242, 205, 180, 0.08)"
          : "rgba(93, 50, 17, 0.06)",
        borderless: false,
      }}
    >
      <Ionicons name={icon} size={19} color={iconColor} />
      <View style={{ flex: 1, marginLeft: 14 }}>
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
          color={
            dark ? "rgba(242, 205, 180, 0.2)" : "rgba(93, 50, 17, 0.2)"
          }
        />
      )}
    </Pressable>
  );
};

// Subtle section divider with optional label
const SectionDivider = ({ label, theme }) => {
  const dark = theme.dark;
  return (
    <View style={{ marginTop: 4, marginBottom: 2 }}>
      <View
        style={{
          height: StyleSheet.hairlineWidth,
          backgroundColor: dark
            ? "rgba(242, 205, 180, 0.06)"
            : "rgba(93, 50, 17, 0.05)",
          marginHorizontal: 20,
          marginBottom: label ? 8 : 4,
        }}
      />
      {label && (
        <Text
          style={{
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 0.8,
            textTransform: "uppercase",
            color: dark
              ? "rgba(242, 205, 180, 0.3)"
              : "rgba(93, 50, 17, 0.3)",
            paddingHorizontal: 22,
            paddingBottom: 2,
            fontFamily: "ZillaSlab_smb",
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

const ListAppBar = React.memo(({
  theme,
  filterOnlyText,
  filterOnlyAudio,
  toggleSortOrder,
  restoreOriginalOrder,
  isOriginalOrder,
  hasActiveFilters,
  onToggleTheme,
}) => {
  const router = useNavigation();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openImageModal = useCallback(() => {
    setImageModalVisible(true);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const closeImageModal = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setImageModalVisible(false));
  }, [fadeAnim]);

  const closeFilters = useCallback(() => setFiltersVisible(false), []);
  const closeMenu = useCallback(() => setMenuVisible(false), []);

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
              source={require("../assets/roundedLam.png")}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
            />
          </TouchableOpacity>

          {/* Home Button */}
          <GlassButton
            theme={theme}
            onPress={() => {
              router?.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: "welcome" }],
                }),
              );
            }}
          >
            <Ionicons name="home-outline" size={22} color={theme.colors.text} />
          </GlassButton>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <GlassButton theme={theme} onPress={onToggleTheme}>
            <Ionicons
              name={theme.dark ? "sunny-outline" : "moon-outline"}
              size={22}
              color={theme.colors.text}
              // icons thickness
              
            />
          </GlassButton>

          <GlassButton theme={theme} onPress={() => router?.navigate("Search")}>
            <Ionicons
              name="search-outline"
              size={22}
              color={theme.colors.text}
            />
          </GlassButton>

          <GlassButton
            theme={theme}
            onPress={() => {
              setFiltersVisible(!filtersVisible);
              setMenuVisible(false);
            }}
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
          </GlassButton>

          <GlassButton
            theme={theme}
            onPress={() => {
              setMenuVisible(!menuVisible);
              setFiltersVisible(false);
            }}
          >
            <Ionicons
              name="menu-outline"
              size={24}
              color={theme.colors.text}
            />
          </GlassButton>
        </View>
      </View>

      {/* Filters Panel */}
      <AnimatedDropdown
        visible={filtersVisible}
        onClose={closeFilters}
        theme={theme}
        insets={insets}
        title="Filters"
      >
        <MenuItem
          icon="document-text-outline"
          label="Text Only"
          onPress={() => {
            closeFilters();
            filterOnlyText();
          }}
          theme={theme}
          highlight={hasActiveFilters}
        />
        <MenuItem
          icon="musical-notes-outline"
          label="Audio Only"
          onPress={() => {
            closeFilters();
            filterOnlyAudio();
          }}
          theme={theme}
          highlight={hasActiveFilters}
        />

        <SectionDivider theme={theme} />
        <MenuItem
          icon={isOriginalOrder ? "swap-vertical" : "funnel-outline"}
          label="Toggle Sort"
          onPress={() => {
            closeFilters();
            toggleSortOrder();
          }}
          theme={theme}
        />
        <MenuItem
          icon="refresh-outline"
          label="Reset All"
          onPress={() => {
            closeFilters();
            restoreOriginalOrder();
          }}
          theme={theme}
          highlight={hasActiveFilters}
        />
      </AnimatedDropdown>

      {/* Navigation Menu Panel */}
      <AnimatedDropdown
        visible={menuVisible}
        onClose={closeMenu}
        theme={theme}
        insets={insets}
        title="Menu"
      >
        <MenuItem
          icon="home-outline"
          label="Home"
          onPress={() => {
            closeMenu();
            router?.navigate("welcome");
          }}
          theme={theme}
          showChevron
        />
        <MenuItem
          icon="search-outline"
          label="Search"
          onPress={() => {
            closeMenu();
            router?.navigate("Search");
          }}
          theme={theme}
          showChevron
        />
        <MenuItem
          icon="bookmark-outline"
          label="Bookmarks"
          onPress={() => {
            closeMenu();
            router?.navigate("bookmarks");
          }}
          theme={theme}
          showChevron
        />
        <MenuItem
          icon="time-outline"
          label="Recents"
          onPress={() => {
            closeMenu();
            router?.navigate("Recents");
          }}
          theme={theme}
          showChevron
        />

        <SectionDivider theme={theme} />
        <MenuItem
          icon="information-circle-outline"
          label="About"
          onPress={() => {
            closeMenu();
            router?.navigate("About");
          }}
          theme={theme}
          showChevron
        />
        <MenuItem
          icon="settings-outline"
          label="Settings"
          onPress={() => {
            closeMenu();
            router?.navigate("Settings");
          }}
          theme={theme}
          showChevron
        />
      </AnimatedDropdown>

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
              source={require("../assets/roundedLam.png")}
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
});

const menuStyles = StyleSheet.create({
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
});

export default ListAppBar;
