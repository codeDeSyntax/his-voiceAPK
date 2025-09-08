import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { styles } from "../../styles/currentsermon";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";

const TopCardContent = ({
  theme,
  selectedSermon,
  onScrollToTop,
  onScrollToBottom,
  onBack,
  paragraphs,
  paragraphLayouts,
  scrollToParagraph,
  isCardOpen,
}) => {
  const scrollViewRef = useRef(null);
  const router = useNavigation();

  // add ZillaSlab font family
  const [fontsLoaded] = useFonts({
    ZillaSlab: require("../../assets/fonts/ZillaSlab-Regular.ttf"),
    ZillaSlabsm: require("../../assets/fonts/ZillaSlab-SemiBold.ttf"),
  });

  // Receipt-style separator component
  const ReceiptSeparator = () => (
    <View style={styles.receiptSeparator}>
      <Text style={[styles.receiptDots, { color: theme.colors.text }]}>
        • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • • •
      </Text>
    </View>
  );

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      time: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const { date: currentDate, time: currentTime } = getCurrentDateTime();

  return (
    <View
      style={[
        styles.topCardContainer,
        {
          borderColor: theme.dark ? "" : "red",
          display: !isCardOpen && "none",
        },
      ]}
    >
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.topCardScrollContent}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Modern Receipt Header */}
        <View style={styles.receiptHeader}>
          <View style={styles.modernHeaderContent}>
            <View style={styles.iconBadge}>
              <MaterialIcons
                name="menu-book"
                size={24}
                color={theme.dark ? "#f2cdb4" : "#5d3211"}
              />
            </View>
            <View style={styles.headerTextContainer}>
              <Text
                style={[
                  styles.modernTitle,
                  { color: theme.colors.text, fontFamily: "ZillaSlabsm" },
                ]}
              >
                Sermon Controls
              </Text>
              <Text
                style={[
                  styles.modernSubtitle,
                  { color: theme.colors.text + "70" },
                ]}
              >
                Quick actions & information
              </Text>
            </View>
            <View style={styles.timestampBadge}>
              <Text
                style={[
                  styles.receiptDateTime,
                  { color: theme.colors.text + "90" },
                ]}
              >
                {currentTime}
              </Text>
            </View>
          </View>
        </View>

        <ReceiptSeparator />

        {/* Modern Sermon Information Section */}
        <View style={styles.receiptSection}>
          <Text
            style={[
              styles.modernSectionHeader,
              { color: theme.colors.text, fontFamily: "ZillaSlabsm" },
            ]}
          >
            📖 CURRENT READING
          </Text>

          <View style={styles.modernInfoCard}>
            <View style={styles.sermonTitleContainer}>
              <MaterialIcons
                name="auto-stories"
                size={20}
                color={theme.dark ? theme.colors.hlight : "#5d3211"}
              />
              <Text
                style={[
                  styles.modernSermonTitle,
                  {
                    color: theme.dark ? "white" : "#5d3211",
                    fontFamily: "ZillaSlab",
                  },
                ]}
                numberOfLines={2}
              >
                {selectedSermon?.title || "No sermon selected"}
              </Text>
            </View>

            {selectedSermon?.date && (
              <View style={styles.modernInfoRow}>
                <View style={styles.infoIconContainer}>
                  <MaterialIcons
                    name="calendar-today"
                    size={16}
                    color={theme.colors.text + "80"}
                  />
                </View>
                <Text
                  style={[styles.modernInfoText, { color: theme.colors.text }]}
                >
                  {selectedSermon.date}
                </Text>
              </View>
            )}

            {selectedSermon?.location && (
              <View style={styles.modernInfoRow}>
                <View style={styles.infoIconContainer}>
                  <MaterialIcons
                    name="place"
                    size={16}
                    color={theme.colors.text + "80"}
                  />
                </View>
                <Text
                  style={[styles.modernInfoText, { color: theme.colors.text }]}
                >
                  {selectedSermon.location}
                </Text>
              </View>
            )}

            {/* Total Paragraphs Count */}
            <View style={styles.modernInfoRow}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons
                  name="format-list-numbered"
                  size={16}
                  color={theme.colors.text + "80"}
                />
              </View>
              <Text
                style={[styles.modernInfoText, { color: theme.colors.text }]}
              >
                {paragraphs?.length || 0} paragraphs
              </Text>
            </View>
          </View>
        </View>

        <ReceiptSeparator />

        {/* Modern Quick Actions Section */}
        <View style={styles.receiptSection}>
          <Text
            style={[
              styles.modernSectionHeader,
              { color: theme.colors.text, fontFamily: "ZillaSlabsm" },
            ]}
          >
            Quick Actions
          </Text>

          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[
                styles.quickActionItem,
                {
                  backgroundColor: theme.dark
                    ? "rgba(213, 122, 62, 0.15)"
                    : "rgba(93, 50, 17, 0.08)",
                },
              ]}
              onPress={onScrollToTop}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.quickActionIconContainer,
                  {
                    backgroundColor: theme.dark
                      ? theme.colors.hlight
                      : "#5d3211",
                  },
                ]}
              >
                <MaterialIcons
                  name="keyboard-arrow-up"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <Text
                style={[styles.quickActionLabel, { color: theme.colors.text }]}
              >
                To Top
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={16}
                color={theme.colors.text + "60"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionItem,
                {
                  backgroundColor: theme.dark
                    ? "rgba(213, 122, 62, 0.15)"
                    : "rgba(93, 50, 17, 0.08)",
                },
              ]}
              onPress={onScrollToBottom}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.quickActionIconContainer,
                  {
                    backgroundColor: theme.dark
                      ? theme.colors.hlight
                      : "#5d3211",
                  },
                ]}
              >
                <MaterialIcons
                  name="keyboard-arrow-down"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <Text
                style={[styles.quickActionLabel, { color: theme.colors.text }]}
              >
                To End
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={16}
                color={theme.colors.text + "60"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionItem,
                {
                  backgroundColor: theme.dark
                    ? "rgba(213, 122, 62, 0.15)"
                    : "rgba(93, 50, 17, 0.08)",
                },
              ]}
              onPress={onBack}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.quickActionIconContainer,
                  {
                    backgroundColor: theme.dark
                      ? theme.colors.hlight
                      : "#5d3211",
                  },
                ]}
              >
                <MaterialIcons name="list" size={20} color="#FFFFFF" />
              </View>
              <Text
                style={[styles.quickActionLabel, { color: theme.colors.text }]}
              >
                All Sermons
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={16}
                color={theme.colors.text + "60"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickActionItem,
                {
                  backgroundColor: theme.dark
                    ? "rgba(213, 122, 62, 0.15)"
                    : "rgba(93, 50, 17, 0.08)",
                },
              ]}
              onPress={() => router.push("Settings")}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.quickActionIconContainer,
                  {
                    backgroundColor: theme.dark
                      ? theme.colors.hlight
                      : "#5d3211",
                  },
                ]}
              >
                <MaterialIcons name="settings" size={20} color="#FFFFFF" />
              </View>
              <Text
                style={[styles.quickActionLabel, { color: theme.colors.text }]}
              >
                Settings
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={16}
                color={theme.colors.text + "60"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ReceiptSeparator />

        {/* Modern Receipt Footer */}
        <View style={styles.modernFooter}>
          <View style={styles.footerDivider}>
            <Text
              style={[
                styles.modernFooterDots,
                { color: theme.colors.text + "30" },
              ]}
            >
              • • • • • • • • • • • • • • • • • • • • • • • • • •
            </Text>
          </View>
          <Text
            style={[
              styles.modernFooterText,
              { color: theme.colors.text + "70" },
            ]}
          >
            🙏 Thank you for reading
          </Text>
          <Text
            style={[
              styles.modernFooterSubtext,
              { color: theme.colors.text + "50" },
            ]}
          >
            His Voice Sermon App
          </Text>
          <View style={styles.footerDivider}>
            <Text
              style={[
                styles.modernFooterDots,
                { color: theme.colors.text + "30" },
              ]}
            >
              • • • • • • • • • • • • • • • • • • • • • • • • • •
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TopCardContent;
