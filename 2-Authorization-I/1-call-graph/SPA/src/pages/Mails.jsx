import { useEffect, useState } from "react";

import { MsalAuthenticationTemplate, useMsal, useAccount } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";

import { loginRequest } from "../authConfig";
import { MailsData } from "../components/DataDisplay";
import { getGraphClient } from "../graph";
import { protectedResources } from "../authConfig";

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
        if (account && inProgress === "none" && !mailsData) {
            getGraphClient({
                account: instance.getActiveAccount(), 
                scopes: protectedResources.graphMessages.scopes, 
                interactionType: InteractionType.Redirect
            }).api("/me/messages").get()
                    .then((response) => setMailsData(response))
                    .catch((error) => console.log(error));
        }
    }, [account, inProgress, instance]);

    return (
        <>
            { mailsData ? <MailsData mailsData={mailsData} /> : null }
        </>
    );
};

/**
 * The `MsalAuthenticationTemplate` component will render its children if a user is authenticated 
 * or attempt to sign a user in. Just provide it with the interaction type you would like to use 
 * (redirect or popup) and optionally a request object to be passed to the login API, a component to display while 
 * authentication is in progress or a component to display if an error occurs. For more, visit:
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