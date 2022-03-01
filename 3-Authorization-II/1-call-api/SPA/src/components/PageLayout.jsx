import { useEffect } from "react";
import { NavigationBar } from "./NavigationBar";
import { loginRequest } from "../authConfig";
import { InteractionType, InteractionRequiredAuthError, BrowserAuthError } from '@azure/msal-browser'
import { AuthenticatedTemplate, useMsalAuthentication } from "@azure/msal-react";

export const PageLayout = (props) => {
    

    /**
     * useMsalAuthentication hook will initiate a login if a user is not already signed in. 
     * Passing the "Silent" interaction type will call ssoSilent,
     * and if the user is not signed in, it will open a popup interaction to sign in the user.
     * For more information, please visit https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md#usemsalauthentication-hook
     */
    const { login, error } = useMsalAuthentication(InteractionType.Silent, loginRequest);
     useEffect(() => {
          if(error && error instanceof InteractionRequiredAuthError){
              login(InteractionType.Popup, loginRequest)
                .catch((err) => {
                    if(err instanceof BrowserAuthError && 
                     (err.errorCode === "popup_window_error" || err.errorCode === "empty_window_error")){
                        login(InteractionType.Redirect, loginRequest)
                    }
                })
          }
          
     },[error])


     /**
     * Most applications will need to conditionally render certain components based on whether a user is signed in or not. 
     * msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will 
     * only render their children if a user is authenticated or unauthenticated, respectively.
     */

    return (
        <>
            <NavigationBar />
            <br />
            <h5><center>Welcome to the Microsoft Authentication Library For React Tutorial</center></h5>
            <br />
            {props.children}
            <br />
            <AuthenticatedTemplate>
                <footer>
                    <center>How did we do? 
                        <a href="https://forms.office.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR73pcsbpbxNJuZCMKN0lURpUMlRHSkc5U1NLUkxFNEtVN0dEOTFNQkdTWiQlQCN0PWcu" target="_blank"> Share your experience!</a>
                    </center>
                </footer>
            </AuthenticatedTemplate>
        </>
    );
};