import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { useAppContext } from "../../Logic/globalState";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  responsiveFontSize,
  horizontalScale,
  verticalScale,
  spacing,
} from "../../Utils/responsiveUtils";
import { styles } from "../../styles/Allsermons";
import DraggableFloatingButton from "../../components/FloatButton";

const TableHeader = React.memo(({ theme }) => (
  <View
    style={[
      styles.tableHeader,
      {
        backgroundColor: theme.dark ? "transparent" : "rgba(93, 50, 17, 0.04)",
        borderColor: theme.dark
          ? "rgba(242, 205, 180, 0.15)"
          : "rgba(93, 50, 17, 0.15)",
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
  const { theme, bookmarks, removeBookmark, setSelectedSermon } =
    useAppContext();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [selectedBookmark, setSelectedBookmark] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  console.log("BookmarksScreen render - isModalVisible:", isModalVisible);
  console.log(
    "BookmarksScreen render - selectedBookmark:",
    selectedBookmark?.sermon?.title,
  );

  const handleBookmarkPress = (bookmark) => {
    console.log("Bookmark pressed:", bookmark.sermon.title);
    setSelectedBookmark(bookmark);
    setIsModalVisible(true);
    console.log("Modal should now be visible");
  };

  const handleNavigateToSermon = () => {
    if (selectedBookmark) {
      setIsModalVisible(false);
      setSelectedSermon(selectedBookmark.sermon);
      navigation.navigate("currentsermon", {
        source: "bookmark",
        scrollToParagraph: selectedBookmark.paragraphIndex,
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBookmark(null);
  };

  const handleDeleteBookmark = (bookmark) => {
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
          onPress: () =>
            removeBookmark(bookmark.sermon, bookmark.paragraphIndex),
          style: "destructive",
        },
      ],
    );
  };

  const renderBookmarkItem = ({ item }) => (
    <View
      style={[
        styles.tableRow,
        {
          backgroundColor: theme.dark
            ? theme.colors.primary
            : "rgba(93, 50, 17, 0.04)",
          borderColor: theme.dark
            ? "rgba(242, 205, 180, 0.1)"
            : "rgba(93, 50, 17, 0.1)",
          borderWidth: 1,
          borderRadius: 10,
          flexDirection: "row",
          alignItems: "center",
        },
      ]}
    >
      <TouchableOpacity
        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
        onPress={() => {
          console.log("TouchableOpacity pressed!");
          handleBookmarkPress(item);
        }}
        activeOpacity={0.7}
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
      </TouchableOpacity>

      <View
        style={[
          styles.tableCell,
          { width: responsiveFontSize(30), alignItems: "center" },
        ]}
      >
        <TouchableOpacity
          onPress={() => handleDeleteBookmark(item)}
          style={styles.deleteButton}
        >
          <Ionicons
            name="trash-outline"
            size={responsiveFontSize(24)}
            color={theme.dark ? theme.colors.hlight : "#5d3211"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <DraggableFloatingButton />
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
              color={
                theme.dark
                  ? "rgba(242, 205, 180, 0.3)"
                  : "rgba(93, 50, 17, 0.3)"
              }
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

      {/* Bookmark Details Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        {console.log("Modal is rendering with visible:", isModalVisible)}
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "80%",
              paddingBottom: insets.bottom,
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 30,
                borderBottomWidth: 1,
                borderBottomColor: theme.dark
                  ? "rgba(242, 205, 180, 0.15)"
                  : "rgba(93, 50, 17, 0.15)",
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(22),
                  fontFamily: "ZillaSlabSemiBold",
                  color: theme.colors.text,
                }}
              >
                Bookmark Details
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons
                  name="close"
                  size={responsiveFontSize(24)}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            {selectedBookmark && (
              <ScrollView
                style={{ padding: spacing.lg }}
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                {/* Sermon Title */}
                <View style={{ marginBottom: spacing.md }}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(14),
                      color: theme.dark ? theme.colors.text + "80" : "#5d3211",
                      marginBottom: spacing.xs,
                      fontFamily: "ZillaSlab-Regular",
                    }}
                  >
                    SERMON
                  </Text>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(18),
                      fontFamily: "ZillaSlabSemiBold",
                      color: theme.colors.text,
                    }}
                  >
                    {selectedBookmark.sermon.title}
                  </Text>
                </View>

                {/* Sermon Date */}
                <View style={{ marginBottom: spacing.md }}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(14),
                      color: theme.dark ? theme.colors.text + "80" : "#5d3211",
                      marginBottom: spacing.xs,
                      fontFamily: "ZillaSlab-Regular",
                    }}
                  >
                    SERMON DATE
                  </Text>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(16),
                      fontFamily: "ZillaSlab-Regular",
                      color: theme.colors.text,
                    }}
                  >
                    {selectedBookmark.sermon.date}
                  </Text>
                </View>

                {/* Paragraph Number */}
                <View style={{ marginBottom: spacing.md }}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(14),
                      color: theme.dark ? theme.colors.text + "80" : "#5d3211",
                      marginBottom: spacing.xs,
                      fontFamily: "ZillaSlab-Regular",
                    }}
                  >
                    PARAGRAPH NUMBER
                  </Text>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(16),
                      fontFamily: "ZillaSlab-Regular",
                      color: theme.colors.text,
                    }}
                  >
                    Paragraph {selectedBookmark.paragraphIndex + 1}
                  </Text>
                </View>

                {/* Paragraph Text */}
                <View style={{ marginBottom: spacing.md }}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(14),
                      color: theme.dark ? theme.colors.text + "80" : "#5d3211",
                      marginBottom: spacing.xs,
                      fontFamily: "ZillaSlab-Regular",
                    }}
                  >
                    PARAGRAPH TEXT
                  </Text>
                  <View
                    style={{
                      backgroundColor: theme.dark
                        ? "rgba(242, 205, 180, 0.05)"
                        : "rgba(93, 50, 17, 0.05)",
                      padding: spacing.md,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: theme.dark
                        ? "rgba(242, 205, 180, 0.1)"
                        : "rgba(93, 50, 17, 0.1)",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(16),
                        fontFamily: "ZillaSlab-Regular",
                        color: theme.colors.text,
                        lineHeight: responsiveFontSize(24),
                      }}
                    >
                      {selectedBookmark.paragraphText}
                    </Text>
                  </View>
                </View>

                {/* Bookmarked Date */}
                <View style={{ marginBottom: spacing.lg }}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(14),
                      color: theme.dark ? theme.colors.text + "80" : "#5d3211",
                      marginBottom: spacing.xs,
                      fontFamily: "ZillaSlab-Regular",
                    }}
                  >
                    BOOKMARKED ON
                  </Text>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(16),
                      fontFamily: "ZillaSlab-Regular",
                      color: theme.colors.text,
                    }}
                  >
                    {new Date(selectedBookmark.date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </Text>
                </View>

                {/* Action Buttons */}
                <View style={{ gap: spacing.sm }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: theme.dark
                        ? theme.colors.hlight
                        : "#5d3211",
                      padding: spacing.md,
                      borderRadius: 10,
                      alignItems: "center",
                    }}
                    onPress={handleNavigateToSermon}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(18),
                        fontFamily: "ZillaSlabSemiBold",
                        color: theme.dark ? "#1a1512" : "#fff",
                      }}
                    >
                      Go to Sermon
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: "transparent",
                      padding: spacing.md,
                      borderRadius: 10,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: theme.dark
                        ? "rgba(213, 122, 62, 0.5)"
                        : "rgba(93, 50, 17, 0.3)",
                    }}
                    onPress={() => {
                      handleCloseModal();
                      setTimeout(() => {
                        handleDeleteBookmark(selectedBookmark);
                      }, 300);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(18),
                        fontFamily: "ZillaSlabSemiBold",
                        color: theme.colors.hlight,
                      }}
                    >
                      Delete Bookmark
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BookmarksScreen;
