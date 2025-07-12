import { StyleSheet, Platform, StatusBar, Dimensions } from "react-native";
import {
  responsiveFontSize,
  horizontalScale,
  verticalScale,
  spacing,
} from "../Utils/responsiveUtils";

const { width, height } = Dimensions.get("window");
const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight;
const TOP_BAR_HEIGHT = 60;
const BOTTOM_SHEET_HANDLE_HEIGHT = 20;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: STATUSBAR_HEIGHT,
  },
  scrollViewContainer: {
    paddingHorizontal: spacing.sm, // 8px consistent horizontal padding
    paddingTop: spacing.sm, // 8px consistent top padding
    paddingBottom: spacing.xxl * 3, // 96px for bottom sheet clearance
  },
  sermonText: {
    lineHeight: responsiveFontSize(20), // Tighter line height for better flow
    marginBottom: spacing.xs / 2, // Even tighter spacing (2px) for close paragraph flow
    textAlign: "left",
    paddingVertical: 0, // Remove vertical padding for tighter gaps
  },
  highlightedText: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    color: "#3B82F6",
    // fontWeight: "bold",
  },
  endnoteText: {
    textDecorationLine: "underline",

    fontWeight: "500",
    // fontStyle: "italic",
    fontFamily: "",
  },
  titleText: {
    fontFamily: "serif",
    fontWeight: "900",
    fontSize: responsiveFontSize(20),
    textAlign: "center",
    marginBottom: spacing.sm, // 8px consistent spacing
    textDecorationLine: "underline",
  },
  locationText: {
    fontFamily: "serif",
    fontWeight: "500",
    fontSize: responsiveFontSize(14),
    fontStyle: "italic",
    marginBottom: spacing.lg, // 16px consistent spacing
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    top: "60%",
    backgroundColor: "#2d2d2d",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 5,
    zIndex: 100,
  },

  // Bottom sheet styles - Updated for custom implementation
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.8, // Maximum height (80% of screen)
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    zIndex: 60,
  },
  bottomSheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9D9D9",
    marginVertical: 10,
    alignSelf: "center",
  },
  bottomSheetContent: {
    padding: 16,
  },

  topCardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 90,
  },
  topCard: {
    position: "absolute",
    top: STATUSBAR_HEIGHT + 20,
    right: 10,
    width: width * 0.85,
    height: height * 0.8,
    borderRadius: 20, // More receipt-like sharp corners
    backgroundColor: "white",
    // Receipt-style border pattern
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#333",
    shadowColor: "#000",
    shadowOffset: { width: -3, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 95,
  },
  topCardContainer: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  topCardScrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  topCardCloseButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderWidth: 1,
    borderStyle: "dotted",
  },

  // Receipt Header Styles
  receiptHeader: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  receiptTitle: {
    fontSize: responsiveFontSize(14),
    // fontWeight: "900",
    // letterSpacing: 2,
    textAlign: "center",
  },
  receiptSubtitle: {
    fontSize: responsiveFontSize(10),
    fontWeight: "600",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    textAlign: "center",
    marginTop: spacing.xs,
  },
  receiptDateTime: {
    fontSize: responsiveFontSize(9),
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    textAlign: "center",
    marginTop: spacing.xs,
    letterSpacing: 0.5,
  },

  // Receipt Separator
  receiptSeparator: {
    paddingVertical: 6,
    alignItems: "center",
  },
  receiptDots: {
    fontSize: responsiveFontSize(8),
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 1,
    opacity: 0.6,
  },

  // Receipt Sections
  receiptSection: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  receiptSectionHeader: {
    fontSize: responsiveFontSize(14),
    fontFamily: "ZillaSlabsm",
    // fontWeight: "bold",
    marginBottom: spacing.xs,
    textAlign: "center",
    // letterSpacing: 1,
  },

  // Receipt Items
  receiptItem: {
    marginBottom: 4,
    paddingHorizontal: 2,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-start",
    // alignItems: "center",
  },
  receiptLabel: {
    fontSize: responsiveFontSize(14),
    fontFamily: "ZillaSlab",
    marginRight: spacing.xs,
  },
  receiptValue: {
    fontSize: responsiveFontSize(14),
    fontFamily: "ZillaSlab",
    flex: 1,
  },

  // Search Styles
  receiptSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  receiptSearchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    // borderWidth: 1,
    // borderStyle: "dashed",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 32,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  receiptSearchInput: {
    flex: 1,
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 0.5,
    borderRadius: 5,
  },
  receiptClearButton: {
    padding: 2,
    marginLeft: 4,
  },
  receiptClearText: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  receiptSearchButton: {
    width: 35,
    height: 45,
    borderWidth: 1,
    borderRadius: 10,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  receiptSearchButtonText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 0.5,
    paddingVertical: 10,
  },

  // Loading
  receiptLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 8,
  },
  receiptLoadingText: {
    fontSize: 9,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 1,
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl * 2,
  },
  loadingText: {
    fontSize: responsiveFontSize(16),
    fontFamily: "serif",
    textAlign: "center",
    opacity: 0.7,
  },

  // Search Results
  receiptResults: {
    marginTop: 6,
    paddingHorizontal: 2,
  },
  receiptResultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  receiptResultsCount: {
    fontSize: 9,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 0.5,
  },
  receiptResultsPosition: {
    fontSize: 9,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 0.5,
  },
  receiptNavRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  receiptNavButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 50,
  },
  receiptNavButtonText: {
    fontSize: 9,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 0.5,
  },

  // No Results
  receiptNoResults: {
    alignItems: "center",
    paddingVertical: 8,
  },
  receiptNoResultsText: {
    fontSize: 9,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 1,
    textAlign: "center",
  },

  // Actions Grid
  receiptActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 2,
  },
  receiptActionButton: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    // borderWidth: 1,
    // borderStyle: "dashed",
    width: "48%",
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 10,
  },
  receiptActionCode: {
    fontSize: 12,
    fontWeight: "900",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 1,
    marginBottom: 2,
  },
  receiptActionText: {
    fontSize: 8,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  // Receipt Footer
  receiptFooter: {
    alignItems: "center",
    paddingVertical: 8,
  },
  receiptFooterText: {
    fontSize: 9,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    letterSpacing: 1,
    textAlign: "center",
    lineHeight: 12,
  },
  receiptFooterSmall: {
    fontSize: 8,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // Paragraph styles - Consistent spacing system
  // Container: spacing.md (12px) between paragraphs
  // Text: lineHeight 28px for optimal readability
  // Numbers: spacing.xs (4px) margin from text
  paragraphContainer: {
    flexDirection: "row",
    marginBottom: spacing.md, // Consistent 12px spacing
    borderRadius: 5,
  },
  paragraphHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  paragraphNumberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs / 2, // Tighter spacing (2px) between number and text
  },
  paragraphNumber: {
    fontSize: responsiveFontSize(14),
    fontWeight: "500",
    marginRight: spacing.xs,
  },
  paragraphNumberButton: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    marginRight: spacing.xs,
    minWidth: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  paragraphText: {
    flex: 1,
    lineHeight: 24, // Tighter line height for better reading flow
    paddingLeft: 8,
    marginBottom: spacing.xs / 2, // Minimal spacing (2px) between paragraphs
    paddingVertical: 0, // Remove vertical padding for consistent gaps
  },
  paragraphContainer: {
    marginBottom: spacing.xs, // Consistent 4px gap between paragraph containers
    paddingHorizontal: 0,
    paddingVertical: 0, // Remove container padding for tighter spacing
  },
  selectableTextContainer: {
    flex: 1,
    paddingLeft: 8,
  },
  selectionModeIndicator: {
    position: "absolute",
    top: -25,
    right: 0,
    backgroundColor: "rgba(59, 130, 246, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  selectionModeText: {
    fontSize: responsiveFontSize(10),
    fontWeight: "500",
    color: "#fff",
  },

  // Selection tip styles
  selectionTipContainer: {
    position: "absolute",
    bottom: 150,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(59, 130, 246, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 80,
  },
  selectionTipText: {
    fontSize: responsiveFontSize(12),
    textAlign: "center",
    lineHeight: 18,
    fontWeight: "500",
  },

  // Controls in bottom sheet
  controlSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    // justifyContent: "space-around",
    gap: 2,
    alignItems: "center",
    marginBottom: 12,
  },
  controlButton: {
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
  },
  controlButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },

  // Search section
  searchContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    height: 40,
  },
  searchResults: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  navigationButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  navButton: {
    padding: 8,
    marginHorizontal: 5,
    backgroundColor: "#2d2d2d",
    borderRadius: 8,
  },
  navButtonText: {
    color: "white",
    fontSize: 14,
  },
  matchesText: {
    fontSize: 14,
    color: "#555",
    fontFamily: "serif",
  },

  // Sermon info section
  sermonInfoContainer: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 16,
  },
  sermonInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    fontFamily: "serif",
  },
  sermonInfoText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "serif",
  },

  // Top bar styles
  topBar: {
    position: "absolute",
    top: STATUSBAR_HEIGHT,
    left: 0,
    right: 0,
    height: TOP_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitleContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "serif",
    fontFamily: "serif",
  },
  topBarButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  topBarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },

  // Search Feedback styles
  feedbackContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 70,
  },
  feedbackText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "serif",
  },
  copyingParagraph: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },

  copyingParagraph: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },

  // Text selection indication
  textSelectable: {
    backgroundColor: "rgba(0, 123, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 123, 255, 0.2)",
    borderRadius: 4,
  },

  // Optional: Add this toast/notification style for copy feedback
  copyToast: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 1000,
  },
  copyToastText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },

  bookmarkButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  bookmarkButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  highlightButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs / 2,
    borderRadius: 12,
  },
  highlightButtonActive: {
    backgroundColor: "rgba(230, 195, 184, 0.1)",
    transform: [{ scale: 1.05 }],
  },
  paletteOverlay: {
    position: "absolute",
    top: -120,
    left: -200,
    width: 300,
    height: 200,
    zIndex: 999,
  },

  searchLoader: {
    position: "absolute",
    right: spacing.sm,
    top: "50%",
    transform: [{ translateY: -12 }],
  },

  // Search Section Styles
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    position: "relative",
  },
  searchInput: {
    flex: 1,
    height: verticalScale(50),
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingRight: spacing.xl,
    fontSize: responsiveFontSize(14),
    marginRight: spacing.sm,
  },
  searchButton: {
    height: verticalScale(40),
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  searchButtonText: {
    fontSize: responsiveFontSize(12),
    fontWeight: "600",
  },
  searchResultsContainer: {
    marginTop: spacing.sm,
  },
  searchNavigationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  searchNavigationButton: {
    padding: spacing.xs,
  },
  searchResultsText: {
    fontSize: responsiveFontSize(12),
    marginHorizontal: spacing.sm,
  },
});

export { styles };
