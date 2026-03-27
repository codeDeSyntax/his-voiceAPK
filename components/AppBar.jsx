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
import {
  Ionicons,
  AntDesign,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassButton } from "../styles/glassButton";
import AppBarMenu from "./AppBarMenu";

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
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
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
              <MaterialCommunityIcons
                name={"theme-light-dark"}
                size={22}
                color={theme.colors.text}
                // icons thickness
              />
            </GlassButton>

            <GlassButton
              theme={theme}
              onPress={() => router?.navigate("Search")}
            >
              <AntDesign name="search" size={22} color={theme.colors.text} />
            </GlassButton>

            <GlassButton
              theme={theme}
              onPress={() => {
                setMenuVisible(!menuVisible);
              }}
            >
              <AntDesign
                name={"align-left"}
                size={24}
                color={theme.colors.text}
              />
            </GlassButton>
          </View>
        </View>

        {/* AppBar Menu Sidebar */}
        <AppBarMenu
          visible={menuVisible}
          onClose={closeMenu}
          theme={theme}
          filterOnlyText={filterOnlyText}
          filterOnlyAudio={filterOnlyAudio}
          toggleSortOrder={toggleSortOrder}
          restoreOriginalOrder={restoreOriginalOrder}
          isOriginalOrder={isOriginalOrder}
          hasActiveFilters={hasActiveFilters}
        />

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

export default ListAppBar;
