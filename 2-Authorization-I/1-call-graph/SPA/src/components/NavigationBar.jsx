import { useState } from 'react';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { Nav, Navbar, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { loginRequest } from '../authConfig';
import { AccountPicker } from './AccountPicker';
import { msalConfig } from '../authConfig';
import { clearStorage } from '../utils/storageUtils';

export const NavigationBar = () => {
    const [showProfilePicker, setShowProfilePicker] = useState(false);
    const { instance } = useMsal();

    let activeAccount;

    if (instance) {
        activeAccount = instance.getActiveAccount();
    }

    const handleLoginRedirect = () => {
        instance.loginRedirect(loginRequest);
    };

    const handleSwitchAccount = () => {
        setShowProfilePicker(!showProfilePicker);
    };

    const handleLogoutRedirect = () => {
        let account = instance.getActiveAccount();
        clearStorage(account);
        instance.logoutRedirect({
            postLogoutRedirectUri: msalConfig.postLogoutRedirectUri,
            account: instance.getActiveAccount(),
        });
    };

    const handleLogoutPopup = () => {
        let account = instance.getActiveAccount();
        clearStorage(account);
        instance.logoutPopup({
            postLogoutRedirectUri: msalConfig.postLogoutRedirectUri, // redirects the Popup window
            mainWindowRedirectUri: '/', // redirects the top level app after logout
            account: instance.getActiveAccount(),
        });
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
                    <Nav.Link className="navbarButton" href="/profile">
                        Profile
                    </Nav.Link>
                    <Nav.Link as={Button} className="navbarButton" href="/contacts">
                        Contacts
                    </Nav.Link>
                    <div className="collapse navbar-collapse justify-content-end">
                        <DropdownButton
                            variant="warning"
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
                        <Button onClick={handleLoginRedirect} variant="secondary">
                            Sign in
                        </Button>
                    </div>
                </UnauthenticatedTemplate>
            </Navbar>
            <AccountPicker show={showProfilePicker} handleSwitchAccount={handleSwitchAccount} />
        </>
    );
};
