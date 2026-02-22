import React, { useRef, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles/Allsermons";
import { useAppContext } from "../Logic/globalState";
import { useFonts } from "expo-font";
import {
  responsiveFontSize,
  horizontalScale,
  spacing,
} from "../Utils/responsiveUtils";
import { fontsToLoad } from "../Utils/fonts";

const TableHeader = React.memo(({ theme }) => (
  <View
    style={[
      styles.tableHeader,
      {
        backgroundColor: theme.dark ? "transparent" : "rgba(93, 50, 17, 0.08)",
        borderColor: theme.dark
          ? "rgba(242, 205, 180, 0.15)"
          : "rgba(93, 50, 17, 0.15)",
      },
    ]}
  >
    <Text
      style={[
        styles.tableHeaderText,
        {
          color: theme.dark ? theme.colors.text : "#5d3211",
          flex: 1,
        },
      ]}
    >
      Title
    </Text>
    <Text
      style={[
        styles.tableHeaderText,
        {
          color: theme.dark ? theme.colors.text : "#5d3211",
          flex: 1,
          textAlign: "center",
        },
      ]}
    >
      Date
    </Text>
    <Text
      style={[
        styles.tableHeaderText,
        {
          color: theme.dark ? theme.colors.text : "#5d3211",
          textAlign: "center",
        },
      ]}
    >
      Type
    </Text>
  </View>
));

const SermonListView = React.memo(
  ({
    theme,
    filteredSermons,
    handleSermonClick,
    setSearchText,
    allSermons,
    setFilteredSermons,
    viewMode = "table",
  }) => {
    const [fontsLoaded] = useFonts(fontsToLoad);

    // Table view with alternating backgrounds - compact spacing
    const renderTableItem = useCallback(
      ({ item, index }) => {
        return (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              {
                backgroundColor: pressed
                  ? theme.dark
                    ? "rgba(242, 205, 180, 0.15)"
                    : "rgba(93, 50, 17, 0.15)"
                  : index % 2 === 0
                    ? theme.dark
                      ? "rgba(242, 205, 180, 0.03)"
                      : "rgba(93, 50, 17, 0.03)"
                    : "transparent",
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.md,
                marginVertical: 1,
                marginHorizontal: spacing.md,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                borderLeftWidth: 3,
                borderLeftColor: pressed
                  ? theme.dark
                    ? theme.colors.primary
                    : "#5d3211"
                  : "transparent",
              },
            ]}
            android_ripple={{
              color: theme.dark
                ? "rgba(242, 205, 180, 0.1)"
                : "rgba(93, 50, 17, 0.1)",
            }}
            onPress={() => handleSermonClick(item)}
          >
            <View style={{ flex: 2, paddingRight: spacing.sm }}>
              <Text
                style={[
                  {
                    fontSize: responsiveFontSize(15.5),
                    color: theme.colors.text,
                    fontFamily: "Lora",
                    marginBottom: spacing.xs,
                    fontWeight: "700",
                  },
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={[
                    {
                      fontSize: responsiveFontSize(13),
                      color: theme.dark
                        ? theme.colors.text + "70"
                        : "#5d321180",
                      fontStyle: "italic",
                      fontFamily: "Merriweather",
                    },
                  ]}
                >
                  {item.date}
                </Text>
                {item.location && (
                  <Text
                    style={[
                      {
                        fontSize: responsiveFontSize(12),
                        color: theme.dark
                          ? theme.colors.text + "60"
                          : "#5d3211",
                        fontFamily: "Merriweather",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.location}
                  </Text>
                )}
              </View>
            </View>

            <View
              style={{
                width: responsiveFontSize(45),
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.dark
                  ? "rgba(242, 205, 180, 0.08)"
                  : "rgba(93, 50, 17, 0.08)",
                borderRadius: 8,
                paddingVertical: spacing.sm,
              }}
            >
              {item.type === "mp3" ? (
                <View>
                  <FontAwesome5
                    name="microphone"
                    size={responsiveFontSize(32)}
                    color={theme.dark ? theme.colors.primary : "#5d3211"}
                  />
                  <Text
                    style={{
                      fontSize: responsiveFontSize(10),
                      color: theme.dark ? theme.colors.primary : "#5d3211",
                      marginTop: 2,
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Audio
                  </Text>
                </View>
              ) : (
                <View>
                  <Ionicons
                    name="document-text"
                    size={responsiveFontSize(16)}
                    color={theme.dark ? "#906443" : "#5d3211"}
                  />
                  <Text
                    style={{
                      fontSize: responsiveFontSize(10),
                      color: theme.dark ? "#906443" : "#5d3211",
                      marginTop: 2,
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Text
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      },
      [theme, handleSermonClick],
    );

    // Compact view - minimal list layout with separator
    const renderCompactItem = useCallback(
      ({ item, index }) => (
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
                    ? theme.colors.primary
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
              <View
                style={[
                  styles.compactTypeIcon,
                  {
                    backgroundColor: theme.dark
                      ? "rgba(242, 205, 180, 0.15)"
                      : "rgba(93, 50, 17, 0.10)",
                  },
                ]}
              >
                {item.type === "mp3" ? (
                  <FontAwesome5
                    name="microphone"
                    size={responsiveFontSize(32)}
                    color={theme.dark ? theme.colors.primary : "#5d3211"}
                  />
                ) : (
                  <Ionicons
                    name="document-text"
                    size={responsiveFontSize(32)}
                    color={theme.dark ? "#906443" : "#5d3211"}
                  />
                )}
              </View>
              <View style={styles.compactTextContainer}>
                <Text
                  style={[
                    {
                      fontSize: responsiveFontSize(15.5),
                      color: theme.colors.text,
                      fontFamily: "ZillaSlab_smb",
                      marginBottom: spacing.xs,
                      // fontWeight: "700",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    {
                      fontSize: responsiveFontSize(13),
                      color: theme.dark
                        ? theme.colors.text + "70"
                        : "#5d321180",
                      fontFamily: "Merriweather",
                    },
                  ]}
                >
                  {item.date} {item.location && `• ${item.location}`}
                </Text>
              </View>
            </View>
          </Pressable>
          {/* Separator line */}
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

    // Choose render function based on viewMode - only table and compact
    const renderSermonItem = useMemo(() => {
      switch (viewMode) {
        case "compact":
          return renderCompactItem;
        default:
          return renderTableItem;
      }
    }, [viewMode, renderCompactItem, renderTableItem]);

    return (
      <>
        {viewMode === "table" && <TableHeader theme={theme} />}
        <FlatList
          data={filteredSermons}
          renderItem={renderSermonItem}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          getItemLayout={
            viewMode === "table"
              ? (data, index) => ({
                  length: 70, // Approximate height of each item
                  offset: 70 * index,
                  index,
                })
              : (data, index) => ({
                  length: 50, // Compact height
                  offset: 50 * index,
                  index,
                })
          }
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            viewMode === "compact" && styles.compactListContent,
          ]}
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
                  fontFamily: "ZillaSlab_smb",
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
      </>
    );
  },
);

export default SermonListView;
