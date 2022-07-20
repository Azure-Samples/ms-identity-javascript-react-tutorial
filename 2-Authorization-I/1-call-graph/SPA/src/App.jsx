import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';

import { PageLayout } from './components/PageLayout';
import { Profile } from './pages/Profile';
import { Redirect } from './pages/Redirect';
import { Contacts } from './pages/Contacts';
import { Home } from './pages/Home';

import { CustomNavigationClient } from './utils/NavigationClient';

import './styles/App.css';

const Pages = () => {
    return (
        <Routes>
            <Route path="/profile" element={<Profile />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/redirect" element={<Redirect />} />
            <Route path="/" element={<Home />} />
        </Routes>
    );
};

const ClientSideNavigation = ({ instance, children }) => {
    const navigate = useNavigate();
    const navigationClient = new CustomNavigationClient(navigate);
    instance.setNavigationClient(navigationClient);

    // react-router-dom v6 doesn't allow navigation on the first render - delay rendering of MsalProvider to get around this limitation
    const [firstRender, setFirstRender] = useState(true);
    useEffect(() => {
        setFirstRender(false);
    }, []);

    if (firstRender) {
        return null;
    }

    return children;
};

/**
 * msal-react is built on the React context API and all parts of your app that require authentication must be
 * wrapped in the MsalProvider component. You will first need to initialize an instance of PublicClientApplication
 * then pass this to MsalProvider as a prop. All components underneath MsalProvider will have access to the
 * PublicClientApplication instance via context as well as all hooks and components provided by msal-react. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
export const App = ({ instance }) => {
    return (
        <ClientSideNavigation instance={instance}>
            <MsalProvider instance={instance}>
                <PageLayout>
                    <Pages />
                </PageLayout>
            </MsalProvider>
        </ClientSideNavigation>
    );
};
