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
import { useAppContext } from "../Logic/globalState";

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
// ─── Compact filter dropdown ──────────────────────────────────────────────────
const FilterDropdown = ({
  visible,
  onClose,
  theme,
  insets,
  filterOnlyText,
  filterOnlyAudio,
  toggleSortOrder,
  restoreOriginalOrder,
  isOriginalOrder,
  hasActiveFilters,
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
        Animated.spring(slideAnim, { toValue: 1, damping: 22, stiffness: 300, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible, modalVisible, slideAnim, backdropAnim]);

  if (!modalVisible) return null;

  const dark = theme.dark;
  const cardBg = dark ? "rgba(28,19,13,0.97)" : "rgba(252,246,237,0.98)";
  const divider = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const labelActive = dark ? "#f2cdb4" : "#5d3211";
  const labelInactive = dark ? "rgba(242,205,180,0.65)" : "rgba(93,50,17,0.60)";

  const FilterRow = ({ icon, label, onPress, active = false }) => (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons
        name={icon}
        size={14}
        color={active ? labelActive : labelInactive}
        style={{ marginRight: 10 }}
      />
      <Text style={{
        fontFamily: "Merriweather",
        fontSize: 12,
        color: active ? labelActive : labelInactive,
        flex: 1,
      }}>{label}</Text>
      {active && (
        <Ionicons name="checkmark" size={13} color={labelActive} />
      )}
    </Pressable>
  );

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={{
        position: "absolute",
        top: insets.top + 58,
        right: 16,
        width: 190,
        backgroundColor: cardBg,
        borderRadius: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 20,
        elevation: 16,
        opacity: slideAnim,
        transform: [
          { translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) },
          { scale: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0.93, 1] }) },
        ],
      }}>
        <FilterRow icon="document-text-outline" label="Text only"    onPress={() => { onClose(); filterOnlyText(); }}   active={hasActiveFilters} />
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: divider, marginHorizontal: 14 }} />
        <FilterRow icon="musical-notes-outline" label="Audio only"   onPress={() => { onClose(); filterOnlyAudio(); }}  active={hasActiveFilters} />
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: divider, marginHorizontal: 14 }} />
        <FilterRow
          icon={isOriginalOrder ? "swap-vertical" : "funnel-outline"}
          label={isOriginalOrder ? "Sort A–Z" : "Restore sort"}
          onPress={() => { onClose(); toggleSortOrder(); }}
        />
        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: divider, marginHorizontal: 14 }} />
        <FilterRow icon="refresh-outline" label="Reset filters" onPress={() => { onClose(); restoreOriginalOrder(); }} active={hasActiveFilters} />
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
    sermonCounts = { total: 0, text: 0, audio: 0 },
    totalCount = 0,
  }) => {
    const router = useNavigation();
    const insets = useSafeAreaInsets();
    const { bookmarks, recentSermons } = useAppContext();
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
            {/* <GlassButton
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
            </GlassButton> */}

          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <GlassButton theme={theme} onPress={onToggleTheme}>
              <MaterialCommunityIcons
                name={"theme-light-dark"}
                size={22}
                color={theme.colors.text}
              />
            </GlassButton>

            <GlassButton
              theme={theme}
              onPress={() => router?.navigate("Search")}
            >
              <AntDesign name="search" size={22} color={theme.colors.text} />
            </GlassButton>

            {/* Filter button — active dot indicator */}
            <View>
              <GlassButton
                theme={theme}
                onPress={() => setFiltersVisible((v) => !v)}
              >
                <Ionicons
                  name="options-outline"
                  size={22}
                  color={hasActiveFilters ? (theme.dark ? "#f2cdb4" : "#5d3211") : theme.colors.text}
                />
              </GlassButton>
              {hasActiveFilters && (
                <View style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: theme.dark ? "#f2cdb4" : "#5d3211",
                }} />
              )}
            </View>

            <GlassButton
              theme={theme}
              onPress={() => setMenuVisible((v) => !v)}
            >
              <AntDesign name="align-left" size={24} color={theme.colors.text} />
            </GlassButton>
          </View>
        </View>

        {/* Sleek Sub-Header Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            paddingTop: 8,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.dark
              ? "rgba(242, 205, 180, 0.08)"
              : "rgba(93, 50, 17, 0.08)",
          }}
        >
          <Text
            style={{
              color: theme.colors.text,
              fontFamily: "ZillaSlab-SemiBold",
              fontSize: 14,
              letterSpacing: 0.4,
            }}
          >
            Sermons
          </Text>
          <Text
            style={{
              color: theme.dark
                ? "rgba(242, 205, 180, 0.50)"
                : "rgba(93, 50, 17, 0.52)",
              fontFamily: "Merriweather",
              fontSize: 11,
              letterSpacing: 0.2,
            }}
          >
            {sermonCounts?.total || totalCount} available ({sermonCounts?.text || 0} text · {sermonCounts?.audio || 0} audio)
          </Text>
        </View>

        {/* Nav menu */}
        <AppBarMenu
          visible={menuVisible}
          onClose={closeMenu}
          theme={theme}
          bookmarkCount={bookmarks?.length ?? 0}
          recentCount={recentSermons?.length ?? 0}
        />

        {/* Filter dropdown */}
        <FilterDropdown
          visible={filtersVisible}
          onClose={() => setFiltersVisible(false)}
          theme={theme}
          insets={insets}
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
