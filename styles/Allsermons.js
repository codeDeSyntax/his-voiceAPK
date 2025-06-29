import { StyleSheet } from "react-native";
import { responsiveFontSize, horizontalScale, verticalScale, spacing } from '../Utils/responsiveUtils';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: 0,
  },
  // Table styles
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  tableHeaderText: {
    fontSize: responsiveFontSize(14),
    fontFamily: 'ZillaSlab_smb',
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
  tableCell: {
    justifyContent: 'center',
  },
  tableCellTitle: {
    fontSize: responsiveFontSize(16),
    marginBottom: spacing.xs,
  },
  tableCellLocation: {
    fontSize: responsiveFontSize(12),
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  tableCellDate: {
    fontSize: responsiveFontSize(14),
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  // Modal styles
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
  // Grid styles
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
  // Options styles
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
  // Search styles
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
