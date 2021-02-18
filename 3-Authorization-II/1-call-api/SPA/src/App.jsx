import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { MsalProvider } from "@azure/msal-react";

import { PageLayout } from "./components/PageLayout";
import { Profile } from "./pages/Profile";
import { Hello } from "./pages/Hello";

import "./styles/App.css";

const Pages = () => {
  return (
    <Switch>
      <Route path="/profile">
        <Profile />
      </Route>
      <Route path="/hello">
        <Hello />
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