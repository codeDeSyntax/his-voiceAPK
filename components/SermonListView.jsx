import React, { useCallback, useRef, useEffect } from "react";
import { View, Text, FlatList, Pressable, Animated, Easing } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { styles } from "../styles/Allsermons";
import { responsiveFontSize, spacing } from "../Utils/responsiveUtils";
import { GlassButton } from "../styles/glassButton";

// ─── Dedicated component for the "Last Read" pinned row ──────────────────────
// Kept separate so we can safely use useRef + useEffect (hooks rules require
// them to be called at the component top level, not inside callbacks).
const LastReadRow = React.memo(({ item, theme, handleSermonClick }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Single attention pulse: breathe in → out → in → settle
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(scaleAnim, {
        toValue: 1.025,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.975,
        duration: 160,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.018,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const dark = theme.dark;
  const accentColor = dark ? "#f2cdb4" : "#5d3211";

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Pressable
        style={({ pressed }) => [
          styles.compactRow,
          {
            backgroundColor: pressed
              ? dark
                ? "rgba(242, 205, 180, 0.10)"
                : "rgba(93, 50, 17, 0.08)"
              : "transparent",
          },
        ]}
        android_ripple={{
          color: dark ? "rgba(242, 205, 180, 0.08)" : "rgba(93, 50, 17, 0.08)",
        }}
        onPress={() => handleSermonClick(item)}
      >
        <View style={styles.compactContent}>
          {/* Icon button — slightly more vivid accent */}
          <GlassButton
            theme={theme}
            size={36}
            style={{
              marginRight: spacing.sm,
              elevation: 0,
              borderColor: dark
                ? "rgba(242,205,180,0.25)"
                : "rgba(93,50,17,0.22)",
              borderWidth: 1,
            }}
          >
            {item.type === "mp3" ? (
              <MaterialIcons
                name="multitrack-audio"
                size={responsiveFontSize(27)}
                color={dark ? "#f2cdb4" : "#5d3211"}
              />
            ) : (
              <MaterialIcons
                name="article"
                size={responsiveFontSize(27)}
                color={dark ? "#f2cdb4" : "#5d3211"}
              />
            )}
          </GlassButton>

          {/* Right section: scoped background tint & left border starting here */}
          <View
            style={[
              styles.compactTextContainer,
              {
                backgroundColor: dark
                  ? "rgba(242, 205, 180, 0.06)"
                  : "rgba(93, 50, 17, 0.045)",
                borderLeftWidth: 3,
                borderLeftColor: dark ? "#f2cdb4" : "#5d3211",
                paddingLeft: 10,
                paddingRight: 8,
                paddingVertical: 6,
                borderRadius: 0,
              },
            ]}
          >
            {/* Title — brighter and slightly larger */}
            <Text
              style={{
                fontSize: responsiveFontSize(16),
                color: dark ? "#fdf0e6" : theme.colors.text,
                fontFamily: "Merriweather",
                marginBottom: 3,
                letterSpacing: 0.1,
              }}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <View style={styles.compactMetaRow}>
              <Text
                style={[
                  styles.compactMetaText,
                  { color: dark ? theme.colors.text + "80" : "#5d321190" },
                ]}
                numberOfLines={1}
              >
                {item.date || "Unknown date"}
              </Text>

              {item.location ? (
                <Text
                  style={[
                    styles.compactMetaText,
                    { color: dark ? theme.colors.text + "68" : "#5d321170" },
                  ]}
                  numberOfLines={1}
                >
                  {item.location}
                </Text>
              ) : null}

              {/* ── Last Read badge (fully rounded borderless pill tag) ── */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: dark
                    ? "rgba(242, 205, 180, 0.28)"
                    : "rgba(252,246,237,0.98)",
                  borderRadius: 999,
                  paddingHorizontal: 8,
                  paddingVertical: 2.5,
                  gap: 3,
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={10}
                  color={dark ? "#ffdeca" : "#3b1e07"}
                />
                <Text
                  style={{
                    fontSize: 9.5,
                    fontFamily: "ZillaSlab-SemiBold",
                    color: dark ? "#ffdeca" : "#3b1e07",
                    letterSpacing: 0.4,
                  }}
                >
                  Last Read
                </Text>
              </View>

              {/* Type pill */}
              <View
                style={[
                  styles.compactTypePill,
                  {
                    backgroundColor: dark
                      ? "rgba(242,205,180,0.10)"
                      : "rgba(93,50,17,0.09)",
                  },
                ]}
              >
                <Text
                  style={[styles.compactTypePillText, { color: accentColor }]}
                >
                  {item.type === "mp3" ? "Audio" : "Text"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
      <View
        style={{
          height: 0.8,
          backgroundColor: dark
            ? "rgba(242, 205, 180, 0.10)"
            : "rgba(93, 50, 17, 0.15)",
          marginHorizontal: spacing.md,
          marginLeft: spacing.md + 44,
        }}
      />
    </Animated.View>
  );
});

// ─── Main list view ───────────────────────────────────────────────────────────
const SermonListView = React.memo(
  ({ theme, filteredSermons, handleSermonClick, listHeaderComponent, lastReadId }) => {
    const renderCompactItem = useCallback(
      ({ item, index }) => {
        // Delegate pinned row to its own component (owns its animation hooks)
        if (lastReadId != null && item.id === lastReadId) {
          return (
            <LastReadRow
              item={item}
              theme={theme}
              handleSermonClick={handleSermonClick}
            />
          );
        }

        return (
          <View key={item.id}>
            <Pressable
              style={({ pressed }) => [
                styles.compactRow,
                {
                  backgroundColor: pressed
                    ? theme.dark
                      ? "rgba(242, 205, 180, 0.12)"
                      : "rgba(93, 50, 17, 0.10)"
                    : index % 2 === 0
                      ? theme.dark
                        ? "rgba(242, 205, 180, 0.02)"
                        : "rgba(93, 50, 17, 0.02)"
                      : "transparent",
                  borderLeftWidth: 2,
                  borderLeftColor: pressed
                    ? theme.dark
                      ? "rgba(242, 205, 180, 0.55)"
                      : "#5d3211"
                    : "transparent",
                },
              ]}
              android_ripple={{
                color: theme.dark
                  ? "rgba(242, 205, 180, 0.08)"
                  : "rgba(93, 50, 17, 0.08)",
              }}
              onPress={() => handleSermonClick(item)}
            >
              <View style={styles.compactContent}>
                <GlassButton
                  theme={theme}
                  size={34}
                  style={{ marginRight: spacing.sm, elevation: 0 }}
                >
                  {item.type === "mp3" ? (
                    <MaterialIcons
                      name="multitrack-audio"
                      size={responsiveFontSize(26)}
                      color={theme.dark ? "#faeed180" : "#5d3211"}
                    />
                  ) : (
                    <MaterialIcons
                      name="article"
                      size={responsiveFontSize(26)}
                      color={theme.dark ? "#fdcfad" : "#5d3211"}
                    />
                  )}
                </GlassButton>

                <View style={styles.compactTextContainer}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(15.5),
                      color: theme.dark ? "#fae7da" : theme.colors.text,
                      fontFamily: "Merriweather",
                      marginBottom: 1,
                    }}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>

                  <View style={styles.compactMetaRow}>
                    <Text
                      style={[
                        styles.compactMetaText,
                        {
                          color: theme.dark
                            ? theme.colors.text + "70"
                            : "#5d321180",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.date || "Unknown date"}
                    </Text>

                    {item.location ? (
                      <Text
                        style={[
                          styles.compactMetaText,
                          {
                            color: theme.dark
                              ? theme.colors.text + "62"
                              : "#5d321168",
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {item.location}
                      </Text>
                    ) : null}

                    <View
                      style={[
                        styles.compactTypePill,
                        {
                          backgroundColor: theme.dark
                            ? "rgba(242,205,180,0.08)"
                            : "rgba(93,50,17,0.08)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.compactTypePillText,
                          { color: theme.dark ? "#f2cdb4" : "#5d3211" },
                        ]}
                      >
                        {item.type === "mp3" ? "Audio" : "Text"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>

            <View
              style={{
                height: 0.8,
                backgroundColor: theme.dark
                  ? "rgba(242, 205, 180, 0.10)"
                  : "rgba(93, 50, 17, 0.15)",
                marginHorizontal: spacing.md,
                marginLeft: spacing.md + 44,
              }}
            />
          </View>
        );
      },
      [theme, handleSermonClick, lastReadId],
    );

    return (
      <FlatList
        data={filteredSermons}
        renderItem={renderCompactItem}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={21}
        updateCellsBatchingPeriod={50}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.compactListContent}
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={
          <View
            style={{
              padding: spacing.lg,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: spacing.xxl,
            }}
          >
            <Ionicons
              name="search"
              size={responsiveFontSize(48)}
              color={theme.dark ? theme.colors.text + "40" : "#5d321140"}
              style={{ marginBottom: spacing.md }}
            />
            <Text
              style={{
                color: theme.dark ? theme.colors.text + "80" : "#5d3211",
                fontSize: responsiveFontSize(16),
                fontFamily: "ZillaSlab-SemiBold",
                fontWeight: "600",
                marginBottom: spacing.xs,
              }}
            >
              No sermons found
            </Text>
            <Text
              style={{
                color: theme.dark ? theme.colors.text + "60" : "#5d321190",
                fontSize: responsiveFontSize(13),
                fontFamily: "serif",
                textAlign: "center",
              }}
            >
              Try adjusting your search filters
            </Text>
          </View>
        }
      />
    );
  },
);

export default SermonListView;