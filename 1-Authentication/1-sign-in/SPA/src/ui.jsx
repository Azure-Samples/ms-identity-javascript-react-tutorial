/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React from "react";

import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

import { Navbar, Button, Dropdown, DropdownButton} from "react-bootstrap";

import { loginRequest } from "./authConfig";

const NavigationBar = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance, 
     * an array of all accounts currently signed in and an inProgress value 
     * that tells you what msal is currently doing. For more, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */
    const { instance } = useMsal();

    return (
        <>
            <AuthenticatedTemplate>
                <DropdownButton variant="warning" className="ml-auto" drop="left" title="Sign Out">
                    <Dropdown.Item as="button" onClick={() => instance.logoutPopup({postLogoutRedirectUri: "/", mainWindowRedirectUri: "/"})}>Sign out using Popup</Dropdown.Item>
                    <Dropdown.Item as="button" onClick={() => instance.logoutRedirect({postLogoutRedirectUri: "/"})}>Sign out using Redirect</Dropdown.Item>
                </DropdownButton>
                <Button variant="warning" onClick={() => instance.logout()} className="ml-auto">Sign Out</Button>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <DropdownButton variant="secondary" className="ml-auto" drop="left" title="Sign In">
                    <Dropdown.Item as="button" onClick={() => instance.loginPopup(loginRequest)}>Sign in using Popup</Dropdown.Item>
                    <Dropdown.Item as="button" onClick={() => instance.loginRedirect(loginRequest)}>Sign in using Redirect</Dropdown.Item>
                </DropdownButton>
            </UnauthenticatedTemplate>
        </>
    );
};

export const PageLayout = (props) => {
    return (
        <>
            <Navbar bg="primary" variant="dark">
                <a className="navbar-brand" href="/">Microsoft identity platform</a>
                <NavigationBar />
            </Navbar>
            <br />
            <h5><center id="title">Welcome to the Microsoft Authentication Library For React Tutorial</center></h5>
            <br />
            {props.children}
            <br />
            <AuthenticatedTemplate>
                <footer>
                    <center>How did we do?
                        <a href="https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR73pcsbpbxNJuZCMKN0lURpUMlRHSkc5U1NLUkxFNEtVN0dEOTFNQkdTWiQlQCN0PWcu" target="_blank"> Share your experience!</a>
                    </center>
                </footer>
            </AuthenticatedTemplate>
        </>
    );
};

export const IdTokenClaims = (props) => {
    return (
        <div id="token-div">
            <p><strong>Audience: </strong> {props.idTokenClaims.aud}</p>
            <p><strong>Issuer: </strong> {props.idTokenClaims.iss}</p>
            <p><strong>OID: </strong> {props.idTokenClaims.oid}</p>
            <p><strong>UPN: </strong> {props.idTokenClaims.preferred_username}</p>
        </div>
    );
}