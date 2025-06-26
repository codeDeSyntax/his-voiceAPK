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
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { styles } from "../styles/Allsermons";
import { useAppContext } from "../Logic/globalState";
import { Pressable } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { responsiveFontSize, horizontalScale, spacing } from '../Utils/responsiveUtils';

const SermonListView = React.memo(
  ({ theme, filteredSermons, handleSermonClick, setSearchText, allSermons, setFilteredSermons }) => {
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
          fontSize: responsiveFontSize(9),
          color: theme.dark ? theme.colors.text + "80" : "#5d3211",
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
              borderColor: theme.dark ? theme.colors.primary : "#bbb8b8",
              borderStyle: "dashed",
              // elevation: 1,
              backgroundColor: theme.dark ? "transparent" : "transparent",
            },
          ]}
          android_ripple={{
            color: theme.dark ? "#58320cef" : "rgba(0,0,0,0.05)",
          }}
          onPress={() => handleSermonClick(item)}
        >
          <View
            style={[
              {
                flexDirection: "row",
                justifyContent: "flex-start",
                // padding: 5,
                borderRadius: horizontalScale(10),
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
              </Text>
            </View>
            {/* <Animated.View style={{ transform: [{ scale: scaleValue }] }}> */}

            {/* </Animated.View> */}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center",gap: spacing.xs }}>
            <Text
              style={[
                {
                  color: theme.dark ? theme.colors.text + "50" : "#5d321190",
                  fontSize: responsiveFontSize(12),
                  fontStyle: "italic",
                  fontFamily: "serif",
                },
              ]}
            >
              {item.date}
            </Text>
            {item.type === "mp3" ? (
              <Text
                style={[styles.animatedMicrophone, { paddingHorizontal: spacing.xs }]}
              >
                <FontAwesome5
                  name="microphone"
                  size={responsiveFontSize(12)}
                  color={theme.dark ? theme.colors.hlight + "60" : "#5d3211"}
                />
              </Text>
            ) : (
              <Ionicons
                name="text"
                size={responsiveFontSize(12)}
                color={theme.dark ? theme.colors.hlight + "60" : "#5d3211"}
              />
            )}
          </View>

          <Text
            style={{
              fontSize: responsiveFontSize(9),
              color: theme.dark ? theme.colors.text + "80" : "#5d3211",
              paddingBottom: spacing.xs,
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
      <>
      <FlatList
        data={filteredSermons}
        renderItem={renderSermonItem}
        initialNumToRender={10}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        ListEmptyComponent={
          <View style={{ padding: spacing.lg, alignItems: "center" }}>
            <Text
              style={{
                color: theme.dark ? theme.colors.text + "80" : "#5d3211",
                fontSize: responsiveFontSize(14),
                fontFamily: "serif",
              }}
            >
              No sermons found
            </Text>
          </View>
        }
        // ItemSeparatorComponent={" "}

        //   ListHeaderComponent={listHeaderComponent}
      />
    {
      filteredSermons.length === 0 && (
        <Animated.View
        style={{
          position: "absolute",
          bottom: spacing.xl,
          right: spacing.xl,
          transform: [{ scale: scaleValue }],
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: theme.dark ? "#58320c" : "#f0f0f0",
            padding: 10,
            borderRadius: 50,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          onPress={() => {
            setSearchText("");
            setFilteredSermons(allSermons);
          }}
        >
          <MaterialIcons
            name="refresh"
            size={24}
            color={theme.dark ? theme.colors.text : "#5d3211"}
          />
        </TouchableOpacity>
      </Animated.View>
      )
    }
      </>

    );
  }
);

export default SermonListView;
