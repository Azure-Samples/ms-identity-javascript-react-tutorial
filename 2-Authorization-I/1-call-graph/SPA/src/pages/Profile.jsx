import { useEffect, useState } from 'react';
import { useMsal, useMsalAuthentication } from '@azure/msal-react';
import { InteractionType, BrowserAuthError } from '@azure/msal-browser';
import { ProfileData } from '../components/DataDisplay';
import { protectedResources, msalConfig } from '../authConfig';
import { callApiWithToken } from '../fetch';

const ProfileContent = () => {
    const { instance } = useMsal();
    const account = instance.getActiveAccount();
    const [graphData, setGraphData] = useState(null);
    const request = {
        scopes: protectedResources.graphMe.scopes,
        account: account,
        claims:
            account && localStorage.getItem(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`)
                ? window.atob(localStorage.getItem(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`))
                : null, // e.g {"access_token":{"xms_cc":{"values":["cp1"]}}}
    };
    const { login, result, error } = useMsalAuthentication(InteractionType.Popup, request);

    useEffect(() => {
        const fetchData = async () => {
            if (result && !graphData) {
                try {
                    let data = await callApiWithToken(
                        result.accessToken,
                        protectedResources.graphMe.endpoint,
                        protectedResources.graphMe.scopes
                    );

                    if (data && data.error) throw data.error;
                    setGraphData(data);
                } catch (error) {
                    if (error instanceof BrowserAuthError) {
                        login(InteractionType.Redirect, request);
                    }
                }
            }
        };

        fetchData();
    }, [result, error]);

    return <>{graphData ? <ProfileData response={result} graphData={graphData} /> : null}</>;
};

/**
 * The `MsalAuthenticationTemplate` component will render its children if a user is authenticated
 * or attempt to sign a user in. Just provide it with the interaction type you would like to use
 * (redirect or popup) and optionally a [request object](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md)
 * to be passed to the login API, a component to display while authentication is in progress or a component to display if an error occurs. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
export const Profile = () => {
    return <ProfileContent />;
};
