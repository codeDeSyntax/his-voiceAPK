import React, { Suspense, useContext, useState } from "react";
import { useFonts } from "expo-font";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import ColorPicker from "react-native-wheel-color-picker";
import { SermonContext } from "../../Logic/globalState";
import Slider from "@react-native-community/slider";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppTheme } from "../../Logic/theme";
import LoadingScreen from "../../components/Loader";

function Settings({ navigation }) {
  const [fontsLoaded] = useFonts({
    "Merienda-VariableFont": require("../../assets/fonts/Merienda-VariableFont_wght.ttf"),
    "Philosopher-Regular": require("../../assets/fonts/Philosopher-Regular.ttf"),
    "GrenzeGotisch-VariableFont": require("../../assets/fonts/GrenzeGotisch-VariableFont_wght.ttf"),
    "NerkoOne-Regular": require("../../assets/fonts/NerkoOne-Regular.ttf"),
    "Teko-VariableFont": require("../../assets/fonts/Teko-VariableFont_wght.ttf"),
  });
  const { settings, setSettings } = useContext(SermonContext);
  const { theme, setIsDarkMode, isDarkMode } = useAppTheme();
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);
  const [textColor, setTextColor] = useState(settings.textColor);
  const [backgroundColor, setBackgroundColor] = useState(
    settings.backgroundColor
  );
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const fontFamilies = [
    "System",
    "cursive",
    "sans-serif",
    "serif",
    "Roboto",
    "monospace",
    "Philosopher-Regular",
    "Merienda-VariableFont",
    "GrenzeGotisch-VariableFont",
  ];

  const togglePreview = () => setShowPreview(!showPreview);
  const toggleWarningModal = () => setShowWarningModal(!showWarningModal);

  const newSettings = {
    themeMode: isDarkMode,
    backgroundColor: backgroundColor,
    fontSize: fontSize,
    fontFamily: fontFamily,
    textColor: textColor,
  };

  const defaultSettings = {
    themeMode: true,
    backgroundColor: theme.colors.primary,
    fontSize: 12,
    fontFamily: "serif",
    textColor: "#fafafa",
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
  };

  const saveSettings = async () => {
    const updatedSettings = { ...settings,...newSettings };
    setSettings(updatedSettings);
    try {
      await AsyncStorage.setItem(
        "sermonSettings",
        JSON.stringify(updatedSettings)
      );
      console.log("Settings saved:", settings);
    } catch (error) {
      console.log("Error saving settings:", error);
    }
  };

  const restoreDefault = async () => {
    setBackgroundColor(theme.colors.primary);
    setTextColor("#fafafa")
    const updatedSettings = {themeMode:true, backgroundColor:"#151718", fontSize: 12, fontFamily: "serif", textColor: "#fafafa" };
    setSettings(updatedSettings);
    // console.log("Settings restored to default:", updatedSettings);
    try {
      await AsyncStorage.setItem(
        "sermonSettings",
        JSON.stringify(updatedSettings)
      );
      console.log("Settings restored to default:", settings);
    } catch (error) {
      console.log("Error restoring settings:", error);
    }
  };

  return (
    
      <ScrollView
      style={[styles.container, { backgroundColor: theme.colors. primary }]}
    >
      <View style={styles.header}>
        <Text
          style={[styles.title, { fontSize: 20, color: theme.colors.text }]}
        >
          Settings
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={togglePreview} style={styles.iconButton}>
            <Icon
              name={showPreview ? "eye-off" : "eye"}
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={restoreDefault} style={styles.iconButton}>
            <Icon name="refresh" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
            <Icon
              name={theme.dark ? "sunny" : "moon"}
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleWarningModal}
            style={styles.iconButton}
          >
            <Icon name="warning-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("About")}
            style={styles.iconButton}
          >
            <Icon name="help-circle" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {showPreview && (
        <View
          style={[
            styles.previewBox,
            { backgroundColor: settings.backgroundColor },
          ]}
        >
          <Text
            style={[
              styles.previewText,
              { fontFamily, fontSize, color: settings.textColor },
            ]}
          >
            Preview Text
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: theme.colors.text, fontSize: 16 },
          ]}
        >
          Font Size
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={12}
          maximumValue={24}
          thumbTintColor={theme.colors.text}
          minimumTrackTintColor={theme.colors.text}
          maximumTrackTintColor={theme.colors.text}
          step={1}
          value={fontSize}
          onValueChange={setFontSize}
        />
        <Text style={[styles.value, { fontFamily, color: theme.colors.text }]}>
          {fontSize}px
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Font Family
        </Text>
        <View
          style={[
            styles.pickerContainer,
            {
              backgroundColor: theme.dark === true ? theme.colors.secondary : "white",
              borderWidth: theme.dark === false ? 1 : 0,
              borderColor: "silver",
            },
          ]}
        >
          <Picker
            selectedValue={fontFamily}
            onValueChange={(itemValue) => setFontFamily(itemValue)}
            style={[
              styles.picker,
              {
                color: theme.colors.text,
                fontFamily,
                backgroundColor: theme.dark === true ? theme.colors.secondary : "white",
              },
            ]}
            dropdownIconColor={theme.colors.text}
          >
            {fontFamilies.map((family) => (
              <Picker.Item key={family} label={family} value={family} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.colorSection}>
        <View style={styles.colorSelectorContainer}>
          <TouchableOpacity
            onPress={() => setShowTextColorPicker(!showTextColorPicker)}
            style={[
              styles.colorButton,
              { backgroundColor: theme.dark === true ? theme.colors.secondary : "white" },
            ]}
          >
            <Icon name="text" size={24} color={theme.colors.text} />
            <View
              style={[
                styles.colorPreview,
                { backgroundColor: settings.textColor },
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowTextColorPicker(!showTextColorPicker)}
            style={styles.themeColorButton}
          >
            {/* <Text>{textColor + "" + backgroundColor}</Text> */}
            <Icon name="color-palette" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        {showTextColorPicker && (
          <ColorPicker
            color={textColor}
            onColorChange={setTextColor}
            thumbSize={40}
            sliderSize={20}
            noSnap={true}
            row={false}
            style={styles.colorPicker}
          />
        )}
      </View>

      <View style={styles.colorSection}>
        <View style={styles.colorSelectorContainer}>
          <TouchableOpacity
            onPress={() => setShowBgColorPicker(!showBgColorPicker)}
            style={[
              styles.colorButton,
              { backgroundColor: theme.dark === true ? theme.colors.secondary : "white" },
            ]}
          >
            <Icon name="color-fill" size={24} color={theme.colors.text} />
            <View
              style={[
                styles.colorPreview,
                { backgroundColor: settings.backgroundColor },
              ]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowBgColorPicker(!showBgColorPicker)}
            style={styles.themeColorButton}
          >
            <Icon name="color-palette" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        {showBgColorPicker && (
          <ColorPicker
            color={backgroundColor}
            onColorChange={setBackgroundColor}
            thumbSize={40}
            sliderSize={20}
            noSnap={true}
            row={false}
            style={styles.colorPicker}
          />
        )}
      </View>

      <TouchableOpacity style={[styles.saveButton,{backgroundColor:theme.dark === true ? theme.colors.background : "gray"}]} onPress={saveSettings}>
        <Text style={[styles.saveButtonText, ]}>Save Settings</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={showWarningModal}
        animationType="fade"
        onRequestClose={toggleWarningModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              1. Theme switch does not apply across the entire application.
            </Text>
            <TouchableOpacity
              onPress={toggleWarningModal}
              style={[styles.modalButton, { backgroundColor: textColor }]}
            >
              <Text
                style={[styles.modalButtonText, { color: backgroundColor }]}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
  },
  previewBox: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewText: {
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  value: {
    textAlign: "center",
    marginTop: 5,
    fontSize: 16,
  },
  pickerContainer: {
    // backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    // shadowColor:'#000',
    // elevation:5,
  },
  picker: {
    backgroundColor: "white",
    shadowColor: "#000",
    width: "100%",
    elevation: 5,
  },
  colorSection: {
    marginBottom: 25,
  },
  colorSelectorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorButton: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "rgba(61, 64, 67, 0.1)",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    elevation: 3,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: 10,
  },
  themeColorButton: {
    padding: 10,
    backgroundColor: "rgba(61, 64, 67, 0.1)",
    borderRadius: 10,
    marginLeft: 10,
  },
  colorPicker: {
    marginTop: 15,
  },
  saveButton: {
    // backgroundColor: "#427092",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "#3d4043",
    borderRadius: 15,
    alignItems: "center",
  },
  modalText: {
    color: "#fafafa",
    marginBottom: 20,
    textAlign: "center",
    fontSize: 16,
  },
  modalButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  modalButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Settings;
