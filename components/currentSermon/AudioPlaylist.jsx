import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  TextInput,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
  Animated,
} from "react-native";
import { Ionicons, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { responsiveFontSize, spacing } from "../../Utils/responsiveUtils";
import { getSermonsByType } from "../../database/sermonDB";
import { useAppContext } from "../../Logic/globalState";
import { GlassButton } from "../../styles/glassButton";

const AudioPlaylist = ({ visible, onClose, currentSermon, onSermonSelect }) => {
  const { theme } = useAppContext();
  const [sermons, setSermons] = useState([]);
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const focusAnim = useRef(new Animated.Value(0)).current;
  const debounceRef = useRef(null);

  // Theme colors
  const isDark = theme.dark;
  const bgColor = theme.colors.background;
  const textColor = theme.colors.text;
  const accentColor = theme.colors.primary;

  // Focus animation for search input - matching SearchHeader
  const handleSearchFocus = useCallback(() => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const handleSearchBlur = useCallback(() => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const animatedBg = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? "rgba(255,255,255,0.07)" : "rgba(93,50,17,0.05)",
      isDark ? "rgba(255,255,255,0.11)" : "rgba(93,50,17,0.08)",
    ],
  });

  const animatedBorder = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? "rgba(255,255,255,0.09)" : "rgba(93,50,17,0.18)",
      isDark ? "rgba(242,205,180,0.30)" : "rgba(93,50,17,0.35)",
    ],
  });

  // Load all MP3 sermons
  useEffect(() => {
    if (visible) {
      loadSermons();
    }
  }, [visible]);

  // Filter sermons based on search query with debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (searchQuery.trim() === "") {
        setFilteredSermons(sermons);
      } else {
        const query = searchQuery.toLowerCase();
        const filtered = sermons.filter(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.location?.toLowerCase().includes(query) ||
            s.date?.toLowerCase().includes(query),
        );
        setFilteredSermons(filtered);
      }
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, sermons]);

  const loadSermons = async () => {
    try {
      setLoading(true);
      const audioSermons = await getSermonsByType("mp3");
      setSermons(audioSermons);
      setFilteredSermons(audioSermons);
    } catch (error) {
      console.error("Error loading audio sermons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSermonPress = (sermon) => {
    onSermonSelect(sermon);
    onClose();
  };

  const renderSermonItem = ({ item, index }) => {
    const isPlaying = currentSermon?.id === item.id;

    return (
      <View key={item.id}>
        <Pressable
          style={({ pressed }) => [
            styles.compactRow,
            {
              backgroundColor: pressed
                ? isDark
                  ? "rgba(242, 205, 180, 0.12)"
                  : "rgba(93, 50, 17, 0.10)"
                : isPlaying
                  ? isDark
                    ? "rgba(242, 205, 180, 0.06)"
                    : "rgba(93, 50, 17, 0.05)"
                  : index % 2 === 0
                    ? isDark
                      ? "rgba(242, 205, 180, 0.02)"
                      : "rgba(93, 50, 17, 0.02)"
                    : "transparent",
              borderLeftWidth: 2,
              borderLeftColor: isPlaying ? accentColor : "transparent",
            },
          ]}
          android_ripple={{
            color: isDark
              ? "rgba(242, 205, 180, 0.08)"
              : "rgba(93, 50, 17, 0.08)",
          }}
          onPress={() => {
            onSermonSelect(item);
            onClose();
          }}
        >
          <View style={styles.compactContent}>
            {/* Glass button avatar with rounded image */}
            <GlassButton theme={theme} size={36} style={{ marginRight: spacing.sm }}>
              <Image
                source={require("../../assets/roundedLam.png")}
                style={styles.avatarImage}
              />
            </GlassButton>

            <View style={styles.compactTextContainer}>
              <Text
                style={[
                  styles.compactTitle,
                  {
                    color: textColor,
                  },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {(item.date || item.location) && (
                <Text
                  style={[
                    styles.compactDate,
                    {
                      color: isDark
                        ? textColor + "70"
                        : "#5d321180",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.date} {item.location && `• ${item.location}`}
                </Text>
              )}
            </View>

            {isPlaying ? (
              <Ionicons
                name="play-circle"
                size={24}
                color={accentColor}
              />
            ) : (
              <Ionicons
                name="play-circle-outline"
                size={24}
                color={isDark ? textColor + "40" : "#5d321140"}
                style={{ opacity: 0.5 }}
              />
            )}
          </View>
        </Pressable>

        {/* Separator line - matching SermonListView */}
        <View
          style={{
            height: 0.8,
            backgroundColor: isDark
              ? "rgba(242, 205, 180, 0.10)"
              : "rgba(93, 50, 17, 0.15)",
            marginHorizontal: spacing.md,
            marginLeft: spacing.md + 28,
          }}
        />
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      {/* Search input with focus animation - matching SearchHeader */}
      <Animated.View
        style={[
          styles.searchContainer,
          {
            backgroundColor: animatedBg,
            borderColor: animatedBorder,
          },
        ]}
      >
        <MaterialIcons
          name="search"
          size={18}
          color={
            isDark ? "rgba(255,255,255,0.4)" : "rgba(93,50,17,0.45)"
          }
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.searchInput,
            { color: textColor },
          ]}
          placeholder="Search sermons..."
          placeholderTextColor={
            isDark ? "rgba(255,255,255,0.35)" : "rgba(93,50,17,0.45)"
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          selectionColor={isDark ? textColor : "#5d3211"}
          spellCheck={false}
          autoCorrect={false}
          keyboardAppearance={isDark ? "dark" : "light"}
        />
        {searchQuery.length > 0 && (
          <Pressable
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AntDesign
              name="close"
              size={14}
              color={
                isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
              }
            />
          </Pressable>
        )}
      </Animated.View>

      {/* Count label */}
      <Text style={[styles.countLabel, { color: isDark ? textColor + "80" : "#5d3211" }]}>
        {filteredSermons.length} sermon{filteredSermons.length !== 1 ? "s" : ""}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View
      style={{
        padding: spacing.lg,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: spacing.xxl,
      }}
    >
      <Ionicons
        name="musical-notes-outline"
        size={responsiveFontSize(48)}
        color={isDark ? textColor + "40" : "#5d321140"}
        style={{ marginBottom: spacing.md }}
      />
      <Text
        style={{
          color: isDark ? textColor + "80" : "#5d3211",
          fontSize: responsiveFontSize(16),
          fontFamily: "Philosopher",
          marginBottom: spacing.xs,
        }}
      >
        No audio sermons found
      </Text>
      <Text
        style={{
          color: isDark ? textColor + "60" : "#5d321190",
          fontSize: responsiveFontSize(13),
          fontFamily: "Philosopher",
          textAlign: "center",
        }}
      >
        Try adjusting your search filters
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={bgColor}
          translucent={false}
        />

        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={28} color={textColor} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              Audio Sermons
            </Text>
            <Text style={[styles.headerSubtitle, { color: isDark ? textColor + "80" : "#5d3211" }]}>
              Choose a message to play
            </Text>
          </View>

          <View style={styles.closeButton} />
        </View>

        {/* Sermon list */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={[styles.loadingText, { color: isDark ? textColor + "80" : "#5d3211" }]}>
              Loading sermons...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredSermons}
            renderItem={renderSermonItem}
            keyExtractor={(item) => item.id.toString()}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={11}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: responsiveFontSize(18),
    fontFamily: "Philosopher",
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: responsiveFontSize(11),
    fontFamily: "Philosopher",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 0,
    paddingBottom: spacing.lg,
  },

  // Header section - matching SearchHeader layout
  headerSection: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 48,
    fontFamily: "Philosopher",
    paddingHorizontal: 8,
  },
  clearButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(150,150,150,0.1)",
  },
  countLabel: {
    fontSize: responsiveFontSize(11),
    fontFamily: "Philosopher",
    letterSpacing: 0.5,
    opacity: 0.7,
    paddingHorizontal: spacing.md,
  },

  // Compact view styles - matching SermonListView
  compactRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.sm,
    marginVertical: 0,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactTextContainer: {
    flex: 1,
  },
  compactTitle: {
    fontSize: responsiveFontSize(15.5),
    fontFamily: "Philosopher",
    marginBottom: spacing.xs,
  },
  compactDate: {
    fontSize: responsiveFontSize(13),
    fontFamily: "Philosopher",
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: responsiveFontSize(13),
    fontFamily: "Philosopher",
    marginTop: 12,
  },
});

export default AudioPlaylist;
