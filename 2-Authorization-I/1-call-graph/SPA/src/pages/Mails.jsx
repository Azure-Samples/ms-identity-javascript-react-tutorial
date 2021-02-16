import { useEffect, useState } from "react";

import { MsalAuthenticationTemplate, useMsal, useAccount } from "@azure/msal-react";
import { InteractionRequiredAuthError, InteractionType } from "@azure/msal-browser";

import { loginRequest, protectedResources } from "../authConfig";
import { callApiWithToken } from "../fetch";
import { MailsData } from "../components/DataDisplay";

const MailsContent = () => {
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [mailsData, setMailsData] = useState(null);

    useEffect(() => {
        if (account && inProgress === "none") {
            instance.acquireTokenSilent({
                scopes: protectedResources.graphMessages.scopes,
                account: account
            }).then((response) => {
                callApiWithToken(response.accessToken, protectedResources.graphMessages.endpoint)
                    .then(response => setMailsData(response))
            }).catch(error => {
                console.log(error);
                if (error instanceof InteractionRequiredAuthError) {
                    if (account && inProgress === "none") {
                        instance.acquireTokenPopup({
                            scopes: protectedResources.graphMessages.scopes,
                            account
                        }).then((response) => {
                            callApiWithToken(response.accessToken, protectedResources.graphMessages.endpoint)
                                .then(response => setMailsData(response));
                        })
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
            interactionType={InteractionType.Popup} 
            authenticationRequest={authRequest}
        >
            <MailsContent />
        </MsalAuthenticationTemplate>
      )
};