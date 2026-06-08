import * as Font from "expo-font";

const zillaRegular = require("../assets/fonts/ZillaSlab-Regular.ttf");
const zillaSemiBold = require("../assets/fonts/ZillaSlab-SemiBold.ttf");
const merriweather = require("../assets/fonts/Merriweather-VariableFont_opsz,wdth,wght.ttf");
const philosopher = require("../assets/fonts/Philosopher-Regular.ttf");

// Loaded at app startup — used across UI chrome and default typography.
export const CORE_FONTS = {
  ZillaSlab: zillaRegular,
  ZillaSlabsm: zillaSemiBold,
  "ZillaSlab-Regular": zillaRegular,
  "ZillaSlab-SemiBold": zillaSemiBold,
  ZillaSlab_smb: zillaSemiBold,
  Merriweather: merriweather,
  Merriweathersm: merriweather,
  Philosopher: philosopher,
  "Philosopher-Regular": philosopher,
};

const OPTIONAL_READING_FONTS = {
  Lora: require("../assets/fonts/Lora-VariableFont_wght.ttf"),
  "Merienda-VariableFont_wght": require("../assets/fonts/Merienda-VariableFont_wght.ttf"),
};

const CORE_FONT_FAMILIES = new Set([
  "System",
  "ZillaSlab",
  "ZillaSlabsm",
  "ZillaSlab-Regular",
  "ZillaSlab-SemiBold",
  "ZillaSlab_smb",
  "Merriweather",
  "Merriweathersm",
  "Philosopher",
  "Philosopher-Regular",
]);

const loadedOptionalFonts = new Set();

export async function ensureReadingFontLoaded(fontFamily) {
  if (!fontFamily || CORE_FONT_FAMILIES.has(fontFamily)) {
    return true;
  }

  if (Font.isLoaded(fontFamily) || loadedOptionalFonts.has(fontFamily)) {
    return true;
  }

  const fontAsset = OPTIONAL_READING_FONTS[fontFamily];
  if (!fontAsset) {
    return true;
  }

  try {
    await Font.loadAsync({ [fontFamily]: fontAsset });
    loadedOptionalFonts.add(fontFamily);
    return true;
  } catch (error) {
    console.warn(`Failed to load font ${fontFamily}:`, error);
    return false;
  }
}
