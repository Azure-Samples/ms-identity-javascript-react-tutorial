import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

import { Nav, Navbar, Button, Dropdown, DropdownButton} from "react-bootstrap";

import { loginRequest } from "../authConfig";

export const NavigationBar = () => {

    const { instance } = useMsal();

    const handleLogin = () => {
        instance.loginPopup(loginRequest)
            .catch((error) => console.log(error))
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
                    <DropdownButton variant="warning" className="ml-auto" drop="left" title="Sign Out">
                        <Dropdown.Item as="button" onClick={() => instance.logoutPopup({ postLogoutRedirectUri: "/", mainWindowRedirectUri: "/" })}>Sign out using Popup</Dropdown.Item>
                        <Dropdown.Item as="button" onClick={() => instance.logoutRedirect({ postLogoutRedirectUri: "/" })}>Sign out using Redirect</Dropdown.Item>
                    </DropdownButton>
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <DropdownButton variant="secondary" className="ml-auto" drop="left" title="Sign In">
                        <Dropdown.Item as="button" onClick={handleLogin}>Sign in using Popup</Dropdown.Item>
                        <Dropdown.Item as="button" onClick={() => instance.loginRedirect(loginRequest)}>Sign in using Redirect</Dropdown.Item>
                    </DropdownButton>
                </UnauthenticatedTemplate>
            </Navbar>
        </>
    );
};