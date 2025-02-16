import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { ThemeProvider } from "./lib/theme-provider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="lobbyleap-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
