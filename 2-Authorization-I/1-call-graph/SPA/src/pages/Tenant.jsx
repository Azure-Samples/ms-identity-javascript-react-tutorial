import { useEffect, useState } from "react";

import { MsalAuthenticationTemplate, useMsal, useAccount } from "@azure/msal-react";
import { InteractionRequiredAuthError, InteractionType } from "@azure/msal-browser";

import { loginRequest, protectedResources } from "../authConfig";
import { callApiWithToken } from "../fetch";
import { TenantData } from "../components/DataDisplay";

const TenantContent = () => {
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [tenantData, setTenantData] = useState(null);

    useEffect(() => {
        if (account && inProgress === "none") {
            instance.acquireTokenSilent({
                scopes: protectedResources.armTenants.scopes,
                account: account
            }).then((response) => {
                callApiWithToken(response.accessToken, protectedResources.armTenants.endpoint)
                    .then(response => setTenantData(response));
            }).catch(error => {
                console.log(error);
                if (error instanceof InteractionRequiredAuthError) {
                    if (account && inProgress === "none") {
                        instance.acquireTokenPopup({
                            scopes: protectedResources.armTenants.scopes,
                            account: account
                        }).then((response) => {
                            callApiWithToken(response.accessToken, protectedResources.armTenants.endpoint)
                                .then(response => setTenantData(response));
                        })
                    }
                }
            });
        }
    }, [account, inProgress, instance]);
  
    return (
        <>
            { tenantData ? <TenantData tenantData={tenantData} /> : null }
        </>
    );
};

export const Tenant = () => {
    const authRequest = {
        ...loginRequest
    };

    return (
        <MsalAuthenticationTemplate 
            interactionType={InteractionType.Popup} 
            authenticationRequest={authRequest}
        >
            <TenantContent />
        </MsalAuthenticationTemplate>
      )
};