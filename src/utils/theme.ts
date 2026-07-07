import { createTheme } from "@mui/material";
import { COLORS } from "./styles";

const DISPLAY_FONT = '"Archivo", "Inter", "Helvetica", "Arial", sans-serif';
const BODY_FONT = '"Inter", "Helvetica", "Arial", sans-serif';

export const buildTheme = (darkMode: boolean) =>
  createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: darkMode ? COLORS.mainDark : COLORS.main },
      secondary: { main: darkMode ? COLORS.markerBlueDark : COLORS.markerBlue },
      background: darkMode
        ? { default: COLORS.blackboard, paper: "#1B2127" }
        : { default: COLORS.whiteboard, paper: "#FFFFFF" },
      text: darkMode
        ? { primary: COLORS.chalk, secondary: "#AAB4BD" }
        : { primary: COLORS.ink, secondary: "#5F6B76" },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: BODY_FONT,
      h4: {
        fontFamily: DISPLAY_FONT,
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        fontSize: "1.5rem",
        "@media (min-width:600px)": { fontSize: "2rem" },
      },
      h6: {
        fontFamily: DISPLAY_FONT,
        fontWeight: 700,
        letterSpacing: "0.01em",
      },
      button: { fontWeight: 600 },
    },
    components: {
      MuiTab: {
        styleOverrides: {
          root: {
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", borderRadius: 8 },
          containedPrimary: { boxShadow: "none" },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, letterSpacing: "0.02em" },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
    },
  });
