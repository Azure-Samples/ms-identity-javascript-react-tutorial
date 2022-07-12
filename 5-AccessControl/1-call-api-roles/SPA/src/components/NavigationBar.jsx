import { useState } from 'react';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { Nav, Navbar, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { AccountPicker } from './AccountPicker';
import { loginRequest, msalConfig } from '../authConfig';


export const NavigationBar = () => {
    const { instance } = useMsal();
    const [showProfilePicker, setShowProfilePicker] = useState(false);
      let activeAccount;

      if (instance) {
          activeAccount = instance.getActiveAccount();
      }

    const handleLoginRedirect = () => {
        instance.loginRedirect(loginRequest);
    };
    const handleLogin = () => {
        instance.loginPopup(loginRequest).catch((error) => console.log(error));
    };

    const handleLogoutPopup = () => {
        instance.logoutPopup({
            postLogoutRedirectUri: msalConfig.postLogoutRedirectUri, // redirects the Popup window
            mainWindowRedirectUri: '/', // redirects the top level app after logout
            account: instance.getActiveAccount(),
        });
    };

    const handleLogoutRedirect = () => {
        instance.logoutRedirect({
            postLogoutRedirectUri: msalConfig.postLogoutRedirectUri,
            account: instance.getActiveAccount(),
        });
    };

    const handleSwitchAccount = () => {
        setShowProfilePicker(!showProfilePicker);
    };

    /**
     * Most applications will need to conditionally render certain components based on whether a user is signed in or not.
     * msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will
     * only render their children if a user is authenticated or unauthenticated, respectively.
     */
    return (
        <>
            <Navbar bg="primary" variant="dark" className="navbarStyle">
                <a className="navbar-brand" href="/">
                    Microsoft identity platform
                </a>
                <AuthenticatedTemplate>
                    <Nav.Link as={Button} className="navbarButton" href="/todolist">
                        TodoList
                    </Nav.Link>
                    <Nav.Link as={Button} className="navbarButton" href="/dashboard">
                        Dashboard
                    </Nav.Link>
                    <div className="collapse navbar-collapse justify-content-end">
                        <DropdownButton
                            variant="warning"
                            className="ml-auto"
                            drop="start"
                            title={activeAccount ? activeAccount.name : 'Unknown'}
                        >
                            <Dropdown.Item as="button" onClick={handleSwitchAccount}>
                                Switch account
                            </Dropdown.Item>
                            <Dropdown.Item as="button" onClick={handleLogoutPopup}>
                                Sign out using Popup
                            </Dropdown.Item>
                            <Dropdown.Item as="button" onClick={handleLogoutRedirect}>
                                Sign out using Redirect
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <div className="collapse navbar-collapse justify-content-end">
                        <DropdownButton variant="secondary" className="ml-auto" drop="start" title="Sign In">
                            <Dropdown.Item as="button" onClick={handleLogin}>
                                Sign in using Popup
                            </Dropdown.Item>
                            <Dropdown.Item as="button" onClick={handleLoginRedirect}>
                                Sign in using Redirect
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </UnauthenticatedTemplate>
            </Navbar>
            <AccountPicker show={showProfilePicker} handleSwitchAccount={handleSwitchAccount} />
        </>
    );
};
