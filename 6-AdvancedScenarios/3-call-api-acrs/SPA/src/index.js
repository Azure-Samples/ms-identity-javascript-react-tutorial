/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";
import ReactDOM from "react-dom";

import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

import App from "./App.jsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";

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

ReactDOM.render(
    <React.StrictMode>
        <App instance={msalInstance} />
    </React.StrictMode>,
    document.getElementById('root')
);
