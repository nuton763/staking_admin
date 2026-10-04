"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00bcd4" },
    secondary: { main: "#81d4fa" },
    background: {
      default: "#0a0033",
      paper: "rgba(36,0,79,0.85)",
    },
    text: {
      primary: "#e3f2fd",
      secondary: "#b0bec5",
    },
    error: { main: "#f44336" },
    warning: { main: "#ff9800" },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h4: { fontWeight: 800 },
  },
  shape: { borderRadius: 10 },
});

export default theme;
