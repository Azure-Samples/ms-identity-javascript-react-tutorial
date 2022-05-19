import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App.jsx";

import { BrowserRouter } from "react-router-dom";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";

export const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
  <BrowserRouter>
    <App instance={msalInstance} />
  </BrowserRouter>,
  document.getElementById("root")
);
