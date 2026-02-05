import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ActionToolbar from "./ActionToolbar";
import { styles } from "../../styles/currentsermon";

const CustomTopCardController = ({
  theme,
  onOpenSearch,
  scrollToTop,
  scrollToBottom,
}) => {
  // Local state for action toolbar
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);

  const handleTogglePress = () => {
    setIsToolbarVisible(!isToolbarVisible);
  };

  // Handle scroll actions from toolbar
  const handleScrollToTopFromToolbar = () => {
    scrollToTop();
    setIsToolbarVisible(false);
  };

  const handleScrollToBottomFromToolbar = () => {
    scrollToBottom();
    setIsToolbarVisible(false);
  };

  // Handle search action from toolbar
  const handleOpenSearchFromToolbar = () => {
    onOpenSearch();
    setIsToolbarVisible(false);
  };

  return (
    <>
      {/* Action Toolbar */}
      <ActionToolbar
        theme={theme}
        isVisible={isToolbarVisible}
        onClose={() => setIsToolbarVisible(false)}
        onOpenSearch={handleOpenSearchFromToolbar}
        onScrollToTop={handleScrollToTopFromToolbar}
        onScrollToBottom={handleScrollToBottomFromToolbar}
      />

      {/* Toggle button */}
      <TouchableOpacity
        style={[
          styles.floatingButton,
          {
            backgroundColor: isToolbarVisible
              ? theme.dark
                ? "#f2cdb4"
                : "#5d3211"
              : theme.dark
                ? "rgba(44, 36, 32, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
            borderColor: theme.dark
              ? "rgba(242, 205, 180, 0.2)"
              : "rgba(93, 50, 17, 0.15)",
            borderWidth: 1,
          },
        ]}
        onPress={handleTogglePress}
        activeOpacity={0.8}
      >
        <MaterialIcons
          name={isToolbarVisible ? "close" : "more-horiz"}
          size={22}
          color={
            isToolbarVisible
              ? theme.dark
                ? "#1a1512"
                : "#fff"
              : theme.dark
                ? "#e6c3b8"
                : "#5d3211"
          }
        />
      </TouchableOpacity>
    </>
  );
};

export default CustomTopCardController;
