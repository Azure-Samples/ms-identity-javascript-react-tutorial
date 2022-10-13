import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';

import { Nav, Navbar, Dropdown, DropdownButton } from 'react-bootstrap';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';

import { loginRequest } from '../authConfig';
import { clearGroupsInStorage } from '../utils/storageUtils';

export const NavigationBar = () => {
    const { instance } = useMsal();
    let activeAccount = instance.getActiveAccount();

    const handleLoginPopup = () => {
        instance
            .loginPopup({
                ...loginRequest,
                redirectUri: '/redirect.html',
            })
            .catch((error) => console.log(error));
    };

    const handleLoginRedirect = () => {
        /**
         * When using popup and silent APIs, we recommend setting the redirectUri to a blank page or a page
         * that does not implement MSAL. Keep in mind that all redirect routes must be registered with the application
         * For more information, please follow this link: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/login-user.md#redirecturi-considerations
         */

        instance.loginRedirect(loginRequest).catch((error) => console.log(error));
    };

    const handleLogoutPopup = () => {
        clearGroupsInStorage(activeAccount);
        
        instance.logoutPopup({
            mainWindowRedirectUri: '/', // redirects the top level app after logout
            account: activeAccount,
        });
    };

    const handleLogoutRedirect = () => {
        clearGroupsInStorage(activeAccount);

        instance.logoutRedirect({
            account: activeAccount,
        });
    };
    return (
        <>
            <Navbar bg="primary" variant="dark" className='navbarButton'>
                <a className="navbar-brand" href="/">
                    {' '}
                    Microsoft identity platform
                </a>
                <AuthenticatedTemplate>
                    <Nav.Link className="navbarButton" href="/todolist">
                        TodoList
                    </Nav.Link>
                    <Nav.Link className="navbarButton" href="/dashboard">
                        Dashboard
                    </Nav.Link>
                    <div className="collapse navbar-collapse justify-content-end">
                        <DropdownButton
                            variant="warning"
                            drop="start"
                            title={activeAccount ? activeAccount.name : 'Sign Out'}
                        >
                            <DropdownItem as="button" onClick={handleLogoutPopup}>
                                Sign out using Popup
                            </DropdownItem>
                            <DropdownItem as="button" onClick={handleLogoutRedirect}>
                                Sign out using Redirect
                            </DropdownItem>
                        </DropdownButton>
                    </div>
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <div className="collapse navbar-collapse justify-content-end">
                        <DropdownButton variant="secondary" className="ml-auto" drop="start" title="Sign In">
                            <Dropdown.Item as="button" onClick={handleLoginPopup}>
                                Sign in using Popup
                            </Dropdown.Item>
                            <Dropdown.Item as="button" onClick={handleLoginRedirect}>
                                Sign in using Redirect
                            </Dropdown.Item>
                        </DropdownButton>
                    </div>
                </UnauthenticatedTemplate>
            </Navbar>
        </>
    );
};
