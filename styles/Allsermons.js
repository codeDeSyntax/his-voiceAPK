import { StyleSheet } from "react-native";
import { responsiveFontSize, horizontalScale, verticalScale, spacing } from '../Utils/responsiveUtils';

export const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  sermonItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderRadius: horizontalScale(10),
    shadowColor: "#000",
    borderColor: "silver",
  },
  sermonTitle: {
    fontSize: responsiveFontSize(14),
    // fontWeight: "900",
    fontFamily: "serif",
    marginBottom: spacing.xs,
    color: "#bfc7ca",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  animatedMicrophone: {},
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: horizontalScale(10),
    padding: spacing.lg,
  },
  gridContainer: {
    paddingVertical: spacing.xs,
  },
  gridItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: verticalScale(50),
    width: horizontalScale(40),
    margin: spacing.xs,
    borderRadius: horizontalScale(8),
    backgroundColor: "#f0f0f0",
  },
  selectedGridItem: {
    backgroundColor: "#427092",
  },
  gridItemText: {
    fontSize: responsiveFontSize(12),
    color: "#333",
  },
  selectedGridItemText: {
    color: "#fff",
  },
  allYearsOption: {
    backgroundColor: "#0a84ff",
    width: "100%",
    padding: spacing.sm,
    borderRadius: horizontalScale(8),
  },
  allLettersOption: {
    backgroundColor: "#0a84ff",
    padding: spacing.sm,
    borderRadius: horizontalScale(8),
    width: "100%",
  },
  gridBtnText: {
    fontSize: responsiveFontSize(16),
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  // search
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: responsiveFontSize(18),
    fontWeight: "bold",
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  // Add these to your Allsermons styles
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(50),
    borderRadius: horizontalScale(8),
    paddingHorizontal: spacing.sm,
    position: 'relative',
  },
  placeholderContainer: {
    position: 'absolute',
    paddingHorizontal: spacing.xs,
    zIndex: 1,
  },
  placeholderText: {
    fontStyle: 'italic',
    fontSize: responsiveFontSize(14),
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: responsiveFontSize(14),
  },
  searchButton: {
    padding: spacing.sm,
    borderRadius: horizontalScale(5),
  },
  scrollIndicatorContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  scrollIndicator: {
    width: horizontalScale(40),
    height: verticalScale(5),
    borderRadius: horizontalScale(5),
    backgroundColor: "#ccc",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
