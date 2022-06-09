import { useEffect, useState } from "react";

import { MsalAuthenticationTemplate, useMsal, useAccount } from "@azure/msal-react";
import { InteractionType, EventType } from "@azure/msal-browser";

import { loginRequest, protectedResources } from "../authConfig";
import { callApiWithToken } from "../fetch";
import { TenantData } from "../components/DataDisplay";

import Button from "react-bootstrap/Button";

const TenantContent = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance, 
     * an array of all accounts currently signed in and an inProgress value 
     * that tells you what msal is currently doing. For more, visit: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [tenantData, setTenantData] = useState(null);

    const requestTenantData = () => {
        if (inProgress === "none") {
          instance
            .acquireTokenPopup({
              scopes: protectedResources.armTenants.scopes,
              account: account,
            })
            .then((response) => {
              console.log(response.accessToken);
              callApiWithToken(
                response.accessToken,
                protectedResources.armTenants.endpoint
              ).then((response) => setTenantData(response));
            })
            .catch((error) => console.log(error));
        }
    }

    return (
        <>
            { tenantData ?

                <TenantData tenantData={tenantData} />
                :
                <div className="row justify-content-center">
                    <Button variant="secondary" onClick={requestTenantData}>Request Tenant Data</Button>
                </div>
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
export const Tenant = () => {
    const authRequest = {
        ...loginRequest
    };

    return (
        <MsalAuthenticationTemplate
            interactionType={InteractionType.Redirect}
            authenticationRequest={authRequest}
        >
            <TenantContent />
        </MsalAuthenticationTemplate>
    )
};