import { useEffect, useState } from 'react';

import { useMsalAuthentication, useMsal } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';

import { protectedResources } from '../authConfig';
import { callApiWithToken } from '../fetch';
import { ProfileData } from '../components/DataDisplay';

const ProfileContent = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance,
     * an array of all accounts currently signed in and an inProgress value
     * that tells you what msal is currently doing. For more, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */
    const { instance, } = useMsal();
    const account = instance.getActiveAccount();
    const [graphData, setGraphData] = useState(null);
    const request = {
        scopes: protectedResources.apiHello.scopes,
        account: account,
    };

    const { login, result, error } = useMsalAuthentication(InteractionType.Popup, {
        ...request,
        redirectUri: '/redirect.html',
    });

    useEffect(() => {
        if (!!graphData) {
            return;
        }

        if (!!error) {
            // in case popup is blocked, use redirect instead
            if (error.errorCode === 'popup_window_error' || error.errorCode === 'empty_window_error') {
                login(InteractionType.Redirect, request);
            }

            console.log(error);
            return;
        }

        if (result) {
            console.log(result)
            callApiWithToken(result.accessToken, protectedResources.apiHello.endpoint)
                .then((response) => {
                    console.log(response, "response")
                    setGraphData(response)
                })
                .catch((error) => {
                    console.log("in error")
                    console.log(error)
                })

        }
        // eslint-disable-next-line
    }, [graphData, result, error, login]);

    return <>{graphData ? <ProfileData helloData={graphData} /> : null}</>;
};


export const Profile = () => {
    return <ProfileContent />;
};