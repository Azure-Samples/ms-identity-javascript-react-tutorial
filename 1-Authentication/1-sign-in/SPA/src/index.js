import React from "react";
import ReactDOM from "react-dom";
import { PublicClientApplication } from "@azure/msal-browser";

import App from "./App.jsx";
import { msalConfig } from "./authConfig";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";

const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
    <React.StrictMode>
        <App msalInstance={msalInstance}/>
    </React.StrictMode>,
    document.getElementById("root")
);
