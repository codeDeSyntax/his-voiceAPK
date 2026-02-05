import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const LetterModal = ({
  theme,
  isVisible,
  closeDropdown,
  alphabet,
  setSelectedLetter,
}) => {
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleLetterSelect = (letter) => {
    setSelectedLetter(letter);
    closeDropdown();
  };

  const ReceiptDivider = () => (
    <View style={styles.receiptDivider}>
      <Text style={[styles.dashes, { color: theme.colors.text }]}>
        - - - - - - - - - - - - - - - - - - - - -
      </Text>
    </View>
  );

  const renderLetterItem = ({ item, index }) => (
    <Pressable
      style={[
        styles.gridLetterItem,
        {
          backgroundColor: theme.dark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.05)",
          borderColor: theme.dark ? "#444" : "#ddd",
        },
      ]}
      onPress={() => handleLetterSelect(item)}
      android_ripple={{
        color: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      }}
    >
      <Text style={[styles.gridLetterText, { color: theme.colors.text }]}>
        {item}
      </Text>
    </Pressable>
  );

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      onRequestClose={closeDropdown}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.overlayTouchable} onPress={closeDropdown} />

        <Animated.View
          style={[
            styles.receiptCard,
            {
              backgroundColor: theme.dark ? "#1a1a1a" : "#ffffff",
              borderColor: theme.dark ? "#333" : "#e0e0e0",
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Receipt Header */}
          <View style={styles.receiptHeader}>
            <Text style={[styles.receiptTitle, { color: theme.colors.text }]}>
              ╔═══════════════╗
            </Text>
            <Text
              style={[styles.receiptSubtitle, { color: theme.colors.text }]}
            >
              ║ SELECT LETTER ║
            </Text>
            <Text style={[styles.receiptTitle, { color: theme.colors.text }]}>
              ╚═══════════════╝
            </Text>
          </View>

          <ReceiptDivider />

          {/* Letter Grid */}
          <View style={styles.receiptBody}>
            <FlatList
              data={alphabet}
              renderItem={renderLetterItem}
              keyExtractor={(item) => item}
              numColumns={5}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.gridRow}
            />
          </View>

          <ReceiptDivider />

          {/* All Letters Button */}
          <Pressable
            style={[
              styles.receiptFooterButton,
              {
                backgroundColor: theme.dark ? "#2a2a2a" : "#f5f5f5",
                borderColor: theme.dark ? "#444" : "#ddd",
              },
            ]}
            onPress={() => handleLetterSelect("All Letters")}
            android_ripple={{
              color: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            }}
          >
            <Text
              style={[styles.receiptFooterText, { color: theme.colors.text }]}
            >
              ◈ ALL LETTERS ◈
            </Text>
          </Pressable>

          {/* Receipt Bottom Border */}
          <View style={styles.receiptBottom}>
            <Text
              style={[styles.receiptBottomText, { color: theme.colors.text }]}
            >
              ╰──────────────╯
            </Text>
          </View>

          {/* Close Button */}
          <Pressable
            style={[
              styles.closeButton,
              { backgroundColor: theme.dark ? "#333" : "#ddd" },
            ]}
            onPress={closeDropdown}
          >
            <Text
              style={[styles.closeButtonText, { color: theme.colors.text }]}
            >
              ✕
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  overlayTouchable: {
    flex: 1,
    width: "100%",
  },
  receiptCard: {
    position: "absolute",
    top: 60,
    right: 20,
    width: screenWidth * 0.65, // Slightly wider for 5 columns of letters
    height: "50%", // Taller to accommodate more letters
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  receiptHeader: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: "center",
  },
  receiptTitle: {
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "bold",
    textAlign: "center",
  },
  receiptSubtitle: {
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 1,
  },
  receiptDivider: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  dashes: {
    fontSize: 8,
    fontFamily: "monospace",
    textAlign: "center",
    letterSpacing: 1,
  },
  receiptBody: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  gridContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 4,
  },
  gridRow: {
    justifyContent: "space-around",
    marginVertical: 2,
  },
  gridLetterItem: {
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "dotted",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
    maxWidth: 32,
  },
  gridLetterText: {
    fontSize: 12,
    fontFamily: "monospace",
    fontWeight: "bold",
    textAlign: "center",
  },
  receiptFooterButton: {
    marginHorizontal: 8,
    marginVertical: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "dotted",
    alignItems: "center",
  },
  receiptFooterText: {
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  receiptBottom: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    alignItems: "center",
  },
  receiptBottomText: {
    fontSize: 10,
    fontFamily: "monospace",
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  closeButtonText: {
    fontSize: 12,
    fontWeight: "bold",
  },
};

export default LetterModal;
