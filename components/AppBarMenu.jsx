import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.76, 300);

// ─── Count badge pill ─────────────────────────────────────────────────────────
const CountBadge = ({ count, dark }) => {
  if (!count || count <= 0) return null;
  return (
    <View
      style={{
        backgroundColor: dark ? "rgba(242,205,180,0.13)" : "rgba(93,50,17,0.09)",
        borderRadius: 999,
        minWidth: 22,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 7,
      }}
    >
      <Text
        style={{
          fontFamily: "ZillaSlab-SemiBold",
          fontSize: 11,
          color: dark ? "#f2cdb4" : "#5d3211",
          letterSpacing: 0.2,
        }}
      >
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
};

// ─── Single action row ────────────────────────────────────────────────────────
const ActionRow = ({ label, icon, onPress, theme, isLast = false, badge }) => {
  const dark = theme.dark;
  const divider = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.09)";
  const labelColor = dark ? "rgba(242,205,180,0.95)" : "rgba(30,15,5,0.88)";

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" }}
      style={({ pressed }) => [
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: divider },
        pressed && { opacity: 0.55 },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={dark ? "rgba(242,205,180,0.55)" : "rgba(93,50,17,0.50)"}
        style={{ marginRight: 10 }}
      />
      <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
      {badge != null && (
        <View style={{ marginLeft: "auto" }}>
          <CountBadge count={badge} dark={dark} />
        </View>
      )}
    </Pressable>
  );
};

// ─── Main nav menu (no filters) ───────────────────────────────────────────────
const AppBarMenu = ({ visible, onClose, theme, bookmarkCount = 0, recentCount = 0 }) => {
  const router = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const panelAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      panelAnim.setValue(0);
      backdropAnim.setValue(0);
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1, duration: 200, easing: Easing.out(Easing.ease), useNativeDriver: true,
        }),
        Animated.spring(panelAnim, {
          toValue: 1, damping: 24, stiffness: 300, useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(backdropAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(panelAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible, modalVisible, panelAnim, backdropAnim]);

  const go = useCallback((screen) => { onClose(); router?.navigate(screen); }, [onClose, router]);

  if (!modalVisible) return null;

  const dark = theme.dark;
  const cardBg = dark ? "rgba(30,21,15,0.97)" : "rgba(252,246,237,0.98)";
  const titleColor = dark ? "rgba(255,255,255,0.95)" : "rgba(15,10,5,0.92)";
  const subtitleColor = dark ? "rgba(242,205,180,0.42)" : "rgba(93,50,17,0.40)";
  const headerDivider = dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, {
          backgroundColor: dark ? "rgba(10,6,4,0.60)" : "rgba(0,0,0,0.35)",
          opacity: backdropAnim,
        }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Centered card */}
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: cardBg, width: PANEL_WIDTH },
            {
              opacity: panelAnim,
              transform: [
                { scale: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.90, 1] }) },
                { translateY: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: headerDivider }]}>
            <Text style={[styles.title, { color: titleColor }]}>HisVoice</Text>
            {/* <Text style={[styles.subtitle, { color: subtitleColor }]}>
              Sermon Library · Prophet Robert Lambert Lee
            </Text> */}
          </View>

          {/* Navigation rows */}
          <ActionRow icon="home-outline"       label="Home"      onPress={() => go("welcome")}   theme={theme} />
          <ActionRow icon="search-outline"     label="Search"    onPress={() => go("Search")}    theme={theme} />
          <ActionRow icon="bookmarks-outline"  label="Bookmarks" onPress={() => go("bookmarks")} theme={theme} badge={bookmarkCount} />
          <ActionRow icon="time-outline"       label="Recents"   onPress={() => go("Recents")}   theme={theme} badge={recentCount} />
          <ActionRow icon="information-circle-outline" label="About"   onPress={() => go("About")}    theme={theme} />
          <ActionRow icon="settings-outline"   label="Settings"  onPress={() => go("Settings")}  theme={theme} isLast />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.30,
    shadowRadius: 28,
    elevation: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontFamily: "ZillaSlab-SemiBold",
    fontSize: 15,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "ZillaSlab-SemiBold",
    fontSize: 10,
    letterSpacing: 0.4,
    textAlign: "center",
    lineHeight: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 11,
  },
  rowLabel: {
    fontFamily: "Merriweather",
    fontSize: 12.5,
    letterSpacing: 0.05,
  },
});

export default AppBarMenu;
