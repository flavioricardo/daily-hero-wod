import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.js";
import React from "react";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("Failed to find the root element");
}
