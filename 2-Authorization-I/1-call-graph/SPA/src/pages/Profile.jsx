import { useEffect, useState } from 'react';
import { MsalAuthenticationTemplate } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';

import { loginRequest } from '../authConfig';
import { ProfileData } from '../components/DataDisplay';
import { protectedResources } from '../authConfig';

import useTokenAcquisition from '../hooks/useTokenAcquisition';

import { callApiWithToken } from '../fetch';

const ProfileContent = () => {
    const [response, error] = useTokenAcquisition(protectedResources.graphMe.scopes, InteractionType.Redirect);
    const [graphData, setGraphData] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            if (response && !graphData) {
                try {
                    let data = await callApiWithToken(response.accessToken, protectedResources.graphMe.endpoint,  protectedResources.graphMe.scopes)
                    
                    if (data && data.error) throw data.error;
                    setGraphData(data);
                } catch (error) {
                    console.log(error);                    
                }
            }
        };

        fetchData();
    }, [response]);

    return <>{graphData ? <ProfileData response={response} graphData={graphData} /> : null}</>;
};

/**
 * The `MsalAuthenticationTemplate` component will render its children if a user is authenticated
 * or attempt to sign a user in. Just provide it with the interaction type you would like to use
 * (redirect or popup) and optionally a [request object](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md)
 * to be passed to the login API, a component to display while authentication is in progress or a component to display if an error occurs. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
export const Profile = () => {
    const authRequest = {
        ...loginRequest,
    };

    return (
        <MsalAuthenticationTemplate
            interactionType={InteractionType.Popup}
            authenticationRequest={authRequest}
        >
            <ProfileContent />
        </MsalAuthenticationTemplate>
    );
};
