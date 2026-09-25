import "./assets/styles/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./assets/styles/index.css";
import { AuthProvider } from "./contexts/AuthContext.jsx"; // Import the provider
import { ThemeProvider } from "./contexts/ThemeContext.jsx"; // Import the new provider
import { Toaster } from "sonner"; // Import Sonner

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        {" "}
        <Toaster richColors position="bottom-right" />
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
);
