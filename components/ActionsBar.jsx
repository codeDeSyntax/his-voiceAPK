import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Updated component with horizontal scrolling
const ActionsBar = ({
  theme,
  setIsLetterModalVisible,
  setIsYearModalVisible,
  filterOnlyText,
  filterOnlyAudio,
  toggleSortOrder,
}) => {
  const navigation = useNavigation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.actionsScrollContainer}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate("Menu")}
        style={[
          styles.actionButton,
          {
            backgroundColor: theme.dark === true ? "#22272a" : "white",
            shadowColor: theme.colors.text,
            borderColor: theme.dark ? "#747272" : "black",
          },
        ]}
      >
        {/* image */}
        <Image
          source={require("../assets/menu.png")}
          style={{ height: 200, width: 200 }}
          height={30}
          width={30}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Menu")}
        style={[
          styles.actionButton,
          {
            backgroundColor: theme.dark === true ? "#22272a" : "white",
            shadowColor: theme.colors.text,
            borderColor: theme.dark ? "#747272" : "black",
          },
        ]}
      >
        {/* icon */}
        <Ionicons name="search-outline" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsLetterModalVisible(true)}
        style={[
          styles.actionButton,
          {
            backgroundColor: theme.dark === true ? "#22272a" : "white",
            shadowColor: theme.colors.text,
            borderColor: theme.dark ? "white" : "#121212",
          },
        ]}
      >
        <Ionicons name="text-outline" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsYearModalVisible(true)}
        style={[
          styles.actionButton,
          {
            backgroundColor: theme.dark === true ? "#22272a" : "white",
            shadowColor: theme.colors.text,
            borderColor: theme.dark ? "white" : "#121212",
          },
        ]}
      >
        <FontAwesome5 name="calendar-alt" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionButton,
          {
            backgroundColor: theme.dark === true ? "#22272a" : "white",
            borderColor: theme.dark ? "#747272" : "black",
          },
        ]}
        onPress={filterOnlyText}
      >
        <View style={styles.actionButtonContent}>
          <Ionicons name="text" size={20} color={theme.colors.text} />
          <Ionicons name="filter" size={16} color={theme.colors.text} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionButton,
          {
            backgroundColor: theme.dark === true ? "#22272a" : "white",
            borderColor: theme.dark ? "#747272" : "black",
          },
        ]}
        onPress={filterOnlyAudio}
      >
        <View style={styles.actionButtonContent}>
          <Text style={{ fontSize: 20 }}>🔊</Text>
          <Ionicons name="filter" size={16} color={theme.colors.text} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionButton,
          {
            backgroundColor: theme.dark === true ? "#22272a" : "white",
            borderColor: theme.dark ? "#747272" : "black",
          },
        ]}
        onPress={toggleSortOrder}
      >
        <FontAwesome name="sort" size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </ScrollView>
  );
};

// Updated styles for the component
const styles = StyleSheet.create({
  actionsScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
    gap: 16,
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderStyle: "dotted",
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  // Original styles from your code that might be needed
  filtersContainer: {
    flexDirection: "row",
    gap: 10,
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: "white",
    height: 30,
    width: 30,
    borderRadius: 100,
    shadowColor: "#000",
    elevation: 5,
  },
  sortButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#202425",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});

// Example usage in your main component:
/*
<View>
  <ActionsBar
    theme={theme}
    setIsLetterModalVisible={setIsLetterModalVisible}
    setIsYearModalVisible={setIsYearModalVisible}
    filterOnlyText={filterOnlyText}
    filterOnlyAudio={filterOnlyAudio}
    toggleSortOrder={toggleSortOrder}
  />
</View>
*/

export default ActionsBar;
