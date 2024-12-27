import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useFonts } from "expo-font";
import { SermonContext } from "../../Logic/globalState";
import Slider from "@react-native-community/slider";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SelectList } from "react-native-dropdown-select-list";
import { Switch } from "react-native-paper";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import UpdateScreen from "../Updating";

function Settings() {
  const [fontsLoaded] = useFonts({
    "Merienda-VariableFont": require("../../assets/fonts/Merienda-VariableFont_wght.ttf"),
    "Philosopher-Regular": require("../../assets/fonts/Philosopher-Regular.ttf"),
    "GrenzeGotisch-VariableFont": require("../../assets/fonts/GrenzeGotisch-VariableFont_wght.ttf"),
    "NerkoOne-Regular": require("../../assets/fonts/NerkoOne-Regular.ttf"),
    "Teko-VariableFont": require("../../assets/fonts/Teko-VariableFont_wght.ttf"),
  });

  const { settings, setSettings, theme, setIsDarkMode, isDarkMode } =
    useContext(SermonContext);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);
  const [textColor, setTextColor] = useState(settings.textColor);
  const [savingTheme, setSavingTheme] = useState(false);
  const navigation = useNavigation();
  const [isUpdating, setIsUpdating] =  useState(false)
  const [backgroundColor, setBackgroundColor] = useState(
    settings.backgroundColor
  );
  const [showPreview, setShowPreview] = useState(false);

  const textTheme = theme.colors.text;

  const toggleTheme = async () => {
    try {
      setSavingTheme(true);
      const newMode = !isDarkMode;

      const updatedSettings = {
        ...settings,
        darkMode: newMode,
        backgroundColor: theme.colors.primary,
        fontSize,
        fontFamily,
        textColor,
      };

      setIsDarkMode(newMode);
      setSettings(updatedSettings);
      await AsyncStorage.setItem(
        "sermonSettings",
        JSON.stringify(updatedSettings)
      );
      setSavingTheme(false);
    } catch (error) {
      console.error("Error saving theme settings:", error);
      setSavingTheme(false);
    }
  };

  const saveSettings = async () => {
    try {
      const updatedSettings = {
        ...settings,
        darkMode: isDarkMode,
        backgroundColor,
        fontSize,
        fontFamily,
        textColor,
      };
      setSettings(updatedSettings);
      await AsyncStorage.setItem(
        "sermonSettings",
        JSON.stringify(updatedSettings)
      );
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const restoreDefault = async () => {
    try {
      const defaultSettings = {
        darkMode: true,
        backgroundColor: "#151718",
        fontSize: 12,
        fontFamily: "serif",
        textColor: "#fafafa",
      };
      setSettings(defaultSettings);
      setBackgroundColor(defaultSettings.backgroundColor);
      setTextColor(defaultSettings.textColor);
      await AsyncStorage.setItem(
        "sermonSettings",
        JSON.stringify(defaultSettings)
      );
    } catch (error) {
      console.error("Error restoring settings:", error);
    }
  };

  // async function checkForUpdates() {
  //   if (__DEV__) {
  //     console.log("Skipping updates check in development mode");
  //     // setIsUpdating(true)
      
  //     return;
  //   }
  //   try {
  //    navigation.navigate("updating")
  //     const update = await Updates.checkForUpdateAsync();
  //     if (update.isAvailable) {
  //       await Updates.fetchUpdateAsync();
  //       Alert.alert('Update available', 'Restarting to apply the update...');
  //       await Updates.reloadAsync(); // Will reload the app with the new update
  //       navigation.navigate("welcome")
  //     }else {
  //       navigation.navigate("welcome")
  //     }
  //   } catch (e) {
  //     console.log('Error checking for updates', e);
  //   }
  // }

  return (
  <>
  {
    isUpdating ? <UpdateScreen/> : (
      <ScrollView
      style={[
        styles.container,
        { backgroundColor: theme.dark ? "#1A1A1A" : "#F8F9FA" },
      ]}
    >
      <Text
        style={[
          styles.headerTitle,
          { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
        ]}
      >
        Settings
      </Text>

      {/* Main Settings Group */}
      <View
        style={[
          styles.settingsGroup,
          { backgroundColor: theme.dark ? "#2A2A2A" : "#FFFFFF" },
        ]}
      >
        <TouchableOpacity style={styles.settingItem} disabled>
          <View style={styles.settingLeft}>
            <View
              style={[styles.iconContainer, { backgroundColor: theme.colors.background,opacity:20 }]}
            >
              <Icon name="language" size={20} color={theme.colors.text} />
            </View>
            <Text
              style={[
                styles.settingText,
                { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
              ]}
            >
              App Language
            </Text>
          </View>
          <Icon
            name="chevron-forward"
            size={20}
            color={theme.dark ? "#999" : "#666"}
          />
        </TouchableOpacity>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View
              style={[styles.iconContainer, { backgroundColor: theme.colors.background }]}
            >
              <Icon name="text" size={20} color={theme.colors.text} />
            </View>
            <Text
              style={[
                styles.settingText,
                { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
              ]}
            >
              Font Settings
            </Text>
          </View>
          <Switch
            value={showPreview}
            onValueChange={() => setShowPreview(!showPreview)}
            color="#60A5FA"
          />
        </TouchableOpacity>

        {showPreview && (
          <View style={styles.previewSection}>
            <SelectList
              data={[
                "System",
                "sans-serif",
                "serif",
                "Roboto",
                "monospace",
                "Philosopher-Regular",
                "Merienda-VariableFont",
                "GrenzeGotisch-VariableFont",
              ]}
              setSelected={(val) => setFontFamily(val)}
              save="value"
              value={settings.fontFamily}
              search={false}
              searchicon={<FontAwesome5 name="search" color={textTheme} />}
              arrowicon={<FontAwesome5 name="caret-down" color={textTheme} />}
              placeholder="Font family"
              boxStyles={[
                styles.selectBox,
                { backgroundColor: theme.dark ? "#3A3A3A" : "#F0F0F0" },
              ]}
              inputStyles={{ color: theme.dark ? "#FFFFFF" : "#1A1A1A" }}
              dropdownStyles={[
                styles.dropdown,
                { backgroundColor: theme.dark ? "#3A3A3A" : "#FFFFFF" },
              ]}
              dropdownTextStyles={{ color: theme.dark ? "#FFFFFF" : "#1A1A1A" }}
            />

            <View style={styles.sliderContainer}>
              <Text
                style={[
                  styles.sliderLabel,
                  { color: theme.dark ? "#FFFFFF" : "#1A1A1A",fontFamily:fontFamily },
                ]}
              >
                Font Size: {fontSize}px
              </Text>
              <Slider
                style={[styles.slider,{height:20}]}
                minimumValue={12}
                maximumValue={24}
                value={fontSize}
                onValueChange={setFontSize}
                minimumTrackTintColor="#60A5FA"
                step={1}
                maximumTrackTintColor={theme.dark ? "#666" : "#CCC"}
                thumbTintColor="#60A5FA"
              />
            </View>

            <View
              style={[
                styles.previewBox,
                { backgroundColor: theme.dark ? "#3A3A3A" : "#F0F0F0" },
              ]}
            >
              <Text
                style={[
                  styles.previewText,
                  {
                    fontFamily,
                    fontSize,
                    color: theme.dark ? "#FFFFFF" : "#1A1A1A",
                  },
                ]}
              >
                Preview Text
              </Text>
            </View>
          </View>
        )}

        <View style={styles.separator} />

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View
              style={[styles.iconContainer, { backgroundColor: theme.colors.background }]}
            >
              <Icon name="moon" size={20} color={theme.colors.text} />
            </View>
            <Text
              style={[
                styles.settingText,
                { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
              ]}
            >
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            color="#60A5FA"
          />
        </View>

        <View style={styles.separator} />

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigation?.navigate("About")}
        >
          <View style={styles.settingLeft}>
            <View
              style={[styles.iconContainer, { backgroundColor: theme.colors.background }]}
            >
              <Icon name="help-circle" size={20} color={theme.colors.text} />
            </View>
            <Text
              style={[
                styles.settingText,
                { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
              ]}
            >
              About
            </Text>
          </View>
          <Icon
            name="chevron-forward"
            size={20}
            color={theme.dark ? "#999" : "#666"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} disabled>
          <View style={styles.settingLeft}>
            <View
              style={[styles.iconContainer, { backgroundColor: theme.colors.background }]}
            >
              <Icon name="download" size={20} color={theme.colors.text} />
            </View>
            <Text
              style={[
                styles.settingText,
                { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
              ]}
            >
              Check for Updates
            </Text>
          </View>

          <Icon name="download" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: theme.colors.background }]}
        onPress={saveSettings}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>

      {/* Reset Button */}
      <TouchableOpacity style={[styles.resetButton]} onPress={restoreDefault}>
        <Text
          style={[
            styles.resetButtonText,
            { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
          ]}
        >
          Reset to Defaults
        </Text>
      </TouchableOpacity>

      {/* Saving Theme Modal */}
      <Modal transparent={true} visible={savingTheme} animationType="fade">
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContainer,
              { backgroundColor: theme.dark ? "#2A2A2A" : "#FFFFFF" },
            ]}
          >
            <Text
              style={[
                styles.modalText,
                { color: theme.dark ? "#FFFFFF" : "#1A1A1A" },
              ]}
            >
              Saving Theme...
            </Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
    )
  }
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop:40
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "serif",
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 20,
  },
  settingsGroup: {
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation:5
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
  },
  previewSection: {
    padding: 16,
  },
  selectBox: {
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 0,
    padding: 12,
  },
  dropdown: {
    borderRadius: 8,
    borderWidth: 0,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  slider: {
    height: 40,
  },
  previewBox: {
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  previewText: {
    textAlign: "center",
  },
  saveButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resetButton: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 14,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    padding: 24,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Settings;
