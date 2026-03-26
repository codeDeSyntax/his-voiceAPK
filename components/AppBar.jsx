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
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassButton } from "../styles/glassButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Animated dropdown panel rendered inside a Modal with backdrop
const AnimatedDropdown = ({
  visible,
  onClose,
  theme,
  insets,
  children,
  title,
}) => {
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
          backgroundColor: dark ? "rgba(0,0,0,0.55)" : "rgba(30,20,10,0.3)",
          opacity: backdropAnim,
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Panel with enhanced glass-morphism */}
      <Animated.View
        style={{
          position: "absolute",
          top: insets.top + 60,
          right: 16,
          width: Math.min(SCREEN_WIDTH - 32, 280),
          backgroundColor: dark
            ? "rgba(26, 19, 16, 0.92)"
            : "rgba(254, 252, 249, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: 24,
          borderWidth: 1.5,
          borderColor: dark
            ? "rgba(242, 205, 180, 0.15)"
            : "rgba(93, 50, 17, 0.12)",
          // Enhanced shadows for depth
          shadowColor: dark ? "#000" : "#5d3211",
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: dark ? 0.5 : 0.18,
          shadowRadius: 32,
          elevation: 20,
          overflow: "hidden",
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-14, 0],
              }),
            },
            {
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.93, 1],
              }),
            },
          ],
          opacity: slideAnim,
        }}
      >
        {/* Inner glow at top for premium glass effect */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: dark
              ? "rgba(255,255,255,0.04)"
              : "rgba(255,255,255,0.7)",
            zIndex: 1,
          }}
        />

        {/* Content */}
        <View style={{ paddingVertical: 6 }}>{children}</View>
      </Animated.View>
    </Modal>
  );
};

// Sleek menu item with enhanced styling matching the premium design
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
  const activeColor = dark
    ? "rgba(242, 205, 180, 0.92)"
    : "rgba(93, 50, 17, 0.82)";
  const textColor = highlight ? activeColor : theme.colors.text;
  const iconColor = highlight
    ? activeColor
    : dark
      ? "rgba(242, 205, 180, 0.75)"
      : "rgba(93, 50, 17, 0.68)";

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
      <Ionicons name={icon} size={17} color={iconColor} />
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

// Premium section divider with subtle styling
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

const ListAppBar = React.memo(
  ({
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
    const [menuModalVisible, setMenuModalVisible] = useState(false);
    const menuAnim = useRef(new Animated.Value(0)).current;
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

    useEffect(() => {
      if (menuVisible) {
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
    }, [menuVisible, menuModalVisible, menuAnim]);

    const closeFilters = useCallback(() => setFiltersVisible(false), []);
    const closeMenu = useCallback(() => setMenuVisible(false), []);

    return (
      <View
        style={{
          backgroundColor: theme.dark ? theme.colors.background : "#faeed1",
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
              <Ionicons
                name="home-outline"
                size={22}
                color={theme.colors.text}
              />
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

            <GlassButton
              theme={theme}
              onPress={() => router?.navigate("Search")}
            >
              <Ionicons
                name="search-outline"
                size={22}
                color={theme.colors.text}
              />
            </GlassButton>

            <GlassButton
              theme={theme}
              onPress={() => {
                setMenuVisible(!menuVisible);
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

        {/* Filters Panel - Removed, merged into sidebar */}

        {/* Combined Sidebar - Filters + Navigation */}
        <Modal
          visible={menuModalVisible}
          transparent
          animationType="none"
          onRequestClose={closeMenu}
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
            <Pressable style={{ flex: 1 }} onPress={closeMenu} />
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
              borderLeftWidth: 1,
              borderLeftColor: theme.dark
                ? "rgba(242, 205, 180, 0.1)"
                : "rgba(93, 50, 17, 0.08)",
              borderTopLeftRadius: 24,
              borderBottomLeftRadius: 24,
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
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 12,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
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
                  onPress={closeMenu}
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

              <SectionDivider label="General" theme={theme} />
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

              <SectionDivider label="Tools" theme={theme} />
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

              <SectionDivider label="Filters" theme={theme} />
              <MenuItem
                icon="document-text-outline"
                label="Text Only"
                onPress={() => {
                  closeMenu();
                  filterOnlyText();
                }}
                theme={theme}
                highlight={hasActiveFilters}
              />
              <MenuItem
                icon="musical-notes-outline"
                label="Audio Only"
                onPress={() => {
                  closeMenu();
                  filterOnlyAudio();
                }}
                theme={theme}
                highlight={hasActiveFilters}
              />
              <MenuItem
                icon={isOriginalOrder ? "swap-vertical" : "funnel-outline"}
                label="Toggle Sort"
                onPress={() => {
                  closeMenu();
                  toggleSortOrder();
                }}
                theme={theme}
              />
              <MenuItem
                icon="refresh-outline"
                label="Reset All"
                onPress={() => {
                  closeMenu();
                  restoreOriginalOrder();
                }}
                theme={theme}
                highlight={hasActiveFilters}
              />
            </ScrollView>
          </Animated.View>
        </Modal>

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
  },
);

const menuStyles = StyleSheet.create({
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
  },
});

export default ListAppBar;
