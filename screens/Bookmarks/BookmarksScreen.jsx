import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useAppContext } from "../../Logic/globalState";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  responsiveFontSize,
  horizontalScale,
  verticalScale,
  spacing,
} from "../../Utils/responsiveUtils";
import { styles } from "../../styles/Allsermons";
import { LinearGradient } from "expo-linear-gradient";
import DraggableFloatingButton from "../../components/FloatButton";

const STATUSBAR_HEIGHT = Platform.OS === "ios" ? 44 : StatusBar.currentHeight;

const AnimatedBackground = React.memo(({ theme }) => (
  <View style={styles.backgroundContainer}>
    <ImageBackground
      source={
        theme.dark
          ? require("../../assets/gradbg.png")
          : require("../../assets/lib2.jpg")
      }
      style={styles.backgroundImage}
      blurRadius={2}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          theme.dark ? "rgba(28, 25, 23, 0.47)" : "rgba(250, 250, 250, 0.87)",
          theme.dark ? "rgba(28, 25, 23, 0.45)" : "rgba(250, 250, 250, 0.95)",
        ]}
        style={StyleSheet.absoluteFill}
      />
    </ImageBackground>
  </View>
));

const TableHeader = React.memo(({ theme }) => (
  <View
    style={[
      styles.tableHeader,
      {
        backgroundColor: theme.dark ? theme.colors.primary + "20" : "#f5f5f5",
        borderColor: theme.dark ? theme.colors.primary : "#bbb8b8",
      },
    ]}
  >
    <Text
      style={[
        styles.tableHeaderText,
        {
          color: theme.colors.text,
          flex: 1,
        },
      ]}
    >
      Title & Paragraph
    </Text>
    <Text
      style={[
        styles.tableHeaderText,
        {
          color: theme.colors.text,
          flex: 1,
          textAlign: "center",
        },
      ]}
    >
      Date
    </Text>
    <Text
      style={[
        styles.tableHeaderText,
        {
          color: theme.colors.text,
          textAlign: "center",
        },
      ]}
    >
      Actions
    </Text>
  </View>
));

const BookmarksScreen = () => {
  const {
    theme,
    bookmarks,
    removeBookmark,
    setSelectedSermon,
    updateLastVisitedScreen,
  } = useAppContext();
  const navigation = useNavigation();

  // Track that user visited BookmarksScreen
  React.useEffect(() => {
    updateLastVisitedScreen("BookmarksScreen");
  }, [updateLastVisitedScreen]);

  const handleBookmarkPress = (bookmark) => {
    setSelectedSermon(bookmark.sermon);
    navigation.navigate("currentsermon", {
      source: "bookmark", // Add source to identify bookmark navigation
      scrollToParagraph: bookmark.paragraphIndex,
    });
  };

  const handleDeleteBookmark = (bookmarkId) => {
    Alert.alert(
      "Delete Bookmark",
      "Are you sure you want to delete this bookmark?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => removeBookmark(bookmarkId),
          style: "destructive",
        },
      ]
    );
  };

  const renderBookmarkItem = ({ item }) => (
    <Pressable
      style={[
        styles.tableRow,
        {
          backgroundColor: theme.dark ? "transparent" : "transparent",
          borderColor: theme.dark ? theme.colors.primary : "#bbb8b8",
          borderWidth: 1,
          borderRadius: 10,
        },
      ]}
      android_ripple={{
        color: theme.dark ? "#58320cef" : "rgba(0,0,0,0.05)",
      }}
      onPress={() => handleBookmarkPress(item)}
    >
      <View style={[styles.tableCell, { flex: 2 }]}>
        <Text
          style={[
            styles.tableCellTitle,
            {
              color: theme.colors.text,
              fontFamily: "ZillaSlab-Regular",
            },
          ]}
          numberOfLines={2}
        >
          {item.sermon.title}
        </Text>
        <Text
          style={[
            styles.tableCellLocation,
            {
              color: theme.dark ? theme.colors.text + "80" : "#5d3211",
            },
          ]}
          numberOfLines={2}
        >
          Paragraph {item.paragraphIndex + 1}
        </Text>
      </View>

      <View style={[styles.tableCell, { flex: 1, alignItems: "center" }]}>
        <Text
          style={[
            styles.tableCellDate,
            {
              color: theme.dark ? theme.colors.text + "50" : "#5d321190",
            },
          ]}
        >
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>

      <View
        style={[
          styles.tableCell,
          { width: responsiveFontSize(30), alignItems: "center" },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleDeleteBookmark(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons
            name="trash-outline"
            size={responsiveFontSize(24)}
            color={theme.dark ? theme.colors.hlight : "#5d3211"}
          />
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: STATUSBAR_HEIGHT }]}>
      <DraggableFloatingButton />
      <AnimatedBackground theme={theme} />
      <View style={styles.contentContainer}>
        {bookmarks.length === 0 ? (
          <View
            style={[
              styles.emptyContainer,
              { justifyContent: "center", alignItems: "center", height: "80%" },
            ]}
          >
            <Ionicons
              name="bookmark-outline"
              size={responsiveFontSize(50)}
              color={theme.dark ? theme.colors.text + "50" : "#5d321150"}
            />
            <Text
              style={[
                styles.emptyText,
                {
                  color: theme.dark ? theme.colors.text + "80" : "#5d3211",
                },
              ]}
            >
              No bookmarks yet
            </Text>
          </View>
        ) : (
          <>
            <TableHeader theme={theme} />
            <FlatList
              data={bookmarks}
              renderItem={renderBookmarkItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default BookmarksScreen;
