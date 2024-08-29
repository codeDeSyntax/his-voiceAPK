import React, { useContext, useState } from "react";
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

function Settings() {
  const { settings, setSettings } = useContext(SermonContext);
  const [fontSize, setFontSize] = useState(settings.fontSize);
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);
  const [textColor, setTextColor] = useState(settings.textColor);
  const [backgroundColor, setBackgroundColor] = useState(
    settings.backgroundColor
  );
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false); // State for the warning modal

  const fontFamilies = ["System", "Roboto", "monospace"];

  const togglePreview = () => setShowPreview(!showPreview);
  const toggleWarningModal = () => setShowWarningModal(!showWarningModal); // Function to toggle the warning modal

  const newSettings = {
    backgroundColor: backgroundColor,
    fontSize: fontSize,
    fontFamily: fontFamily,
    textColor: textColor,
  };

  const defaultSettings = {
    backgroundColor: "#2d2d2d",
    fontSize: 12,
    fontFamily: "monospace",
    textColor: "#fafafa",
  };

  const saveSettings = async () => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    try {
      await AsyncStorage.setItem(
        "sermonSettings",
        JSON.stringify(updatedSettings)
      );
      console.log("Settings saved:");
    } catch (error) {
      console.log("Error saving settings:", error);
    }
  };

  const restoreDefault = async () => {
    setSettings(defaultSettings);
    try {
      await AsyncStorage.setItem(
        "sermonSettings",
        JSON.stringify(defaultSettings)
      );
      console.log("Settings restored to default:", defaultSettings);
    } catch (error) {
      console.log("Error restoring settings:", error);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: "#2D2D2D" }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { fontFamily, fontSize: fontSize + 4 }]}>
          Settings
        </Text>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            onPress={togglePreview}
            style={styles.previewButton}
          >
            <Icon
              name={showPreview ? "eye-off" : "eye"}
              size={24}
              color="#fafafa"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => restoreDefault()}
            style={styles.previewButton}
          >
            <Icon name="refresh" size={24} color="#fafafa" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleWarningModal}
            style={styles.previewButton}
          >
            <Icon name="warning-outline" size={24} color="#fafafa" />
          </TouchableOpacity>
        </View>
      </View>

      {showPreview && (
        <View style={[styles.previewBox, { backgroundColor: backgroundColor }]}>
          <Text
            style={[
              styles.previewText,
              { fontFamily, fontSize, color: textColor },
            ]}
          >
            Preview Text
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontFamily }]}>Font Size</Text>
        <Slider
          style={styles.slider}
          minimumValue={12}
          maximumValue={24}
          thumbTintColor={settings.textColor}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#3d4043"
          step={1}
          value={fontSize}
          onValueChange={setFontSize}
        />
        <Text style={[styles.value, { fontFamily, color: "#fafafa" }]}>
          {fontSize}px
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontFamily }]}>Font Family</Text>
        <Picker
          selectedValue={fontFamily}
          onValueChange={(itemValue) => setFontFamily(itemValue)}
          style={[styles.picker, { fontFamily, color: "#fafafa" }]}
        >
          {fontFamilies.map((family) => (
            <Picker.Item key={family} label={family} value={family} />
          ))}
        </Picker>
      </View>

      <View style={[styles.section, {width:'50%'}]}>
        <TouchableOpacity
          onPress={() => setShowTextColorPicker(!showTextColorPicker)}
        >
          <View
            style={[
              styles.sectionTitle,
              {
                flexDirection:'row',
                gap:4,
                justifyContent:'center',
                alignItems:'center',
                padding: 10,
                backgroundColor: "#3d4043",
                // width: "50%",
                borderRadius: 10,
              },
            ]}
          >
          <Icon name="text" size={24} color={settings.textColor} />
           <Text style={{color:'#fafafa',padding:5, backgroundColor:settings.textColor,borderRadius:20}}>{settings.textColor}</Text>
          </View>
        </TouchableOpacity>
        {showTextColorPicker && (
          <ColorPicker
            color={textColor}
            onColorChange={setTextColor}
            thumbSize={50}
            sliderSize={10}
            noSnap={true}
            swatches={false}
            row={false}
            style={styles.colorPicker}
          />
        )}
      </View>

      <View style={[styles.section, {width:'50%'}]}>
        <TouchableOpacity
          onPress={() => setShowBgColorPicker(!showBgColorPicker)}
        >
          <View
            style={[
              styles.sectionTitle,
              {
                padding: 10,
                backgroundColor: "#3d4043",
                // width: "50%",
                borderRadius: 10,
                flexDirection:'row',
                gap:4
              },
            ]}
          >
            <View style={{padding:10,backgroundColor:settings.backgroundColor,width:70,borderRadius:10}}></View>
            <Text style={{color:'#fafafa'}}>{settings.backgroundColor}</Text>
          </View>
        </TouchableOpacity>
        {showBgColorPicker && (
          <ColorPicker
            color={backgroundColor}
            onColorChange={setBackgroundColor}
            thumbSize={40}
            sliderSize={10}
            noSnap={true}
            row={false}
            style={styles.colorPicker}
          />
        )}
      </View>

      <TouchableOpacity style={[styles.button, {backgroundColor:'#427092'}]} onPress={() => saveSettings()}>
        <Text style={[styles.buttonText]}>Save Settings</Text>
      </TouchableOpacity>

      {/* Modal for the warning message */}
      <Modal
        transparent={true}
        visible={showWarningModal}
        animationType="slide"
        onRequestClose={toggleWarningModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>
              Settings do not apply across the whole application.
            </Text>
            <TouchableOpacity
              onPress={toggleWarningModal}
              style={[styles.modalButton, {backgroundColor:settings.textColor}]}
            >
              <Text style={[styles.modalButtonText ]}>Close</Text>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#fafafa",
  },
  previewButton: {
    padding: 5,
  },
  previewBox: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: {
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fafafa",
  },
  value: {
    textAlign: "center",
    marginTop: 5,
  },
  picker: {
    width: "100%",
    backgroundColor: "#3d4043",
    borderRadius: 20,
    color: "#fafafa",
  },
  colorPicker: {
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
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
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    color: "#fafafa",
    marginBottom: 20,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Settings;
