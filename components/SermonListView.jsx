import React, { useRef, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { FontAwesome5 } from "@expo/vector-icons";
import { styles } from "../styles/Allsermons";
import { useAppContext } from "../Logic/globalState";
import { Pressable } from "react-native-gesture-handler";
import { useFonts } from "expo-font";

const SermonListView = React.memo(
  ({ theme, filteredSermons, handleSermonClick }) => {
    // const { numberOfColumns } = useAppContext();
    const scaleValue = useRef(new Animated.Value(1)).current;

    const [fontsLoaded] = useFonts({
      ZillaSlab_smb: require("../assets/fonts/ZillaSlab-SemiBold.ttf"),
    });

    useEffect(() => {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.3,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();

      // Cleanup animation when the component unmounts
      return () => pulseAnimation.stop();
    }, [scaleValue]);

    const LocationNotFound = React.memo(() => (
      <Text
        style={{
          fontSize: 9,
          color: theme.colors.text + "80",
          fontFamily: "ZillaSlab_smb",
        }}
      >
        Location not found
      </Text>
    ));

    const renderSermonItem = useCallback(
      ({ item, index }) => (
        <Pressable
          key={item.id}
          style={[
            styles.sermonItem,
            {
              width: "49%",
              borderWidth: 1,
              borderColor: theme.colors.primary,
              // elevation: 1,
              backgroundColor:theme.dark? "transparent" : "#f7f6f6",
            },
          ]}
          android_ripple={{
            color: theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          }}
          onPress={() => handleSermonClick(item)}
        >
          <View
            style={[
              {
                flexDirection: "row",
                justifyContent: "flex-start",
                // padding: 5,
                borderRadius: 10,
              },
            ]}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={[
                  styles.sermonTitle,
                  {
                    color: theme.colors.text,
                    // fontWeight: "bold",
                    textDecorationLine: "underline",
                    fontFamily: "ZillaSlab_smb",
                  },
                ]}
              >
                {item.title + "  "}
                {item.type === "mp3" ? (
                  <Text
                    style={[
                      styles.animatedMicrophone,
                      { paddingHorizontal: 2 },
                    ]}
                  >
                    <FontAwesome5
                      name="microphone"
                      color={theme.colors.hlight+"60"}
                    />
                  </Text>
                ) : (
                  <Ionicons
                    name="text"
                    color={theme.colors.hlight+"60"}
                  />
                )}
              </Text>
            </View>
            {/* <Animated.View style={{ transform: [{ scale: scaleValue }] }}> */}

            {/* </Animated.View> */}
          </View>

          <Text
            style={[
              {
                color: theme.colors.text+"50",
                fontSize: 12,
                fontStyle: "italic",
                fontFamily: "serif",
              },
            ]}
          >
            {item.date}
          </Text>

          <Text
            style={{
              fontSize: 9,
              color: theme.colors.text+"80",
              paddingBottom: 4,
              fontFamily: "Palatino",
            }}
          >
            {item.location ? item.location : <LocationNotFound />}
          </Text>
        </Pressable>
      ),
      [theme, handleSermonClick]
    );

    return (
      <FlatList
        data={filteredSermons}
        renderItem={renderSermonItem}
        initialNumToRender={10}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        // ItemSeparatorComponent={" "}

        //   ListHeaderComponent={listHeaderComponent}
      />
    );
  }
);

export default SermonListView;
