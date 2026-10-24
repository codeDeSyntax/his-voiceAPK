import React, { useCallback } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { useAppContext } from "../../../providers/SermonProvider";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { responsiveFontSize, spacing } from "../../../shared/utils/responsiveUtils";
import { GlassButton } from "../../../shared/components/GlassButton";
import DraggableFloatingButton from "../../../shared/components/FloatButton";
import type { RecentSermon } from "../types";

const formatRelativeTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

const RecentsScreen = () => {
  const { theme, recentSermons, setSelectedSermon } = useAppContext();
  const navigation = useRouter();
  const insets = useSafeAreaInsets();

  const handleSermonClick = useCallback(
    (item: RecentSermon) => {
      setSelectedSermon(item);
      navigation.navigate("/reader");
    },
    [setSelectedSermon, navigation],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: RecentSermon; index: number }) => (
      <View>
        <Pressable
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.sm,
            marginHorizontal: spacing.sm,
            backgroundColor: pressed
              ? theme.dark
                ? "rgba(242, 205, 180, 0.12)"
                : "rgba(93, 50, 17, 0.10)"
              : index % 2 === 0
                ? theme.dark
                  ? "rgba(242, 205, 180, 0.02)"
                  : "rgba(93, 50, 17, 0.02)"
                : "transparent",
          })}
          android_ripple={{
            color: theme.dark
              ? "rgba(242, 205, 180, 0.08)"
              : "rgba(93, 50, 17, 0.08)",
          }}
          onPress={() => handleSermonClick(item)}
        >
          <GlassButton theme={theme} size={36} style={{ marginRight: spacing.sm }}>
            {item.type === "mp3" ? (
              <FontAwesome5
                name="microphone"
                size={responsiveFontSize(22)}
                color={theme.dark ? "#ffffff80" : "#5d3211"}
              />
            ) : (
              <Ionicons
                name="document-text"
                size={responsiveFontSize(22)}
                color={theme.dark ? "#906443" : "#5d3211"}
              />
            )}
          </GlassButton>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: responsiveFontSize(15.5),
                color: theme.colors.text,
                fontFamily: "Merriweather",
                marginBottom: spacing.xs,
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(13),
                color: theme.dark
                  ? theme.colors.text + "70"
                  : "#5d321180",
                fontFamily: "Merriweather",
              }}
            >
              {item.date} {"\u2022"} {formatRelativeTime(item.openedAt)}
            </Text>
          </View>
        </Pressable>
        <View
          style={{
            height: 0.8,
            backgroundColor: theme.dark
              ? "rgba(242, 205, 180, 0.10)"
              : "rgba(93, 50, 17, 0.15)",
            marginHorizontal: spacing.md,
            marginLeft: spacing.md + 28,
          }}
        />
      </View>
    ),
    [theme, handleSermonClick],
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top + 8,
      }}
    >
      <DraggableFloatingButton />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingBottom: 16,
          gap: 12,
        }}
      >
        <GlassButton theme={theme} onPress={() => navigation.back()}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.colors.text}
          />
        </GlassButton>

        <Text
          style={{
            fontSize: responsiveFontSize(22),
            fontFamily: "ZillaSlabsm",
            color: theme.colors.text,
          }}
        >
          Recently Opened
        </Text>
      </View>

      {recentSermons.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="time-outline"
            size={responsiveFontSize(50)}
            color={
              theme.dark
                ? "rgba(242, 205, 180, 0.3)"
                : "rgba(93, 50, 17, 0.3)"
            }
          />
          <Text
            style={{
              color: theme.dark ? theme.colors.text + "80" : "#5d3211",
              fontSize: responsiveFontSize(16),
              fontFamily: "ZillaSlabsm",
              marginTop: spacing.md,
            }}
          >
            No recent sermons
          </Text>
          
          <Text
            style={{
              color: theme.dark ? theme.colors.text + "60" : "#5d321190",
              fontSize: responsiveFontSize(13),
              fontFamily: "serif",
              textAlign: "center",
              marginTop: spacing.xs,
            }}
          >
            Sermons you open will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={recentSermons}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          initialNumToRender={15}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: spacing.lg }}
        />
      )}
    </View>
  );
};

export default RecentsScreen;
