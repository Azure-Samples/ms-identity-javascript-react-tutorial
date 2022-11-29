import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

import { BrowserRouter as Router } from 'react-router-dom';
import { EventType } from '@azure/msal-browser';
import { msalInstance } from './authConfig';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/index.css';

// Default to using the first account if no account is active on page load
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
  // Account selection logic is app dependent. Adjust as needed for different use cases.
  msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

msalInstance.addEventCallback((event) => {
  if (
      (event.eventType === EventType.LOGIN_SUCCESS ||
          event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS ||
          event.eventType === EventType.SSO_SILENT_SUCCESS) &&
      event.payload.account
  ) {
      msalInstance.setActiveAccount(event.payload.account);
  }
})

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <Router>
            <App instance={msalInstance} />
        </Router>
    </React.StrictMode>
);
