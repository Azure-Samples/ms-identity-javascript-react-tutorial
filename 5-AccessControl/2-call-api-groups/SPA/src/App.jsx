import { Routes, Route } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';

import { RouteGuard } from './components/RouteGuard';
import { Home } from './pages/Home';
import { TodoList } from './pages/TodoList';
import { Dashboard } from './pages/Dashboard';

import './styles/App.css';
import { PageLayout } from './components/pageLayout';

import { securityGroups } from './authConfig';
import { Overage } from './pages/Overage';

const Pages = () => {
    return (
        <Routes>
            <Route path="/overage" element={<Overage />} />
            <Route
                path="/todolist"
                element={
                    <RouteGuard groups={[securityGroups.GroupMember, securityGroups.GroupAdmin]}>
                        <TodoList />
                    </RouteGuard>
                }
            />
            <Route
                path="/dashboard"
                element={
                    <RouteGuard exact path="/dashboard" groups={[securityGroups.GroupAdmin]}>
                        <Dashboard />
                    </RouteGuard>
                }
            />
            <Route path="/" element={<Home />} />
        </Routes>
    );
};

/**
 * msal-react is built on the React context API and all parts of your app that require authentication must be
 * wrapped in the MsalProvider component. You will first need to initialize an instance of PublicClientApplication
 * then pass this to MsalProvider as a prop. All components underneath MsalProvider will have access to the
 * PublicClientApplication instance via context as well as all hooks and components provided by msal-react. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
const App = ({ instance }) => {
    return (
        <MsalProvider instance={instance}>
            <PageLayout>
                <Pages />
            </PageLayout>
        </MsalProvider>
    );
};

export default App;
