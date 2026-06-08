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

// Book page horizontal margin — comfortable reading margins
const PAGE_MARGIN_H = 10;
// Inner gutter (left margin for paragraph numbers)
const PAGE_GUTTER = 20;

const styles = StyleSheet.create({
  // ─── Root container ───────────────────────────────────────────────────────
  container: {
    flex: 1,
    paddingTop: STATUSBAR_HEIGHT,
  },

  // ─── Book page wrapper ────────────────────────────────────────────────────
  // Wraps the FlatList to give it a "page" feel with side shadows
  bookPageWrapper: {
    flex: 1,
    marginHorizontal: 0,
  },

  sermonLoaderScreen: {
    flex: 1,
  },

  // ─── FlatList content container ───────────────────────────────────────────
  scrollViewContainer: {
    paddingHorizontal: PAGE_MARGIN_H + 6,
    paddingTop: 0,
    paddingBottom: 120, // clearance for bottom toolbar
  },

  // ─── Book page side shadow strips ─────────────────────────────────────────
  // Thin vertical strips on left/right to simulate page depth
  pageShadowLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 6,
    zIndex: 2,
  },
  pageShadowRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: 6,
    zIndex: 2,
  },

  // ─── Chapter / Sermon header ──────────────────────────────────────────────
  chapterHeader: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 10,
    paddingHorizontal: 4,
  },
  chapterOrnamentTop: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  chapterOrnamentLine: {
    flex: 1,
    height: 1,
  },
  chapterOrnamentDiamond: {
    width: 8,
    height: 8,
    transform: [{ rotate: "45deg" }],
    marginHorizontal: 10,
  },
  chapterTitle: {
    textAlign: "center",
    letterSpacing: 0.8,
    marginBottom: 6,
    lineHeight: undefined, // set dynamically
  },
  chapterMeta: {
    textAlign: "center",
    // fontStyle: "italic",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  chapterMetaLocation: {
    textAlign: "center",
    // fontStyle: "italic",
    letterSpacing: 0.3,
    marginBottom: 0,
  },
  // kept for legacy compat (no longer rendered in ListHeader)
  chapterOrnamentBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
  },
  chapterOrnamentDot: {
    borderRadius: 50,
  },
  chapterDividerThick: {
    height: 3,
    width: "60%",
    borderRadius: 2,
    marginBottom: 6,
  },
  chapterDividerThin: {
    height: 1,
    width: "80%",
    borderRadius: 1,
    marginBottom: 8,
  },

  // ─── Paragraph container ──────────────────────────────────────────────────
  paragraphContainer: {
    marginBottom: 4,
    paddingHorizontal: 4,
    paddingVertical: 6,
    alignSelf: "stretch",
    overflow: "hidden",
  },

  // ─── Paragraph number (legacy, kept for compat) ───────────────────────────
  paragraphNumberContainer: {
    width: PAGE_GUTTER,
    alignItems: "flex-end",
    paddingRight: 6,
    paddingTop: 3,
  },
  paragraphNumber: {
    fontSize: responsiveFontSize(10),
    // fontStyle: "italic",
    opacity: 0.4,
    lineHeight: responsiveFontSize(16),
  },
  paragraphNumberButton: {
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 20,
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // ─── Paragraph text ───────────────────────────────────────────────────────
  paragraphText: {
    marginBottom: 0,
    paddingVertical: 0,
    // textAlign "justify" causes overflow with nested <Text> children in RN
    textAlign: "left",
  },
  paragraphHeader: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  selectableTextContainer: {
    maxWidth: "100%",
    overflow: "hidden",
    alignSelf: "stretch",
  },

  // ─── Selected paragraph highlight ────────────────────────────────────────
  // Applied via containerStyle in ParagraphText component

  // ─── Sermon text (legacy, kept for compat) ────────────────────────────────
  sermonText: {
    lineHeight: responsiveFontSize(20),
    marginBottom: 1,
    textAlign: "justify",
    paddingVertical: 0,
  },
  highlightedText: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    color: "#3B82F6",
  },
  endnoteText: {
    textDecorationLine: "underline",
    fontWeight: "500",
    fontFamily: "",
  },
  titleText: {
    fontFamily: "ZillaSlab",
    fontSize: responsiveFontSize(20),
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  locationText: {
    fontFamily: "ZillaSlab",
    fontWeight: "500",
    fontSize: responsiveFontSize(14),
    fontStyle: "italic",
    marginBottom: spacing.lg,
    textAlign: "center",
  },

  // ─── Floating action button (bottom-right) ────────────────────────────────
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 120,
    borderRadius: 16,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },

  // ─── Bottom pill toolbar ──────────────────────────────────────────────────
  bottomToolbar: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    height: 58,
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 200,
    // borderWidth: 1,
  },
  toolbarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarDivider: {
    width: 1,
    height: 22,
    opacity: 0.25,
  },

  // ─── Expanded action toolbar (above pill) ────────────────────────────────
  actionToolbarExpanded: {
    position: "absolute",
    bottom: 92,
    left: 24,
    right: 24,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 7,
    zIndex: 199,
    borderWidth: 1,
  },
  actionToolbarTitle: {
    fontSize: responsiveFontSize(11),
    fontFamily: "ZillaSlab",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 14,
    opacity: 0.6,
  },
  actionToolbarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionToolbarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
  },
  actionToolbarItemLabel: {
    fontSize: responsiveFontSize(10),
    fontFamily: "ZillaSlab",
    letterSpacing: 0.3,
    textAlign: "center",
  },

  // ─── Bottom sheet (legacy) ────────────────────────────────────────────────
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 50,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.85,
    zIndex: 60,
  },
  dragHandleContainer: {
    width: "100%",
    paddingVertical: 12,
    alignItems: "center",
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
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

  // ─── Top card (legacy) ────────────────────────────────────────────────────
  topCard: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: -50,
    width: "100%",
    height: "110%",
    borderRadius: 0,
    backgroundColor: "white",
    borderWidth: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    zIndex: 95,
  },
  topCardContainer: {
    flex: 1,
    paddingTop: STATUSBAR_HEIGHT + 50,
    paddingHorizontal: 4,
    paddingBottom: 0,
    marginBottom: 0,
  },
  topCardScrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 50,
    flexGrow: 1,
    minHeight: "100%",
  },
  topCardCloseButton: {
    position: "absolute",
    top: STATUSBAR_HEIGHT + 10,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderWidth: 1,
    borderStyle: "dotted",
  },

  // ─── Receipt styles (legacy, kept for compat) ─────────────────────────────
  receiptHeader: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  receiptTitle: {
    fontSize: responsiveFontSize(14),
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
  receiptSection: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  receiptSectionHeader: {
    fontSize: responsiveFontSize(14),
    fontFamily: "ZillaSlabsm",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  receiptItem: {
    marginBottom: 4,
    paddingHorizontal: 2,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-start",
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

  // ─── Selection / copy styles ──────────────────────────────────────────────
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
  copyingParagraph: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  textSelectable: {
    backgroundColor: "rgba(0, 123, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 123, 255, 0.2)",
    borderRadius: 4,
  },
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

  // ─── Bookmark / highlight buttons (legacy) ────────────────────────────────
  bookmarkButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs / 2,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  bookmarkButtonActive: {
    backgroundColor: "rgba(230, 195, 184, 0.2)",
  },
  highlightButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs / 2,
    borderRadius: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  highlightButtonActive: {
    backgroundColor: "rgba(230, 195, 184, 0.1)",
  },
  paletteOverlay: {
    position: "absolute",
    top: -120,
    left: -200,
    width: 300,
    height: 200,
    zIndex: 999,
  },

  // ─── Search styles ────────────────────────────────────────────────────────
  searchLoader: {
    position: "absolute",
    right: spacing.sm,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
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
    top: "52%",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    zIndex: 1000,
  },

  // ─── Search feedback toast ────────────────────────────────────────────────
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

  // ─── Controls (legacy) ────────────────────────────────────────────────────
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

  // ─── Top bar (legacy) ─────────────────────────────────────────────────────
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

  // ─── Modern bottom sheet styles (legacy) ──────────────────────────────────
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
  quickActionsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  quickActionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  quickActionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  quickActionLabel: {
    flex: 1,
    fontSize: responsiveFontSize(15),
    fontWeight: "500",
    fontFamily: "ZillaSlab",
  },
  modernActionCard: {
    width: "47%",
    aspectRatio: 1.3,
    borderRadius: 16,
    padding: spacing.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
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
