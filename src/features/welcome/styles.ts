import { StyleSheet } from "react-native";
import type { AppTheme } from "@/shared/theme/types";

export const getWelcomePalette = (theme: AppTheme) => ({
  background: theme.colors.background,
  ink: theme.dark ? "#f5e6d8" : "#462c1c",
  muted: theme.dark ? "#bca99a" : "#80634d",
  accent: theme.dark ? "#e8bc9b" : "#633b23",
  onAccent: theme.dark ? "#2b1e16" : "#fff5e6",
  border: theme.dark ? "rgba(232,188,155,0.15)" : "rgba(99,59,35,0.14)",
  surface: theme.dark ? "rgba(232,188,155,0.07)" : "rgba(99,59,35,0.055)",
  error: theme.dark ? "#f4a99c" : "#a13326",
});

export const welcomeStyles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 18 },
  frame: { flexGrow: 1, width: "100%", maxWidth: 520, alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 44 },
  wordmark: { fontFamily: "Philosopher", fontSize: 25, letterSpacing: -0.7 },
  themeButton: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: -8 },
  hero: { marginTop: 16, marginHorizontal: -10, justifyContent: "flex-end" },
  // Static Image assets otherwise retain their original dimensions beyond the fades.
  heroArtwork: { ...StyleSheet.absoluteFill, overflow: "hidden" },
  heroImage: { ...StyleSheet.absoluteFill, width: "100%", height: "100%", opacity: 0.82 },
  heroContent: { paddingTop: 48, paddingHorizontal: 32, paddingBottom: 28 },
  eyebrow: { fontFamily: "ZillaSlab-SemiBold", fontSize: 10, letterSpacing: 2.5, marginBottom: 9, color: "#ead3bb" },
  title: {
    fontFamily: "Philosopher", fontSize: 43, lineHeight: 47, letterSpacing: -0.8, color: "#fff3e1",
    textShadowColor: "rgba(15,10,7,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6,
  },
  metadata: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 14 },
  formats: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", maxWidth: "100%", gap: 7 },
  metadataText: { fontFamily: "ZillaSlab", fontSize: 12 },
  years: { fontFamily: "ZillaSlab-SemiBold", fontSize: 12, letterSpacing: 1 },
  quote: { flexGrow: 1, justifyContent: "center", paddingVertical: 24 },
  quoteBody: { paddingLeft: 16, borderLeftWidth: 2 },
  quoteText: { fontFamily: "Philosopher", fontSize: 18, lineHeight: 26 },
  quoteReference: { fontFamily: "ZillaSlab-SemiBold", fontSize: 10, letterSpacing: 1.8, marginTop: 12 },
  actionArea: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 18 },
  primaryButton: { minHeight: 54, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 18, paddingVertical: 14 },
  buttonLabel: { flex: 1, fontFamily: "ZillaSlab-SemiBold", fontSize: 17 },
  progressHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressTitle: { flex: 1, fontFamily: "ZillaSlab-SemiBold", fontSize: 16 },
  percentage: { fontFamily: "ZillaSlab-SemiBold", fontSize: 14, fontVariant: ["tabular-nums"] },
  progressTrack: { height: 5, borderRadius: 3, overflow: "hidden", marginTop: 14 },
  progressFill: { height: "100%", borderRadius: 3 },
  downloadFooter: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  progressHint: { flex: 1, fontFamily: "ZillaSlab", fontSize: 12, lineHeight: 17 },
  cancel: { minWidth: 62, minHeight: 44, justifyContent: "center", alignItems: "center", borderRadius: 10 },
  cancelLabel: { fontFamily: "ZillaSlab-SemiBold", fontSize: 13 },
  error: { fontFamily: "ZillaSlab", fontSize: 13, lineHeight: 19, marginBottom: 12 },
});
