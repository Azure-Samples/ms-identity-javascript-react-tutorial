import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";

import { Profile } from "./pages/Profile";
import { PageLayout } from "./components/PageLayout";
import { Blank } from "./pages/Blank";
import { callApiToGetSpaCode } from "./fetch";

import "./styles/App.css";

const Pages = () => {
  return (
    <Routes>
      <Route path="/profile" element={<Profile />} />
      <Route path="/blank" element={<Blank />} />
    </Routes>
  );
};

export const App = ({ instance }) => {
  const search = useLocation().search;
  const getCode = new URLSearchParams(search).get("getCode");
  const { inProgress } = useMsal();
  const [data, setData] = useState(null);

  /**
   * We render the SPA code that was acquired server-side, and provide it to the acquireTokenByCode API
   * on the MSAL.js PublicClientApplication instance. The application should also render any account hints,
   * as they will be needed for any interactive requests to ensure the same user is used for both requests.
   * For more information about using loginHint and sid, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-core#2-login-the-user
   */
  useEffect(() => {
    const fetchData = async () => {
      let apiData;
      let token;

      if (getCode && !data) {
        apiData = await callApiToGetSpaCode();
        const { code, loginHint, sid } = apiData;

        if (inProgress === "none") {
          try {
            token = await instance.acquireTokenByCode({
              code, //Spa Auth code
            });

            setData(token);
          } catch (error) {
            if (error instanceof InteractionRequiredAuthError) {

              try {
                token = await instance.loginPopup({
                  loginHint, // Prefer loginHint claim over sid or preferredUsername
                });

                setData(token);
              } catch (error) {
                console.log(error);
              }
            }
          }
        }
      }
    };

    fetchData();
  }, [instance, inProgress]);

  /**
   * msal-react is built on the React context API and all parts of your app that require authentication must be
   * wrapped in the MsalProvider component. You will first need to initialize an instance of PublicClientApplication
   * then pass this to MsalProvider as a prop. All components underneath MsalProvider will have access to the
   * PublicClientApplication instance via context as well as all hooks and components provided by msal-react. For more, visit:
   * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
   */
  return (
    <MsalProvider instance={instance}>
      <PageLayout>
        <Pages instance={instance} />
      </PageLayout>
    </MsalProvider>
  );
};
