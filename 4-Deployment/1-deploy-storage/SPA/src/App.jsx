/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { useState } from "react";

import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { MsalProvider, useAccount, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

import { PageLayout, ProfileData } from "./ui.jsx";
import { protectedResources } from './authConfig';
import { callApiWithToken } from './fetch';

import Button from "react-bootstrap/Button";
import "./styles/App.css";

const ProfileContent = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance, 
     * an array of all accounts currently signed in and an inProgress value 
     * that tells you what msal is currently doing. For more, visit: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [graphData, setGraphData] = useState(null);

    /**	
     * We recommend that your app calls the acquireTokenSilent API on your PublicClientApplication 	
     * object each time you need an access token to access an API.	
     */
    const callTheApi = () => {
        instance.acquireTokenSilent({
                scopes: protectedResources.apiHello.scopes,
                account: account,
            }).then((response) => {
                callApiWithToken(response.accessToken, protectedResources.apiHello.endpoint)
                    .then((response) => setGraphData(response));
            }).catch((error) => {
                // in case if silent token acquisition fails, fallback to an interactive method
                if (error instanceof InteractionRequiredAuthError) {
                    if (account && inProgress === 'none') {
                        instance.acquireTokenPopup({
                                scopes: protectedResources.apiHello.scopes,
                            }).then((response) => {
                                callApiWithToken(response.accessToken, protectedResources.apiHello.endpoint)
                                    .then((response) => setGraphData(response));
                            }).catch((error) => console.log(error));
                    }
                }
            });
    };

    return (
        <>
            <h5 className="card-title">Welcome {accounts[0].name}</h5>
            {graphData ?
                <ProfileData graphData={graphData} />
                :
                <Button variant="secondary" onClick={callTheApi}>Call the API</Button>
            }
        </>
    );
};


/**
 * Most applications will need to conditionally render certain components based on whether a user is signed in or not. 
 * msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will 
 * only render their children if a user is authenticated or unauthenticated, respectively. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
const MainContent = () => {
    return (
        <div className="App">
            <AuthenticatedTemplate>
                <ProfileContent />
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <h5 className="card-title">Please sign-in to see your profile information.</h5>
            </UnauthenticatedTemplate>
        </div>
    );
};

/**
 * msal-react is built on the React context API and all parts of your app that require authentication must be 
 * wrapped in the MsalProvider component. You will first need to initialize an instance of PublicClientApplication 
 * then pass this to MsalProvider as a prop. All components underneath MsalProvider will have access to the 
 * PublicClientApplication instance via context as well as all hooks and components provided by msal-react. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
export default function App({ msalInstance }) {

    return (
        <MsalProvider instance={msalInstance}>
            <PageLayout>
                <MainContent />
            </PageLayout>
        </MsalProvider>
    );
}
