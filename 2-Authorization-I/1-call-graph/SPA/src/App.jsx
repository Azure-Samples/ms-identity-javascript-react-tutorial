import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { MsalProvider } from "@azure/msal-react";

import { PageLayout } from "./components/PageLayout";
import { Mails } from "./pages/Mails";
import { Tenant } from "./pages/Tenant";
import { Profile } from "./pages/Profile";

import "./styles/App.css";

const Pages = () => {
  return (
    <Switch>
      <Route path="/profile">
        <Profile />
      </Route>
      <Route path="/mails">
        <Mails />
      </Route>
      <Route path="/tenant">
        <Tenant />
      </Route>
    </Switch>
  )
}

const App = ({ instance }) => {
  return (
    <Router>
      <MsalProvider instance={instance}>
        <PageLayout>
          <Pages />
        </PageLayout>
      </MsalProvider>
    </Router>
  );
}

export default App;