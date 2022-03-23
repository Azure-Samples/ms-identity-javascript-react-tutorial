import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

import { Nav, Navbar, Button, Dropdown, DropdownButton} from "react-bootstrap";

import { loginRequest } from "../authConfig";
import { clearStorage } from "../util/Util";

export const NavigationBar = () => {


    const { instance } = useMsal();

    const handleLogoutPopup = () => {
        clearStorage();
        instance.logoutPopup({
            postLogoutRedirectUri: "http://localhost:3000/",
            mainWindowRedirectUri: "http://localhost:3000/"
        })
    }

    const handleLogoutRedirect = () => {
        clearStorage();
        instance.logoutRedirect({ 
            postLogoutRedirectUri: "http://localhost:3000/"
         })
    }

    const loginPopup = () => {
        instance.loginPopup(loginRequest)
         .catch( error => console.log(error))
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
                        <Dropdown.Item as="button" onClick={handleLogoutPopup}>Sign out using Popup</Dropdown.Item>
                        <Dropdown.Item as="button" onClick={handleLogoutRedirect}>Sign out using Redirect</Dropdown.Item>
                    </DropdownButton>
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <DropdownButton variant="secondary" className="ml-auto" drop="left" title="Sign In">
                        <Dropdown.Item as="button" onClick={loginPopup}>Sign in using Popup</Dropdown.Item>
                        <Dropdown.Item as="button" onClick={() => instance.loginRedirect(loginRequest)}>Sign in using Redirect</Dropdown.Item>
                    </DropdownButton>
                </UnauthenticatedTemplate>
            </Navbar>
        </>
    );
};