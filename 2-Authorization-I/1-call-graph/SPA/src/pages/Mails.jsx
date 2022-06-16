import { useEffect, useState } from 'react';
import { MsalAuthenticationTemplate } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { loginRequest } from '../authConfig';
import { MailsData } from '../components/DataDisplay';
import { protectedResources } from '../authConfig';
import useTokenAcquisition from '../customHooks/useTokenAcquisition';
import { getGraphClient } from '../graph';

const MailsContent = () => {
    const [response] = useTokenAcquisition(protectedResources.graphMessages.scopes);
    const [mailsData, setMailsData] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            if (response && !mailsData) {
                try {
                    const graphClient = getGraphClient(response.accessToken);
                    let data = await graphClient.api(protectedResources.graphMessages.endpoint).get();
                    setMailsData(data);
                } catch (error) {
                    console.log(error);
                }
            }
        };

        fetchData();
    }, [response]);

    return <>{mailsData ? <MailsData mailsData={mailsData} /> : null}</>;
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
        ...loginRequest,
    };

    return (
        <MsalAuthenticationTemplate interactionType={InteractionType.Redirect} authenticationRequest={authRequest}>
            <MailsContent />
        </MsalAuthenticationTemplate>
    );
};
