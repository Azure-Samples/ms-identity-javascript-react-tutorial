import { useEffect, useState } from "react";

import { MsalAuthenticationTemplate, useMsal, useAccount } from "@azure/msal-react";
import { InteractionType, EventType } from "@azure/msal-browser";

import { loginRequest, protectedResources } from "../authConfig";
import { callApiWithToken } from "../fetch";
import { MailsData } from "../components/DataDisplay";

import Button from "react-bootstrap/Button";

const MailsContent = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance, 
     * an array of all accounts currently signed in and an inProgress value 
     * that tells you what msal is currently doing. For more, visit: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [mailsData, setMailsData] = useState(null);

    useEffect(() => {

        /**
         * In order to get the direct response from calling acquireTokenRedirect() API, register an event
         * and listen for ACQUIRE_TOKEN_SUCCESS. Make sure to remove the event once component unmounts. For more, 
         * visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/events.md
         */

        // This will be run on component mount
        const callbackId = instance.addEventCallback((message) => {
            // This will be run every time an event is emitted after registering this callback
            if (message.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
                const response = message.payload;    
                // Do something with the response
                callApiWithToken(response.accessToken, protectedResources.graphMessages.endpoint)
                    .then(response => setMailsData(response));
            }
        });
        return () => {
            // This will be run on component unmount
            if (callbackId) {
                instance.removeEventCallback(callbackId);
            }
        }
    }, [account, inProgress, instance]);

    const requestMailData = () => {
        instance.acquireTokenRedirect({
            scopes: protectedResources.graphMessages.scopes,
        }).catch(error => console.log(error))
    }
  
    return (
        <>
            { mailsData ? 
                <MailsData mailsData={mailsData} /> 
                : 
                <Button variant="secondary" onClick={requestMailData}>Request Mail Data</Button>
            }
        </>
    );
};

/**
 * The `MsalAuthenticationTemplate` component will render its children if a user is authenticated 
 * or attempt to sign a user in. Just provide it with the interaction type you would like to use 
 * (redirect or popup) and optionally a [request object](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md)
 * to be passed to the login API, a component to display while authentication is in progress or a component to display if an error occurs. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
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