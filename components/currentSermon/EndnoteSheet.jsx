/**
 * EndnoteSheet — floating animated bottom sheet
 *
 * Preview card (avatar + datecode · title + "Read more") expands in-place
 * to embed the full EndnoteResults view. Detached from all screen edges.
 */
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  ToastAndroid,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { searchEndnoteQuote } from "../../Logic/branhamApi";
import EndnoteResults from "./EndnoteResults";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const PREVIEW_HEIGHT = 140;
const EXPANDED_HEIGHT = Math.round(SCREEN_HEIGHT * 0.84);

const EndnoteSheet = ({ visible, endnoteData, theme, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [searchType, setSearchType] = useState("ExactPhrase");

  const heightAnim = useRef(new Animated.Value(PREVIEW_HEIGHT)).current;

  const isDark = theme?.dark || false;
  const accent = isDark ? "#f0b38b" : "#7a3b10";

  // Reset whenever the sheet is re-opened for a new endnote
  useEffect(() => {
    if (visible) {
      setExpanded(false);
      setSearchResults(null);
      setIsLoading(false);
      setNetworkError(false);
      heightAnim.setValue(PREVIEW_HEIGHT);
    }
  }, [visible, endnoteData, heightAnim]);

  const handleClose = useCallback(() => {
    setExpanded(false);
    heightAnim.setValue(PREVIEW_HEIGHT);
    onClose?.();
  }, [onClose, heightAnim]);

  const handleReadMore = useCallback(async () => {
    if (!endnoteData) return;
    setExpanded(true);
    setIsLoading(true);
    setSearchResults(null);
    setNetworkError(false);

    Animated.spring(heightAnim, {
      toValue: EXPANDED_HEIGHT,
      useNativeDriver: false,
      bounciness: 2,
      speed: 16,
    }).start();

    try {
      const results = await searchEndnoteQuote(endnoteData);
      if (
        results.searchMethod === "paragraph_reference" &&
        Platform.OS === "android"
      ) {
        ToastAndroid.show("Found by sermon reference", ToastAndroid.SHORT);
      }
      setSearchResults(results);
    } catch (err) {
      const isNetwork =
        err instanceof TypeError ||
        err.message?.toLowerCase().includes("network") ||
        err.message?.toLowerCase().includes("failed to fetch") ||
        err.message?.toLowerCase().includes("network request failed");
      if (isNetwork) {
        setNetworkError(true);
      } else if (Platform.OS === "android") {
        ToastAndroid.show("Error searching endnote", ToastAndroid.SHORT);
      }
    } finally {
      setIsLoading(false);
    }
  }, [endnoteData, heightAnim]);

  const handleRetry = useCallback(
    async (type) => {
      if (!endnoteData) return;
      setIsLoading(true);
      setNetworkError(false);
      setSearchType(type);
      try {
        const results = await searchEndnoteQuote(endnoteData, {
          searchType: type,
        });
        setSearchResults(results);
      } catch (err) {
        const isNetwork =
          err instanceof TypeError ||
          err.message?.toLowerCase().includes("network") ||
          err.message?.toLowerCase().includes("failed to fetch");
        if (isNetwork) setNetworkError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [endnoteData],
  );

  const previewTitle = endnoteData?.datecode
    ? `${endnoteData.datecode}  ·  ${endnoteData.title || ""}`.trim()
    : endnoteData?.title || "Endnote reference";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={[s.overlay, !expanded && s.overlayDetached]}>
        {/* Backdrop */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        {/* Sheet */}
        <Animated.View
          style={[
            s.sheet,
            {
              height: heightAnim,
              backgroundColor: isDark ? "#1b1310" : "#fdfaf7",
              shadowColor: isDark ? "#000" : "#5d3211",
              borderRadius: expanded ? 0 : 22,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
            },
          ]}
        >
          {/* Drag handle */}
          <View
            style={[
              s.dragHandle,
              {
                backgroundColor: isDark
                  ? "rgba(230,195,184,0.22)"
                  : "rgba(93,50,17,0.18)",
              },
            ]}
          />

          {/* Preview row — always visible */}
          <View style={s.previewRow}>
            <Image
              source={{
                uri: "https://www.livingwordbroadcast.org/LWBImages/Pictures/Picture%202.jpg",
              }}
              style={s.avatar}
              resizeMode="cover"
            />

            <View style={s.previewText}>
              <Text
                style={[
                  s.label,
                  {
                    color: isDark
                      ? "rgba(230,195,184,0.5)"
                      : "rgba(93,50,17,0.45)",
                  },
                ]}
              >
                WMB QUOTE
              </Text>

              <Text
                style={[s.title, { color: isDark ? "#e6c3b8" : "#3a1f0b" }]}
                numberOfLines={2}
              >
                {previewTitle}
              </Text>

              {!expanded && (
                <TouchableOpacity
                  onPress={handleReadMore}
                  activeOpacity={0.75}
                  style={[
                    s.readMoreBtn,
                    {
                      backgroundColor: isDark
                        ? "rgba(230,195,184,0.1)"
                        : "rgba(93,50,17,0.08)",
                    },
                  ]}
                >
                  <Text style={[s.readMoreText, { color: accent }]}>
                    Read more
                  </Text>
                  <Feather name="chevron-up" size={13} color={accent} />
                </TouchableOpacity>
              )}
            </View>

            {/* Close */}
            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              style={[
                s.closeBtn,
                {
                  backgroundColor: isDark
                    ? "rgba(230,195,184,0.08)"
                    : "rgba(93,50,17,0.06)",
                },
              ]}
            >
              <Feather
                name="x"
                size={16}
                color={isDark ? "rgba(230,195,184,0.7)" : "rgba(93,50,17,0.6)"}
              />
            </TouchableOpacity>
          </View>

          {/* Divider + embedded results */}
          {expanded && (
            <>
              <View
                style={[
                  s.divider,
                  {
                    backgroundColor: isDark
                      ? "rgba(230,195,184,0.1)"
                      : "rgba(93,50,17,0.08)",
                  },
                ]}
              />
              <EndnoteResults
                embedded
                visible
                onClose={handleClose}
                endnoteData={endnoteData}
                searchResults={searchResults}
                theme={theme}
                isLoading={isLoading}
                onRetrySearch={handleRetry}
                networkError={networkError}
              />
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.52)",
    justifyContent: "flex-end",
  },
  overlayDetached: {
    paddingHorizontal: 10,
    paddingBottom: 18,
  },
  sheet: {
    borderRadius: 22,
    overflow: "hidden",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 16,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 2,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 74,
    borderRadius: 10,
    backgroundColor: "#3a2010",
  },
  previewText: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: "ZillaSlabsm",
    fontSize: 9.5,
    letterSpacing: 2.5,
  },
  title: {
    fontFamily: "Merriweather",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 19,
  },
  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 100,
    marginTop: 3,
  },
  readMoreText: {
    fontFamily: "Merriweather",
    fontSize: 12,
    fontWeight: "600",
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
});

export default EndnoteSheet;
