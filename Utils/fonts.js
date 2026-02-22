/**
 * Font Configuration for the App
 * Centralized font loading and naming
 */

/**
 * Font assets to load
 * Import this in components using useFonts hook
 * These keys are what you use as fontFamily in your styles
 */
export const fontsToLoad = {
  // Existing fonts
  ZillaSlab_smb: require("../assets/fonts/ZillaSlab-SemiBold.ttf"),
  ZillaSlab: require("../assets/fonts/ZillaSlab-Regular.ttf"),

  // Reading fonts
  Merriweather: require("../assets/fonts/Merriweather-VariableFont_opsz,wdth,wght.ttf"),
  Lora: require("../assets/fonts/Lora-VariableFont_wght.ttf"),
  Merienda: require("../assets/fonts/Merienda-VariableFont_wght.ttf"),
  Philosopher: require("../assets/fonts/Philosopher-Regular.ttf"),
};

/**
 * Font weight configurations for consistent styling
 */
export const fontWeights = {
  LIGHT: "300",
  REGULAR: "400",
  MEDIUM: "500",
  SEMIBOLD: "600",
  BOLD: "700",
  EXTRABOLD: "800",
};
