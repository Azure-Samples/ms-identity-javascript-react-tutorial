import React from 'react';
import { createRoot } from 'react-dom/client';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App.jsx';
import { msalConfig } from './authConfig';
import { addSessionTimeoutToStorage, removeSessionTimeoutFromStorage } from './utils/storageUtils';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';

const container = document.getElementById('root');
const root = createRoot(container);

/**
 * MSAL should be instantiated outside of the component tree to prevent it from being re-instantiated on re-renders.
 * For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
export const msalInstance = new PublicClientApplication(msalConfig);

// Account selection logic is app dependent. Adjust as needed for different use cases.
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

/**
 * To set an active account after the user signs in, register an event and listen for LOGIN_SUCCESS and LOGOUT_SUCCESS. For more,
 * visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/events.md
 */
msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
        const account = event.payload.account;
        addSessionTimeoutToStorage(
            event.payload.account.idTokenClaims.exp,
            `ss.${msalConfig.auth.clientId}.${event.payload.account.idTokenClaims.oid}`
        );
        msalInstance.setActiveAccount(account);
    }

    if (event.eventType === EventType.LOGOUT_SUCCESS && event.payload.account) {
        removeSessionTimeoutFromStorage(event.payload.account);
        if (msalInstance.getAllAccounts().length > 0) {
            msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
        }
    }

    if (event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS && event.payload.account) {
        addSessionTimeoutToStorage(
            event.payload.account.idTokenClaims.exp,
            `ss.${msalConfig.auth.clientId}.${event.payload.account.idTokenClaims.oid}`
        );
    }

    if (event.eventType === EventType.SSO_SILENT_SUCCESS && event.payload.account) {
        addSessionTimeoutToStorage(
            event.payload.account.idTokenClaims.exp,
            `ss.${msalConfig.auth.clientId}.${event.payload.account.idTokenClaims.oid}`
        );
    }


});

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App instance={msalInstance} />
        </BrowserRouter>
    </React.StrictMode>
);
