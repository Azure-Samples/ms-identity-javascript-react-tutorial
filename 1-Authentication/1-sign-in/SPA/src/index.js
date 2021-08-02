import React from "react";
import ReactDOM from "react-dom";
import { PublicClientApplication } from "@azure/msal-browser";

import App from "./App.jsx";
import { msalConfig } from "./authConfig";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";

/**
 * MSAL should be instantiated outside of the component tree to prevent it from being re-instantiated on re-renders. 
 * For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
export const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
    <React.StrictMode>
        <App msalInstance={msalInstance}/>
    </React.StrictMode>,
    document.getElementById("root")
);
