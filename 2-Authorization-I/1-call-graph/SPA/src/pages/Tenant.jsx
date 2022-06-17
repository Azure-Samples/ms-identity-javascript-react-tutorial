import { useState, useEffect } from 'react';
import { MsalAuthenticationTemplate } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';

import { loginRequest, protectedResources } from '../authConfig';
import { callApiWithToken } from '../fetch';
import { TenantData } from '../components/DataDisplay';

import useTokenAcquisition from '../hooks/useTokenAcquisition';

const TenantContent = () => {
    const [tenantData, setTenantData] = useState(null);
    const [response] = useTokenAcquisition(protectedResources.armTenants.scopes);

    useEffect(() => {
        const fetchData = async () => {
            if (response && !tenantData) {
                try {
                    let data = await callApiWithToken(response.accessToken, protectedResources.armTenants.endpoint);
                    setTenantData(data);
                } catch (error) {
                    console.log(error);
                }
            }
        };

        fetchData();
    }, [response]);

    return <>{tenantData ? <TenantData tenantData={tenantData} /> : null}</>;
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
        ...loginRequest,
    };

    return (
        <MsalAuthenticationTemplate
            interactionType={InteractionType.Redirect}
            authenticationRequest={authRequest}
        >
            <TenantContent />
        </MsalAuthenticationTemplate>
    );
};
