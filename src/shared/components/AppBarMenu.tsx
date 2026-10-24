import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import type {
  ActionRowProps,
  AppBarMenuProps,
  CountBadgeProps,
} from "./types";

const CountBadge = ({ count, theme }: CountBadgeProps) => {
  if (!count || count <= 0) return null;
  return (
    <View
      style={{
        backgroundColor: `${theme.colors.text}14`,
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
          color: theme.colors.text,
          letterSpacing: 0.2,
        }}
      >
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
};

const ActionRow = ({ label, icon, onPress, theme, isLast = false, badge }: ActionRowProps) => {
  const divider = `${theme.colors.text}1A`;
  const labelColor = theme.colors.text;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: `${theme.colors.text}14` }}
      style={({ pressed }) => [
        styles.row,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: divider },
        pressed && { opacity: 0.55 },
      ]}
    >
      <Ionicons
        name={icon}
        size={20}
        color={`${theme.colors.text}A6`}
        style={{ marginRight: 10 }}
      />
      <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
      {badge != null && (
        <View style={{ marginLeft: "auto" }}>
          <CountBadge count={badge} theme={theme} />
        </View>
      )}
    </Pressable>
  );
};

const AppBarMenu = ({ visible, onClose, theme, bookmarkCount = 0, recentCount = 0, anchor }: AppBarMenuProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const panelAnim = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    let animation: Animated.CompositeAnimation;
    if (visible) {
      panelAnim.setValue(0);
      animation = Animated.spring(panelAnim, {
        toValue: 1, damping: 24, stiffness: 300, useNativeDriver: true,
      });
      animation.start();
    } else {
      animation = Animated.timing(panelAnim, { toValue: 0, duration: 160, useNativeDriver: true });
      animation.start(({ finished }) => {
        if (finished) setModalVisible(false);
      });
    }
    return () => animation.stop();
  }, [visible, panelAnim]);

  const go = useCallback((screen: Href) => { onClose(); router.navigate(screen); }, [onClose, router]);

  if (!visible && !modalVisible) return null;

  const cardBg = theme.colors.primary;
  const titleColor = theme.colors.text;
  const headerDivider = `${theme.colors.text}1A`;
  const panelWidth = Math.min(width * 0.76, 300);
  const top = Math.min(
    Math.max(insets.top + 8, (anchor?.bottom ?? insets.top + 60) + 6),
    height - insets.bottom - 100,
  );
  const right = Math.max(
    insets.right + 12,
    Math.min(width - (anchor?.right ?? width - 12), width - insets.left - 12 - panelWidth),
  );

  return (
    <Modal visible={visible || modalVisible} onShow={() => setModalVisible(true)}
      transparent animationType="none" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable accessibilityRole="button" accessibilityLabel="Close navigation menu"
        style={StyleSheet.absoluteFill} onPress={onClose} />

      <View style={[styles.position, { paddingTop: top, paddingRight: right }]} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: cardBg, width: panelWidth, maxHeight: height - top - insets.bottom - 12 },
            {
              opacity: panelAnim,
              transform: [
                { scale: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [0.90, 1] }) },
                { translateY: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
              ],
            },
          ]}
        >
          <ScrollView style={styles.menuContent} bounces={false} showsVerticalScrollIndicator={false}>
          <View style={[styles.header, { borderBottomColor: headerDivider }]}>
            <Text style={[styles.title, { color: titleColor }]}>HisVoice</Text>
          </View>

          <ActionRow icon="home-outline"       label="Home"      onPress={() => go("/")}         theme={theme} />
          <ActionRow icon="search-outline"     label="Search"    onPress={() => go("/search")}  theme={theme} />
          <ActionRow icon="bookmarks-outline"  label="Bookmarks" onPress={() => go("/bookmarks")} theme={theme} badge={bookmarkCount} />
          <ActionRow icon="time-outline"       label="Recents"   onPress={() => go("/recents")}  theme={theme} badge={recentCount} />
          <ActionRow icon="information-circle-outline" label="About" onPress={() => go("/about")} theme={theme} />
          <ActionRow icon="settings-outline"   label="Settings"  onPress={() => go("/settings")} theme={theme} isLast />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  position: {
    flex: 1,
    alignItems: "flex-end",
  },
  menuContent: { flexGrow: 0 },
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
