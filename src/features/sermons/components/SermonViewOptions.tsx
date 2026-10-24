import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SermonSortOrder, SermonTypeFilter, SermonViewOptionsProps } from "../types";

const typeOptions: {
  value: SermonTypeFilter;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}[] = [
  { value: "all", label: "All", icon: "grid-outline" },
  { value: "text", label: "Text", icon: "document-text-outline" },
  { value: "mp3", label: "Audio", icon: "headset-outline" },
];
const sortOptions: {
  value: SermonSortOrder;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}[] = [
  { value: "asc", label: "A–Z", icon: "sort-alphabetical-ascending" },
  { value: "desc", label: "Z–A", icon: "sort-alphabetical-descending" },
];

const SermonViewOptions = React.memo(({
  theme, visible, onClose, typeFilter, sortOrder,
  onTypeFilterChange, onSortOrderChange, onReset, hasChanges,
}: SermonViewOptionsProps) => {
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const leftInset = Math.max(insets.left + 12, 14);
  const rightInset = Math.max(insets.right + 12, 14);
  const stackGroups = width - leftInset - rightInset < 282 || fontScale > 1.35;
  const ink = theme.dark ? "#fae7da" : theme.colors.text;
  const muted = theme.dark ? "#bba99b" : "#85684e";
  const accent = theme.dark ? "#efb78d" : "#9d532d";
  const surface = theme.dark ? "rgba(242,205,180,0.07)" : "rgba(93,50,17,0.055)";
  const selectedSurface = theme.dark ? "rgba(239,183,141,0.12)" : "rgba(157,83,45,0.09)";
  const border = theme.dark ? "rgba(242,205,180,0.14)" : "rgba(93,50,17,0.13)";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={[styles.overlay, {
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 12,
        paddingLeft: leftInset,
        paddingRight: rightInset,
      }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close filter and sort options" onPress={onClose} style={StyleSheet.absoluteFill} />
        <View accessibilityViewIsModal style={[styles.card, { backgroundColor: theme.colors.background, borderColor: border }]}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Text accessibilityRole="header" style={[styles.title, { color: ink }]}>Filter & sort</Text>
              <View style={styles.headerActions}>
                <Pressable accessibilityRole="button" accessibilityLabel="Reset search, filters, and sorting" disabled={!hasChanges}
                  onPress={onReset} style={({ pressed }) => [styles.headerAction, { opacity: hasChanges ? 1 : 0.35, backgroundColor: pressed ? surface : "transparent" }]}>
                  <Ionicons name="refresh-outline" size={19} color={muted} />
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel="Close filter and sort options" onPress={onClose}
                  style={({ pressed }) => [styles.headerAction, { backgroundColor: pressed ? surface : "transparent" }]}>
                  <Ionicons name="close" size={21} color={ink} />
                </Pressable>
              </View>
            </View>
            <View style={[styles.groups, stackGroups && styles.groupsStacked]}>
              <View style={[styles.typeGroup, stackGroups && styles.groupStacked]}>
                <Text style={[styles.label, { color: muted }]}>Sermon type</Text>
                <View accessibilityRole="radiogroup" accessibilityLabel="Sermon type" style={styles.choices}>
                  {typeOptions.map((option) => {
                    const selected = typeFilter === option.value;
                    return (
                      <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label + " sermons"}
                        accessibilityState={{ checked: selected }} onPress={() => onTypeFilterChange(option.value)}
                        style={({ pressed }) => [styles.choice, { backgroundColor: pressed ? surface : "transparent" }]}>
                        <View style={[styles.icon, { backgroundColor: selected ? selectedSurface : "transparent", borderColor: selected ? border : "transparent" }]}>
                          <Ionicons name={option.icon} size={22} color={selected ? accent : muted} />
                        </View>
                        <Text style={[styles.choiceLabel, { color: selected ? accent : muted }]}>{option.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: border }, stackGroups && styles.dividerHorizontal]} />
              <View style={[styles.sortGroup, stackGroups && styles.groupStacked]}>
                <Text style={[styles.label, { color: muted }]}>Alphabetical</Text>
                <View accessibilityRole="radiogroup" accessibilityLabel="Alphabetical order" style={styles.choices}>
                  {sortOptions.map((option) => {
                    const selected = sortOrder === option.value;
                    return (
                      <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.value === "asc" ? "A to Z" : "Z to A"}
                        accessibilityState={{ checked: selected }} onPress={() => onSortOrderChange(option.value)}
                        style={({ pressed }) => [styles.choice, { backgroundColor: pressed ? surface : "transparent" }]}>
                        <View style={[styles.icon, { backgroundColor: selected ? selectedSurface : "transparent", borderColor: selected ? border : "transparent" }]}>
                          <MaterialCommunityIcons name={option.icon} size={25} color={selected ? accent : muted} />
                        </View>
                        <Text style={[styles.choiceLabel, { color: selected ? accent : muted }]}>{option.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});
SermonViewOptions.displayName = "SermonViewOptions";

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  card: {
    width: "100%", maxWidth: 440, maxHeight: "100%", alignSelf: "center",
    borderRadius: 24, borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#1c120c", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 8,
  },
  content: { paddingHorizontal: 12, paddingTop: 2, paddingBottom: 12 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: 6 },
  title: { flex: 1, fontFamily: "ZillaSlab-SemiBold", fontSize: 17 },
  headerActions: { flexDirection: "row" },
  headerAction: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  groups: { flexDirection: "row", alignItems: "stretch", gap: 10 },
  groupsStacked: { flexDirection: "column", gap: 8 },
  typeGroup: { flex: 3 },
  sortGroup: { flex: 2 },
  groupStacked: { flex: 0 },
  label: { fontFamily: "ZillaSlab", fontSize: 12, marginBottom: 4, textAlign: "center" },
  divider: { width: StyleSheet.hairlineWidth, marginVertical: 5 },
  dividerHorizontal: { width: "100%", height: StyleSheet.hairlineWidth, marginVertical: 0 },
  choices: { flexDirection: "row", gap: 2 },
  choice: { flex: 1, minWidth: 44, minHeight: 60, alignItems: "center", paddingVertical: 3, borderRadius: 12 },
  icon: { width: 34, height: 34, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  choiceLabel: { fontFamily: "ZillaSlab-SemiBold", fontSize: 12, textAlign: "center", marginTop: 2 },
});

export default SermonViewOptions;
