import { StyleSheet, Platform, StatusBar, Dimensions } from "react-native";

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
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 100,
  },
  sermonText: {
    lineHeight: 28,
    marginBottom: 18,
    textAlign: "left",
    // fontSize: 16,
  },
  highlightedText: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    color: "#3B82F6",
    fontWeight: "bold",
  },
  endnoteText: {
    textDecorationLine: "underline",
    color: "#4a90e2",
    fontWeight: "500",
    fontStyle: "italic",
    fontFamily: "",
  },
  titleText: {
    fontFamily: "serif",
    fontWeight: "900",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 8,
    textDecorationLine: "underline",
    
  },
  locationText: {
    fontFamily: "serif",
    fontWeight: "500",
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 24,
    textAlign: "center",
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    top: "50%",
    backgroundColor: "#2d2d2d",
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  
  // Paragraph styles
  paragraphContainer: {
    flexDirection: "row",
    marginBottom: 18,
  },
  paragraphNumber: {
    // minWidth: 30,
    fontWeight: "bold",
    fontSize: 15,
    marginRight: 8,
    textAlign: "right",
    paddingTop: 3,
  },
  paragraphText: {
    flex: 1,
    lineHeight: 32,
    // fontSize: 16,
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
    gap:2,
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
});

export { styles };