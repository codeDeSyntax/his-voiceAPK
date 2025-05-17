import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { styles } from "../../styles/currentsermon";
import { useNavigation } from "@react-navigation/native";

const BottomSheetContent = ({
  theme,
  selectedSermon,
  searchPhrase,
  setSearchPhrase,
  searchResults,
  currentResultIndex,
  setCurrentResultIndex,
  onScrollToTop,
  onScrollToBottom,
  onNavigateToResult,
  onBack,
}) => {
  // Create a ref for the ScrollView to programmatically control it
  const scrollViewRef = useRef(null);
  const router = useNavigation();

  // Get window height to set a reasonable max height for the scroll view
  const windowHeight = Dimensions.get("window").height;
  const maxHeight = windowHeight * 0.6; // Limit to 70% of screen height

  // Function to scroll to top of the bottom sheet content
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={[styles.bottomSheetContent, { maxHeight: maxHeight }]}>
      {/* Scroll indicator at top of sheet for better UX */}
      <View style={styles.scrollIndicatorContainer}>
        <View style={styles.scrollIndicator} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        overScrollMode="always"
        keyboardShouldPersistTaps="handled" // Important for text input inside scrollview
      >
        {/* Sermon Information Section */}
        <View
          style={[
            styles.controlSection,
            { backgroundColor: theme.colors.secondary },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontFamily: "serif" },
            ]}
          >
            Sermon Information
          </Text>
          <View
            style={[
              styles.sermonInfoContainer,
              {
                backgroundColor: theme.colors.secondary,
                borderWidth: 1,
                borderColor: theme.colors.text,
                borderStyle: "dashed",
              },
            ]}
          >
            <Text
              style={[styles.sermonInfoTitle, { color: theme.colors.text }]}
            >
              {selectedSermon?.title}
            </Text>
            {selectedSermon?.date && (
              <Text
                style={[
                  styles.sermonInfoText,
                  { color: theme.colors.text, fontStyle: "italic" },
                ]}
              >
                {selectedSermon?.date}
              </Text>
            )}
            {selectedSermon?.location && (
              <Text
                style={[styles.sermonInfoText, { color: theme.colors.text }]}
              >
                {selectedSermon?.location}
              </Text>
            )}
            {selectedSermon?.year && (
              <Text
                style={[styles.sermonInfoText, { color: theme.colors.text }]}
              >
                {selectedSermon?.year}
              </Text>
            )}
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.controlSection}>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontFamily: "serif" },
            ]}
          >
            Search Sermon
          </Text>
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={theme.colors.text} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search by text or paragraph number..."
              placeholderTextColor="#888"
              value={searchPhrase}
              onChangeText={setSearchPhrase}
            />
            {searchPhrase ? (
              <TouchableOpacity onPress={() => setSearchPhrase("")}>
                <Feather name="x" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            ) : null}
          </View>

          {searchPhrase && searchResults.length > 0 ? (
            <View style={styles.searchResults}>
              <Text style={styles.matchesText}>
                {`${searchResults.length} ${
                  searchResults.length === 1 ? "match" : "matches"
                } found`}
              </Text>
              <View style={styles.navigationButtons}>
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    currentResultIndex === 0 ? { opacity: 0.5 } : {},
                  ]}
                  onPress={() => {
                    const newIndex = Math.max(0, currentResultIndex - 1);
                    setCurrentResultIndex(newIndex);
                    onNavigateToResult(searchResults[newIndex]);
                    scrollToTop(); // Scroll the bottom sheet to top when navigating
                  }}
                  disabled={currentResultIndex === 0}
                >
                  <Text style={styles.navButtonText}>Previous</Text>
                </TouchableOpacity>
                <Text style={styles.matchesText}>
                  {`${currentResultIndex + 1} / ${searchResults.length}`}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    currentResultIndex === searchResults.length - 1
                      ? { opacity: 0.5 }
                      : {},
                  ]}
                  onPress={() => {
                    const newIndex = Math.min(
                      searchResults.length - 1,
                      currentResultIndex + 1
                    );
                    setCurrentResultIndex(newIndex);
                    onNavigateToResult(searchResults[newIndex]);
                    scrollToTop(); // Scroll the bottom sheet to top when navigating
                  }}
                  disabled={currentResultIndex === searchResults.length - 1}
                >
                  <Text style={styles.navButtonText}>Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : searchPhrase && searchResults.length === 0 ? (
            <Text style={[styles.matchesText, { marginTop: 8 }]}>
              No matches found
            </Text>
          ) : null}
        </View>

        {/* Navigation Section */}
        <View
          style={[
            styles.controlSection,
            { marginBottom: Platform.OS === "ios" ? 30 : 20 },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, fontFamily: "serif" },
            ]}
          >
            Navigation
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { elevation: 3, backgroundColor: theme.colors.secondary },
              ]}
              onPress={() => {
                onScrollToTop();
                scrollToTop(); // Also scroll bottom sheet to top
              }}
              activeOpacity={0.7}
            >
              <Feather name="arrow-up" size={20} color={theme.colors.text} />
              {/* <Text
                style={[styles.controlButtonText, { color: theme.colors.text }]}
              >
                Top
              </Text> */}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                { elevation: 3, backgroundColor: theme.colors.secondary },
              ]}
              onPress={onScrollToBottom}
              activeOpacity={0.7}
            >
              <Feather name="arrow-down" size={20} color={theme.colors.text} />
              {/* <Text
                style={[styles.controlButtonText, { color: theme.colors.text }]}
              >
                Bottom
              </Text> */}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                { elevation: 3, backgroundColor: theme.colors.secondary },
              ]}
              onPress={onBack}
              activeOpacity={0.7}
            >
              <Feather name="list" size={20} color={theme.colors.text} />
              {/* <Text
                style={[styles.controlButtonText, { color: theme.colors.text }]}
              >
                All Sermons
              </Text> */}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { elevation: 3, backgroundColor: theme.colors.secondary },
              ]}
              //   onPress={router.push("screens/Settings")}
              onPress={() => router.push("Settings")}
              activeOpacity={0.7}
            >
              <Feather name="settings" size={20} color={theme.colors.text} />
              {/* <Text
                style={[styles.controlButtonText, { color: theme.colors.text }]}
              >
                All Sermons
              </Text> */}
            </TouchableOpacity>
          </View>
        </View>

        {/* Add padding at the bottom to ensure all content is accessible */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

// These styles should be added to your currentsermon.js styles file
const additionalStyles = {
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
};

// You can merge additionalStyles with your existing styles

export default BottomSheetContent;
