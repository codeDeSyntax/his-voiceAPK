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
    fontFamily: "ZillaSlab", // Use ZillaSlab instead of serif
    fontWeight: "900",
    fontSize: responsiveFontSize(20),
    textAlign: "center",
    marginBottom: spacing.sm, // 8px consistent spacing
    textDecorationLine: "underline",
  },
  locationText: {
    fontFamily: "ZillaSlab", // Use ZillaSlab instead of serif
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

  topCard: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: -50, // Extend beyond bottom to ensure full coverage
    width: "100%",
    height: "110%", // Slightly larger than 100% to ensure complete coverage
    borderRadius: 0, // Remove border radius for full screen
    backgroundColor: "white",
    // Receipt-style border pattern removed for full screen
    borderWidth: 0,
    shadowColor: "transparent", // Remove shadow for full screen
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0, // Remove elevation for full screen
    zIndex: 95,
  },
  topCardContainer: {
    flex: 1,
    paddingTop: STATUSBAR_HEIGHT + 50, // Add top padding for status bar and header space
    paddingHorizontal: 4,
    paddingBottom: 0, // Remove any bottom padding to ensure full screen
    marginBottom: 0, // Ensure no bottom margin
  },
  topCardScrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 50, // Add bottom padding only for content visibility, not layout spacing
    flexGrow: 1, // Ensure content grows to fill available space
    minHeight: "100%", // Ensure minimum height covers full container
  },
  topCardCloseButton: {
    position: "absolute",
    top: STATUSBAR_HEIGHT + 10, // Position below status bar
    right: 16, // Move away from edge
    width: 36, // Make it slightly larger for better touch target
    height: 36,
    borderRadius: 18,
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
    fontFamily: "ZillaSlab",
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
  // Container: spacing.xs (4px) between paragraphs for tight reading flow
  // Text: lineHeight 24px for optimal readability
  // Numbers: spacing.xs (4px) margin from text
  paragraphContainer: {
    flexDirection: "row",
    marginBottom: spacing.xs, // Consistent 4px spacing between paragraphs
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
    // lineHeight removed - will be set dynamically based on user settings
    paddingLeft: 8,
    marginBottom: spacing.xs, // Consistent 4px spacing between paragraphs
    paddingVertical: 0, // Remove vertical padding for consistent gaps
  },
  paragraphContainer: {
    marginBottom: spacing.xs, // Consistent 4px gap between paragraph containers
    paddingHorizontal: 0,
    paddingVertical: 0, // Remove container padding for consistent spacing
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
    fontFamily: "ZillaSlab",
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
    fontFamily: "ZillaSlab",
  },
  sermonInfoText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: "ZillaSlab",
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
    fontFamily: "ZillaSlab",
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
    fontFamily: "ZillaSlab",
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
    marginLeft: spacing.xs / 2,
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkButtonActive: {
    // Remove scale transform to prevent layout shifts
  },
  highlightButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs / 2,
    borderRadius: 12,
    minWidth: 32,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  highlightButtonActive: {
    backgroundColor: "rgba(230, 195, 184, 0.1)",
    // Remove scale transform to prevent layout shifts
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
    borderRadius: 8,
    marginHorizontal: spacing.xs / 2,
  },
  searchResultsText: {
    fontSize: responsiveFontSize(12),
    marginHorizontal: spacing.sm,
    fontWeight: "600",
  },
  clearSearchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  clearSearchText: {
    fontSize: responsiveFontSize(12),
    marginLeft: spacing.xs / 2,
    fontWeight: "500",
  },
  noResultsContainer: {
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: responsiveFontSize(12),
    fontStyle: "italic",
    textAlign: "center",
  },
  searchIconContainer: {
    position: "absolute",
    right: 20,
    top: "52%", // Position above the bottom sheet toggler (which is at 60%)
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    zIndex: 1000,
  },

  // Modern Bottom Sheet Styles
  modernHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(213, 122, 62, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(213, 122, 62, 0.3)",
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  modernTitle: {
    fontSize: responsiveFontSize(18),
    fontWeight: "600",
    marginBottom: 2,
  },
  modernSubtitle: {
    fontSize: responsiveFontSize(12),
    fontWeight: "400",
  },
  timestampBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    backgroundColor: "rgba(213, 122, 62, 0.1)",
    borderRadius: 12,
  },
  modernSectionHeader: {
    fontSize: responsiveFontSize(14),
    fontWeight: "600",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    textAlign: "left",
  },
  modernInfoCard: {
    backgroundColor: "rgba(213, 122, 62, 0.05)",
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(213, 122, 62, 0.2)",
  },
  sermonTitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  modernSermonTitle: {
    fontSize: responsiveFontSize(16),
    fontWeight: "500",
    flex: 1,
    marginLeft: spacing.sm,
    lineHeight: responsiveFontSize(20),
  },
  modernInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  infoIconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: spacing.sm,
  },
  modernInfoText: {
    fontSize: responsiveFontSize(14),
    fontFamily: "ZillaSlab",
  },
  modernActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  modernActionCard: {
    width: "47%",
    aspectRatio: 1.3,
    borderRadius: 16,
    padding: spacing.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(213, 122, 62, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  modernActionLabel: {
    fontSize: responsiveFontSize(12),
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "ZillaSlab",
  },
  modernFooter: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
  },
  footerDivider: {
    marginVertical: spacing.sm,
  },
  modernFooterDots: {
    fontSize: responsiveFontSize(12),
    textAlign: "center",
    letterSpacing: 2,
  },
  modernFooterText: {
    fontSize: responsiveFontSize(14),
    fontWeight: "500",
    textAlign: "center",
    marginVertical: spacing.xs,
  },
  modernFooterSubtext: {
    fontSize: responsiveFontSize(12),
    textAlign: "center",
    fontStyle: "italic",
  },
});

export { styles };
