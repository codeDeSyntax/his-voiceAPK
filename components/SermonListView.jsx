import React, { useRef, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles/Allsermons";
import { useAppContext } from "../Logic/globalState";
import { Pressable } from "react-native-gesture-handler";
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
        backgroundColor: theme.dark ? theme.colors.primary + "20" : "#f5f5f5",
        borderColor: theme.dark ? theme.colors.primary : "#bbb8b8",
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
  }) => {
    const [fontsLoaded] = useFonts({
      ZillaSlab_smb: require("../assets/fonts/ZillaSlab-SemiBold.ttf"),
    });

    const renderSermonItem = useCallback(
      ({ item, index }) => (
        <Pressable
          key={item.id}
          style={[
            styles.tableRow,
            {
              backgroundColor: theme.dark ? "transparent" : "transparent",
              borderColor: theme.dark ? theme.colors.primary : "#bbb8b8",
              borderWidth: 1,
              borderRadius: 10,
            },
          ]}
          android_ripple={{
            color: theme.dark ? "#58320cef" : "rgba(0,0,0,0.05)",
          }}
          onPress={() => handleSermonClick(item)}
        >
          <View style={[styles.tableCell, { flex: 2 }]}>
            <Text
              style={[
                styles.tableCellTitle,
                {
                  color: theme.colors.text,
                  fontFamily: "ZillaSlab_smb",
                },
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>
            {
              item.location &&
              <Text
              style={[
                styles.tableCellLocation,
                {
                  color: theme.dark ? theme.colors.text + "80" : "#5d3211",
                },
              ]}
              numberOfLines={1}
            >
              {item.location}
            </Text>
            }
            <View style={[styles.tableCell, ]}>
            <Text
              style={[
                styles.tableCellDate,
                {
                  color: theme.dark ? theme.colors.text + "80" : "#5d321190",
                },
              ]}
            >
              {item.date}
            </Text>
          </View>
          </View>

          

          <View
            style={[
              styles.tableCell,
              { width: responsiveFontSize(30), alignItems: "center" },
            ]}
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
      ),
      [theme, handleSermonClick]
    );

    return (
      <>
        <TableHeader theme={theme} />
        <FlatList
          data={filteredSermons}
          renderItem={renderSermonItem}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          getItemLayout={(data, index) => ({
            length: 70, // Approximate height of each item
            offset: 70 * index,
            index,
          })}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
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
  }
);

export default SermonListView;
