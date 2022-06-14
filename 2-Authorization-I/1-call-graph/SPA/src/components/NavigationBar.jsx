import { useState } from 'react';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { Nav, Navbar, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { loginRequest } from '../authConfig';
import { AccountPicker } from './AccountPicker';
import { msalConfig } from '../authConfig';
import styles from '../styles/Navigation.module.css';

export const NavigationBar = () => {
    const [showProfilePicker, setShowProfilePicker] = useState(false);
    const { instance } = useMsal();

    let activeAccount;

    if (instance) {
        activeAccount = instance.getActiveAccount();
    }

    const handleLogin = () => {
        instance.loginPopup(loginRequest).catch((error) => console.log(error));
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
            <Navbar bg="primary" variant="dark" className={styles.navbarStyle}>
                <a className="navbar-brand" href="/">
                    Microsoft identity platform
                </a>
                <AuthenticatedTemplate>
                    <Nav.Link className={styles.navbarButton} href="/profile">
                        Profile
                    </Nav.Link>
                    <Nav.Link as={Button} className={styles.navbarButton} href="/mails">
                        Mails
                    </Nav.Link>
                    <Nav.Link as={Button} className={styles.navbarButton} href="/tenant">
                        Tenant
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
                            <Dropdown.Item
                                as="button"
                                onClick={() =>
                                    instance.logoutPopup({
                                        postLogoutRedirectUri: msalConfig.postLogoutRedirectUri,
                                    })
                                }
                            >
                                Sign out using Popup
                            </Dropdown.Item>
                            <Dropdown.Item
                                as="button"
                                onClick={() =>
                                    instance.logoutRedirect({
                                        postLogoutRedirectUri: msalConfig.postLogoutRedirectUri,
                                    })
                                }
                            >
                                Sign out using Redirect
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <div className="collapse navbar-collapse justify-content-end">
                        <DropdownButton
                            variant="secondary"
                            className="justify-content-end ml-auto"
                            title="Sign In"
                            drop="start"
                        >
                            <Dropdown.Item as="button" onClick={handleLogin}>
                                Sign in using Popup
                            </Dropdown.Item>
                            <Dropdown.Item as="button" onClick={() => instance.loginRedirect(loginRequest)}>
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
