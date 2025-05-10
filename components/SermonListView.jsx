import React, { useRef, useEffect, useMemo } from "react";
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

const SermonListView = ({
  theme,
  filteredSermons,
  handleSermonClick,
  listHeaderComponent,
}) => {
  const { numberOfColumns } = useAppContext();
  const scaleValue = useRef(new Animated.Value(1)).current;

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

  const LocationNotFound = () => (
    <Text
      style={{
        fontSize: 9,
        color: theme.colors.ltext,
        fontFamily: "monospace",
      }}
    >
      Location not found
    </Text>
  );

  const renderSermonItem = ({ item, index }) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.sermonItem,
        {
          width: numberOfColumns === 2 ?"50%" :"100%",
          borderWidth: 1,
          borderColor: theme.dark === true ? theme.colors.secondary : "#f4f6f3",
          elevation: 1,
          backgroundColor: theme.dark
            ? parseInt(index) % 2 === 0
              ? theme.colors.primary
              : theme.colors.primary
            : "#fafafa",
        },
      ]}
      onPress={() => handleSermonClick(item)}
    >
      <View
        style={[
          {
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 5,
            borderRadius: 10,
          },
        ]}
      >
        <Text style={[{ color: "#8e969c", fontSize: 12 }]}>{item.date}</Text>
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          {item.type === "mp3" ? (
            <Text style={styles.animatedMicrophone}>
              <FontAwesome5
                name="microphone"
                color={theme.dark === true ? theme.colors.text : "gray"}
              />
            </Text>
          ) : (
            <Ionicons
              name="text"
              color={theme.dark === true ? theme.colors.text : "gray"}
            />
          )}
        </Animated.View>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={[styles.sermonTitle, { color: theme.colors.text }]}>
          {item.title.slice(0, 20) + "   "}{" "}
          <FontAwesome5 name="caret-right" color={theme.colors.ltext} />
        </Text>
      </View>
      <Text
        style={{
          fontSize: 9,
          color: theme.colors.ltext,
          paddingBottom: 4,
          fontFamily: "monospace",
        }}
      >
        {item.location ? item.location : <LocationNotFound />}
      </Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={filteredSermons}
      renderItem={renderSermonItem}
      initialNumToRender={10}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      numColumns={numberOfColumns}
      // ItemSeparatorComponent={" "}

      //   ListHeaderComponent={listHeaderComponent}
    />
  );
};

export default SermonListView;
