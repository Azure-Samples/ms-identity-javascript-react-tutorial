import React, { useState, useEffect } from "react";

import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";

import { msalConfig, loginRequest } from "./authConfig";
import { PageLayout, ProfileData, IdTokenClaims } from "./ui.jsx";
import { callApiWithToken } from "./fetch.jsx";
import { graphConfig } from "./authConfig";

import Button from "react-bootstrap/Button";
import "./styles/App.css";

const ProfileContent = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance, 
     * an array of all accounts currently signed in and an inProgress value 
     * that tells you what msal is currently doing.
     */
    const { instance, accounts } = useMsal();
    const [graphData, setGraphData] = useState(null);

    /**
     * We recommend that your app calls the acquireTokenSilent API on your PublicClientApplication 
     * object each time you need an access token to access an API.
     */
    function RequestProfileData() {
        instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0]
        }).then((response) => {
            callApiWithToken(response.accessToken, graphConfig.graphMeEndpoint)
                .then(response => setGraphData(response));
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <>
            {graphData ?
                <ProfileData graphData={graphData} />
                :
                <Button variant="secondary" onClick={RequestProfileData}>Request Profile Information</Button>
            }
        </>
    );
};

const IdTokenContent = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance, 
     * an array of all accounts currently signed in and an inProgress value 
     * that tells you what msal is currently doing.
     */
    const { accounts } = useMsal();
    const [idTokenClaims, setIdTokenClaims] = useState(null);

    function GetIdTokenClaims() {
        setIdTokenClaims(accounts[0].idTokenClaims)
    }

    return (
        <>
            <h5 className="card-title">Welcome {accounts[0].name}</h5>
            {idTokenClaims ?
                <IdTokenClaims idTokenClaims={idTokenClaims} />
                :
                <Button variant="secondary" onClick={GetIdTokenClaims}>View ID Token Claims</Button>
            }
        </>
    );
};

/**
 * Most applications will need to conditionally render certain components based on whether a user is signed in or not. 
 * msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will 
 * only render their children if a user is authenticated or unauthenticated, respectively.
 */
const MainContent = () => {
    return (
        <div className="App">
            <AuthenticatedTemplate>
                <IdTokenContent />
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
 * PublicClientApplication instance via context as well as all hooks and components provided by msal-react
 */
export default function App() {
    const msalInstance = new PublicClientApplication(msalConfig);

    return (
        <MsalProvider instance={msalInstance}>
            <PageLayout>
                <MainContent />
            </PageLayout>
        </MsalProvider>
    );
}
