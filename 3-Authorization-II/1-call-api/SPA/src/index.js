import React from "react";
import ReactDOM from "react-dom";

import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

import App from "./App.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
  <React.StrictMode>
    <App instance={msalInstance} />
  </React.StrictMode>,
  document.getElementById('root')
);
