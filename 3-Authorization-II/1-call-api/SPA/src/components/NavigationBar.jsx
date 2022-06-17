import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";

import { Nav, Navbar, Button, Dropdown, DropdownButton, Container } from "react-bootstrap";

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
                <Container>
                    <Navbar.Brand href="/">Microsoft identity platform</Navbar.Brand>
                    <AuthenticatedTemplate>
                        <Nav className="me-auto">
                            <Nav.Link as={Button} href="/todolist">Todolist</Nav.Link>
                        </Nav>
                        <Navbar.Collapse className="justify-content-end">
                            <Navbar.Text className="me-2">{instance.getActiveAccount()?.username}</Navbar.Text>
                            <DropdownButton variant="warning" align="end" title="Sign Out">
                                <Dropdown.Item as="button" onClick={() => instance.logoutPopup({ postLogoutRedirectUri: "/", mainWindowRedirectUri: "/" })}>Sign out using Popup</Dropdown.Item>
                                <Dropdown.Item as="button" onClick={() => instance.logoutRedirect({ postLogoutRedirectUri: "/" })}>Sign out using Redirect</Dropdown.Item>
                            </DropdownButton>
                        </Navbar.Collapse>
                    </AuthenticatedTemplate>
                    <UnauthenticatedTemplate>
                        <DropdownButton variant="secondary" align="end" title="Sign In">
                            <Dropdown.Item as="button" onClick={handleLogin}>Sign in using Popup</Dropdown.Item>
                            <Dropdown.Item as="button" onClick={() => instance.loginRedirect(loginRequest)}>Sign in using Redirect</Dropdown.Item>
                        </DropdownButton>
                    </UnauthenticatedTemplate>
                </Container>
            </Navbar>
        </>
    );
};
