import { useEffect, useState } from "react";

import { MsalAuthenticationTemplate, useMsal, useAccount } from "@azure/msal-react";
import { InteractionRequiredAuthError, InteractionType } from "@azure/msal-browser";

import { loginRequest, protectedResources } from "../authConfig";
import { callApiWithToken } from "../fetch";
import { MailsData } from "../components/DataDisplay";

const MailsContent = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance, 
     * an array of all accounts currently signed in and an inProgress value 
     * that tells you what msal is currently doing.
     */
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [mailsData, setMailsData] = useState(null);

    useEffect(() => {
        if (account && inProgress === "none" && !mailsData) {
            instance.acquireTokenSilent({
                scopes: protectedResources.graphMessages.scopes,
                account: account
            }).then((response) => {     
                callApiWithToken(response.accessToken, protectedResources.graphMessages.endpoint)
                    .then(response => setMailsData(response));
            }).catch(error => {
                // in case if silent token acquisition fails, fallback to an interactive method
                if (error instanceof InteractionRequiredAuthError) {
                    if (account && inProgress === "none") {
                        instance.acquireTokenPopup({
                            scopes: protectedResources.graphMessages.scopes,
                        }).then((response) => {
                            callApiWithToken(response.accessToken, protectedResources.graphMessages.endpoint)
                                .then(response => setMailsData(response));
                        }).catch(error => console.log(error));
                    }
                }
            });
        }
    }, [account, inProgress, instance]);
  
    return (
        <>
            { mailsData ? <MailsData mailsData={mailsData} /> : null }
        </>
    );
};

export const Mails = () => {
    const authRequest = {
        ...loginRequest
    };

    return (
        <MsalAuthenticationTemplate 
            interactionType={InteractionType.Redirect} 
            authenticationRequest={authRequest}
        >
            <MailsContent />
        </MsalAuthenticationTemplate>
      )
};