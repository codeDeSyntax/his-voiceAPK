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
    fontSize: 14,
    // fontWeight: "900",
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
   height:50,
   width:40,
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
  // Add these to your Allsermons styles
searchInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  height: 50,
  borderRadius: 8,
  paddingHorizontal: 10,
  position: 'relative',
},
placeholderContainer: {
  position: 'absolute',
  paddingHorizontal: 5,
  zIndex: 1,
},
placeholderText: {
  fontStyle: 'italic',
},
searchInput: {
  flex: 1,
  height: '100%',
},
searchButton: {
  padding: 10,
  borderRadius: 5,
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
