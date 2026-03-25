import React, { useCallback } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles/Allsermons";
import { responsiveFontSize, spacing } from "../Utils/responsiveUtils";
import { GlassButton } from "../styles/glassButton";

const SermonListView = React.memo(
  ({ theme, filteredSermons, handleSermonClick }) => {
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
              <View style={styles.compactTextContainer}>
                <Text
                  style={[
                    {
                      fontSize: responsiveFontSize(15.5),
                      color: theme.colors.text,
                      fontFamily: "Merriweather",
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
        getItemLayout={(data, index) => ({
          length: 50,
          offset: 50 * index,
          index,
        })}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.compactListContent}
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
    );
  },
);

export default SermonListView;
