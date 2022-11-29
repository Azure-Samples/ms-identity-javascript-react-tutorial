import React from 'react';
import { createRoot } from 'react-dom/client';
import { EventType } from '@azure/msal-browser';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import { msalInstance } from './authConfig';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';

const container = document.getElementById('root');
const root = createRoot(container);

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
        msalInstance.setActiveAccount(account);
    }

    if (event.eventType === EventType.LOGOUT_SUCCESS) {
        if (msalInstance.getAllAccounts().length > 0) {
            msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
        }
    }
});

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App instance={msalInstance} />
        </BrowserRouter>
    </React.StrictMode>
);
