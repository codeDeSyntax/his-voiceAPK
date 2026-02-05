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

const TableHeader = React.memo(({ theme }) => (
  <View
    style={[
      styles.tableHeader,
      {
        backgroundColor: theme.dark ? "transparent" : "rgba(93, 50, 17, 0.06)",
        borderColor: theme.dark
          ? "rgba(242, 205, 180, 0.2)"
          : "rgba(93, 50, 17, 0.12)",
      },
    ]}
  >
    <Text
      style={[
        styles.tableHeaderText,
        {
          color: theme.colors.text,
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
          color: theme.colors.text,
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
          color: theme.colors.text,
          // width: responsiveFontSize(20),
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
    const [fontsLoaded] = useFonts({
      ZillaSlab_smb: require("../assets/fonts/ZillaSlab-SemiBold.ttf"),
    });

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
                    ? "rgba(242, 205, 180, 0.12)"
                    : "rgba(93, 50, 17, 0.12)"
                  : theme.dark
                    ? "transparent"
                    : "rgba(93, 50, 17, 0.04)",
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
                marginVertical: 0.5,
                borderRadius: 6,
                flexDirection: "row",
                alignItems: "center",
              },
            ]}
            android_ripple={{
              color: theme.dark
                ? "rgba(242, 205, 180, 0.12)"
                : "rgba(93, 50, 17, 0.12)",
            }}
            onPress={() => handleSermonClick(item)}
          >
            <View style={{ flex: 2 }}>
              <Text
                style={[
                  {
                    fontSize: responsiveFontSize(16),
                    color: theme.colors.text,
                    fontFamily: "ZillaSlab_smb",
                    marginBottom: spacing.xs,
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
                      fontSize: responsiveFontSize(14),
                      color: theme.dark
                        ? theme.colors.text + "80"
                        : "#5d321190",
                      fontStyle: "italic",
                      fontFamily: "serif",
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
                          ? theme.colors.text + "80"
                          : "#5d3211",
                        fontStyle: "italic",
                        fontFamily: "ZillaSlab",
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
                width: responsiveFontSize(30),
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.type === "mp3" ? (
                <FontAwesome5
                  name="microphone"
                  size={responsiveFontSize(14)}
                  color={theme.dark ? theme.colors.hlight + "60" : "#5d3211"}
                />
              ) : (
                <Ionicons
                  name="text"
                  size={responsiveFontSize(14)}
                  color={theme.dark ? "#906443" : "#5d3211"}
                />
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
                    ? "rgba(242, 205, 180, 0.08)"
                    : "rgba(93, 50, 17, 0.08)"
                  : theme.dark
                    ? "transparent"
                    : "rgba(93, 50, 17, 0.02)",
              },
            ]}
            android_ripple={{
              color: theme.dark
                ? "rgba(242, 205, 180, 0.12)"
                : "rgba(93, 50, 17, 0.12)",
            }}
            onPress={() => handleSermonClick(item)}
          >
            <View style={styles.compactContent}>
              <View
                style={[
                  styles.compactTypeIcon,
                  {
                    backgroundColor: theme.dark
                      ? theme.colors.primary
                      : "rgba(93, 50, 17, 0.1)",
                  },
                ]}
              >
                {item.type === "mp3" ? (
                  <FontAwesome5
                    name="microphone"
                    size={responsiveFontSize(12)}
                    color={theme.dark ? theme.colors.hlight : "#5d3211"}
                  />
                ) : (
                  <Ionicons
                    name="text"
                    size={responsiveFontSize(12)}
                    color={theme.dark ? "#906443" : "#5d3211"}
                  />
                )}
              </View>
              <View style={styles.compactTextContainer}>
                <Text
                  style={[
                    {
                      fontSize: responsiveFontSize(16),
                      color: theme.colors.text,
                      fontFamily: "ZillaSlab_smb",
                      marginBottom: 2,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    {
                      fontSize: responsiveFontSize(14),
                      color: theme.dark
                        ? theme.colors.text + "70"
                        : "#5d321180",
                      fontFamily: "serif",
                      fontStyle: "italic",
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
              height: 1,
              backgroundColor: theme.dark
                ? "rgba(242, 205, 180, 0.15)"
                : "rgba(93, 50, 17, 0.2)",
              marginHorizontal: spacing.md,
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
            <View style={{ padding: spacing.lg, alignItems: "center" }}>
              <Text
                style={{
                  color: theme.dark ? theme.colors.text + "80" : "#5d3211",
                  fontSize: responsiveFontSize(14),
                  fontFamily: "serif",
                }}
              >
                No sermons found
              </Text>
            </View>
          }
        />
      </>
    );
  },
);

export default SermonListView;
