import React from "react";
import { createRoot } from "react-dom/client";
import { PublicClientApplication } from "@azure/msal-browser";
import { App } from "./App.jsx";
import { msalConfig } from "./authConfig";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";

const container = document.getElementById("root");
const root = createRoot(container);


/**
 * MSAL should be instantiated outside of the component tree to prevent it from being re-instantiated on re-renders. 
 * For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
export const msalInstance = new PublicClientApplication(msalConfig);

// Account selection logic is app dependent. Adjust as needed for different use cases.
const accounts = msalInstance.getAllAccounts();

if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

root.render(
  <React.StrictMode>
    <App instance={msalInstance} />
  </React.StrictMode>
);
