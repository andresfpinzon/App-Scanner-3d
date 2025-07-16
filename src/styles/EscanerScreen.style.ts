import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { Dimensions } from "react-native";
import type { MD3Theme } from "react-native-paper/lib/typescript/types";


const { width } = Dimensions.get("window");
const isSmallScreen = width < 375;

export const getStyles = (isDarkMode: boolean, theme: MD3Theme) => {
  const colors = {
    primary: theme.colors.primary,
    accent: theme.colors.secondary,
    background: isDarkMode ? "#121212" : "#f8f9fa",
    surface: isDarkMode ? "#1e1e1e" : "#ffffff",
    surfaceVariant: isDarkMode ? "#2d2d2d" : "#e3f2fd",
    text: isDarkMode ? "#e0e0e0" : "#333333",
    textSecondary: isDarkMode ? "#a0a0a0" : "#666666",
    highlight: isDarkMode ? "#9d61e6ff" : "#1e88e5",
    border: isDarkMode ? "#444444" : "#e0e0e0",
    snackbar: isDarkMode ? "#2d2d2d" : "#7866fd",
    button: isDarkMode ? "#9d61e6ff" : "#1e40af",
    buttonText: isDarkMode ? "#000000" : "#e3f2fd",
    sliderThumb: isDarkMode ? "#9d61e6ff" : "#1e88e5",
    sliderTrack: isDarkMode ? "#3a3a3a" : "#e0e0e0",
    sliderActive: isDarkMode ? "#9d61e6ff" : "#1e88e5",
    wifiInfoBg: isDarkMode ? "#4f5256" : "#f0f8ff",
    motorButton: isDarkMode ? "#9d61e6ff" : "#1e88e5",
  };

  return StyleSheet.create({
    connectionCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    cardTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    container: {
      flexGrow: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
    },
    themeButton: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      marginLeft: 8,
    },
    connectionCard: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: 12,
      marginBottom: 20,
      elevation: 1,
    },
    wifiInfo: {
      backgroundColor: colors.wifiInfoBg,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    controlCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 20,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: "bold",
      color: colors.text,
      marginRight: 10,
    },
    cardText: {
      fontSize: isSmallScreen ? 14 : 15,
      marginVertical: 2,
      color: colors.text,
    },
    infoLabel: {
      fontWeight: "bold",
      color: colors.text,
    },
    highlight: {
      fontWeight: "bold",
      color: colors.highlight,
    },
    divider: {
      backgroundColor: colors.border,
      marginVertical: 8,
      height: 1,
    },
    alturaContainer: {
      marginTop: 15,
      padding: 12,
      backgroundColor: isDarkMode ? "#252525" : "#f9f9f9",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    presetTitle: {
      fontSize: isSmallScreen ? 15 : 16,
      fontWeight: "600",
      marginBottom: 10,
      color: colors.text,
    },
    currentAltura: {
      fontSize: isSmallScreen ? 14 : 15,
      fontWeight: "500",
      marginTop: 10,
      textAlign: "center",
      color: colors.highlight,
    },
    presetContainer: {
      flexDirection: isSmallScreen ? "column" : "row",
      justifyContent: "space-between",
    },
    presetButton: {
      flex: isSmallScreen ? 0 : 1,
      marginBottom: isSmallScreen ? 10 : 0,
      marginHorizontal: isSmallScreen ? 0 : 4,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 6,
      backgroundColor: isDarkMode ? "#333" : "#fff",
    },
    selectedPreset: {
      backgroundColor: colors.button,
      borderColor: colors.button,
    },
    presetLabel: {
      fontSize: isSmallScreen ? 13 : 14,
      color: colors.text,
    },
    selectedPresetLabel: {
      color: colors.buttonText,
      fontWeight: "bold",
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
      gap: 12,
    },
    motorActionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
      gap: 12,
    },
    actionButton: {
      flex: 1,
      marginHorizontal: 6,
      paddingVertical: 12,
      borderRadius: 8,
      minHeight: 40,
      justifyContent: "center",
    },
    resetButton: {
      borderColor: colors.button,
      backgroundColor: colors.surface,
    },
    resetButtonLabel: {
      color: colors.button,
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: "600",
      textAlign: "center",
    },
    scanButton: {
      backgroundColor: colors.button,
      elevation: 3,
    },
    scanButtonLabel: {
      color: colors.buttonText,
      fontWeight: "bold",
      fontSize: isSmallScreen ? 14 : 16,
      textAlign: "center",
      paddingVertical: 4,
    },
    motorButton: {
      flex: 1,
      backgroundColor: colors.motorButton,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 4,
    },
    motorButtonLabel: {
      color: "#FFF",
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: "500",
    },
    snackbar: {
      backgroundColor: colors.snackbar,
      marginBottom: 20,
      minHeight: 40,
      marginHorizontal: 16,
      borderRadius: 8,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      marginStart: 45,
    },
    wifiHighlight: {
      fontWeight: "bold",
      color: colors.highlight,
    },
    holdButton: {
      backgroundColor: colors.motorButton,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 120,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
  });
};