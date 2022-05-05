import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App.jsx";

import reportWebVitals from "./reportWebVitals";
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
