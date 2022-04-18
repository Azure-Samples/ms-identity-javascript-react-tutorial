import React,{ useEffect  } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { MsalProvider, useMsal } from "@azure/msal-react";
import { Profile }  from './pages/Profile';
import { PageLayout } from './components/PageLayout';
import { Hello } from './pages/Hello';
import { callApiToGetSpaCode } from './fetch';

import "./styles/App.css";


 
const Pages = () => {
  return (
    
      <Routes>
        <Route path='/profile' element={<Profile />}/>
        <Route path='/hello' element={<Hello /> }/>
      </Routes>
  )
} 



export const App = ({ instance }) => {
  const search = useLocation().search;
  const getCode = new URLSearchParams(search).get('getCode');
  const { inProgress } = useMsal();

  useEffect(() => {

    if(getCode){
      callApiToGetSpaCode()
        .then((data) => {
        if(inProgress === "none"){
          let code = data.code;
          instance.acquireTokenByCode({code})
            .then((res) => {
              console.log(res, " res")
            }).catch((error) => {
              if(error instanceof InteractionRequiredAuthError){
                 if (inProgress === "none") {
                   instance.acquireTokenPopup({code})
                      .then((res) => {
                        console.log(res, " res")
                      }).catch((error) => {
                        console.log(error)
                      })
                 }
              }
          })
        }
      })
    }
  });

/**
 * msal-react is built on the React context API and all parts of your app that require authentication must be 
 * wrapped in the MsalProvider component. You will first need to initialize an instance of PublicClientApplication 
 * then pass this to MsalProvider as a prop. All components underneath MsalProvider will have access to the 
 * PublicClientApplication instance via context as well as all hooks and components provided by msal-react. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
  return(   
    <MsalProvider instance={instance}>
        <PageLayout>
          <Pages instance={instance} />
      </PageLayout>
    </MsalProvider>
  )
}

