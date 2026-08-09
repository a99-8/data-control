import React from "react";
import ReactDOM from "react-dom/client";
import OptionsApp from "./App.tsx";
import "@/src/assets/style.css";
import "@/src/i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <OptionsApp />
  </React.StrictMode>,
);
