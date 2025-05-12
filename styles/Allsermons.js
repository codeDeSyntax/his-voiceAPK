import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 10,
    gap: 2,
  },
  sermonItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    borderColor: "silver",
  },
  sermonTitle: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "serif",
    marginBottom: 4,
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
    borderRadius: 10,
    padding: 16,
  },
  gridContainer: {
    paddingVertical: 4,
  },
  gridItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
    margin: 4,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  selectedGridItem: {
    backgroundColor: "#427092",
  },
  gridItemText: {
    fontSize: 12,
    color: "#333",
  },
  selectedGridItemText: {
    color: "#fff",
  },
  allYearsOption: {
    backgroundColor: "#0a84ff",
    width: "100%",
    padding: 10,
    borderRadius: 8,
  },
  allLettersOption: {
    backgroundColor: "#0a84ff",
    padding: 10,
    borderRadius: 8,
    width: "100%",
  },
  gridBtnText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  // search
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 100,
    // elevation: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#fafafa",
    borderRadius: 100,
  },
  searchButton: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
  },
  scrollIndicatorContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 8,
  },
  scrollIndicator: {
    width: 40,
    height: 5,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
});
