import React, { useCallback, useRef, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { AntDesign, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../../../providers/SermonProvider";
import AppBarMenu from "../../../shared/components/AppBarMenu";
import type { ListAppBarProps } from "../types";
import type { MenuAnchor } from "../../../shared/components/types";

const portrait = require("../../../../assets/roundedLam.png");

const ListAppBar = React.memo(({ theme, onToggleTheme, totalCount, visibleCount, loading }: ListAppBarProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookmarks, recentSermons } = useAppContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor>();
  const menuButtonRef = useRef<React.ComponentRef<typeof View>>(null);
  const [portraitVisible, setPortraitVisible] = useState(false);
  const ink = theme.dark ? "#fae7da" : theme.colors.text;
  const muted = theme.dark ? "#bba99b" : "#85684e";
  const surface = theme.dark ? "rgba(242,205,180,0.08)" : "rgba(93,50,17,0.055)";
  const openMenu = useCallback(() => {
    if (!menuButtonRef.current) {
      setMenuVisible(true);
      return;
    }
    menuButtonRef.current.measureInWindow((x, y, width, height) => {
      setMenuAnchor({ right: x + width, bottom: y + height });
      setMenuVisible(true);
    });
  }, []);
  const actions = [
    { id: "theme", icon: <MaterialCommunityIcons name="theme-light-dark" size={22} color={ink} />, label: theme.dark ? "Use light theme" : "Use dark theme", onPress: onToggleTheme },
    { id: "search", icon: <AntDesign name="search" size={22} color={ink} />, label: "Search inside sermons", onPress: () => router.navigate("/search") },
    { id: "menu", icon: <AntDesign name="align-left" size={24} color={ink} />, label: "Open navigation menu", onPress: openMenu },
  ] as const;
  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel="View portrait" onPress={() => setPortraitVisible(true)} style={styles.portraitButton}>
          <Image source={portrait} style={styles.portrait} />
        </Pressable>
        <View style={styles.identity}>
          <Text accessibilityRole="header" numberOfLines={1} style={[styles.title, { color: ink }]}>All sermons</Text>
          <Text numberOfLines={1} style={[styles.subtitle, { color: muted }]}>
            {loading ? "Loading library…" : visibleCount === totalCount ? `${totalCount.toLocaleString()} in your library` : `${visibleCount.toLocaleString()} of ${totalCount.toLocaleString()} sermons`}
          </Text>
        </View>
        <View style={styles.actions}>
          {actions.map((action) => (
            <Pressable key={action.id} ref={action.id === "menu" ? menuButtonRef : undefined} collapsable={false}
              accessibilityRole="button" accessibilityLabel={action.label} onPress={action.onPress}
              style={({ pressed }) => [styles.action, { backgroundColor: pressed ? surface : "transparent" }]}>
              {action.icon}
            </Pressable>
          ))}
        </View>
      </View>
      <AppBarMenu visible={menuVisible} onClose={() => setMenuVisible(false)} theme={theme} bookmarkCount={bookmarks.length} recentCount={recentSermons.length} anchor={menuAnchor} />
      <Modal visible={portraitVisible} transparent animationType="fade" onRequestClose={() => setPortraitVisible(false)}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close portrait" style={styles.backdrop} onPress={() => setPortraitVisible(false)}>
          <Image source={portrait} style={styles.expandedPortrait} />
          <View style={[styles.close, { top: insets.top + 12 }]}><Ionicons name="close" size={26} color="#fff" /></View>
        </Pressable>
      </Modal>
    </View>
  );
});
ListAppBar.displayName = "ListAppBar";
const styles = StyleSheet.create({
  header: { paddingHorizontal: 12, paddingBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", minHeight: 52 },
  portraitButton: { width: 44, height: 48, justifyContent: "center", alignItems: "center" },
  portrait: { width: 34, height: 34, borderRadius: 12 },
  identity: { flex: 1, minWidth: 0, paddingLeft: 7 },
  title: { fontFamily: "ZillaSlab-SemiBold", fontSize: 22, letterSpacing: -0.5 },
  subtitle: { fontFamily: "ZillaSlab", fontSize: 12, marginTop: 1 },
  actions: { flexDirection: "row", marginLeft: 3 },
  action: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.75)" },
  expandedPortrait: { width: 240, height: 300, resizeMode: "contain", borderRadius: 16 },
  close: { position: "absolute", right: 16, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
});
export default ListAppBar;
