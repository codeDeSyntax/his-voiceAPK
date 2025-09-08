import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles/Allsermons";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { responsiveFontSize } from "../Utils/responsiveUtils";
import { useFonts } from "expo-font";

const ListAppBar = ({ theme, viewMode = "table", toggleViewMode }) => {
  const router = useNavigation();
  // load font
  const [fontsLoaded] = useFonts({
    Philosopher: require("../assets/fonts/Philosopher-Regular.ttf"),
  });

  // if (!fontsLoaded) {
  //   return null; // or a loading indicator
  // }
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: theme.dark
          ? "rgba(80, 61, 49, 0.25)"
          : "rgba(255, 255, 255, 0.1)",
        borderBottomWidth: 1,
        borderBottomColor: theme.dark
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(93, 50, 17, 0.1)",
        shadowColor: theme.dark ? "#000" : "#5d3211",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme.dark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            //  paddingVertical: 1,
            paddingHorizontal: 3,
            backgroundColor: theme.dark ? "rgba(46, 25, 12, 0.862)" : "#3a210f",
            borderRadius: 20,
            width: 150,
          }}
        >
          <Text
            style={[
              styles.label,
              {
                color: theme.dark ? theme.colors.text : "#f0f0f0",
                fontFamily: "serif",
                fontStyle: "italic",
                fontSize: responsiveFontSize(16),
                fontWeight: "bold",
                letterSpacing: 0.5,
              },
            ]}
          >
            R.L.L Sermons
          </Text>
        </View>
        {/* <Text
          style={{
            color: theme.dark 
              ? "rgba(255, 255, 255, 0.6)" 
              : "rgba(93, 50, 17, 0.6)",
            fontSize: 12,
            fontFamily: "serif",
            marginTop: 2,
          }}
        >
          Collection Library
        </Text> */}
      </View>

      <View style={{ flexDirection: "row", gap: 4 }}>
        {/* View Mode Toggle Button */}
        <TouchableOpacity
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: theme.dark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(93, 50, 17, 0.1)",
          }}
          onPress={toggleViewMode}
        >
          {viewMode === "table" ? (
            <MaterialIcons
              name="table-rows"
              size={20}
              color={theme.dark ? theme.colors.text : "#301d0e"}
            />
          ) : (
            <MaterialIcons
              name="view-list"
              size={20}
              color={theme.dark ? theme.colors.text : "#301d0e"}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: theme.dark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(93, 50, 17, 0.1)",
          }}
        >
          <Ionicons
            name="library"
            size={20}
            color={theme.dark ? theme.colors.text : "#301d0e"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: theme.dark
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(93, 50, 17, 0.1)",
          }}
          onPress={() => router?.navigate("Settings")}
        >
          <Ionicons
            name="settings"
            size={20}
            color={theme.dark ? theme.colors.text : "#301d0e"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ListAppBar;
