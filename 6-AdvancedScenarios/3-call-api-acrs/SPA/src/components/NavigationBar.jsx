import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

import { Nav, Navbar, Button } from "react-bootstrap";

import { loginRequest } from "../authConfig";
import { clearStorage } from "../utils/storageUtils";

export const NavigationBar = () => {
    const { instance } = useMsal();

    const handleLogoutPopup = () => {
        const activeAccount = instance.getActiveAccount();
        clearStorage(activeAccount);

        instance.logoutPopup({
            postLogoutRedirectUri: "/",
            mainWindowRedirectUri: "/"
        })
    }

    const handleLoginPopup = () => {
        instance.loginPopup({
            ...loginRequest,
            redirectUri: '/redirect'
        }).catch((error) => console.log(error));
    }

    /**
     * Most applications will need to conditionally render certain components based on whether a user is signed in or not.
     * msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will
     * only render their children if a user is authenticated or unauthenticated, respectively.
     */
    return (
        <>
            <Navbar bg="primary" variant="dark">
                <a className="navbar-brand" href="/">Microsoft identity platform</a>
                <AuthenticatedTemplate>
            <Nav.Link as={Button} href="/todolist">TodoList</Nav.Link>
                    <Button variant="warning" className="ml-auto" drop="left" onClick={handleLogoutPopup}>Sign out</Button>
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <Button variant="secondary" className="ml-auto" drop="left" onClick={handleLoginPopup}>Sign in</Button>
                </UnauthenticatedTemplate>
            </Navbar>
        </>
    );
};
