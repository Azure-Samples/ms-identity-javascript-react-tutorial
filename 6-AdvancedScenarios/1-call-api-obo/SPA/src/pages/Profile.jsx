import { useEffect, useState } from 'react';

import { useMsalAuthentication, useMsal } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';

import { msalConfig, protectedResources } from '../authConfig';
import { getClaimsFromStorage } from '../utils/storageUtils';
import { callApiWithToken } from '../fetch';

import { ProfileData } from '../components/DataDisplay';

const ProfileContent = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance,
     * an array of all accounts currently signed in and an inProgress value
     * that tells you what msal is currently doing. For more, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */
    const { instance } = useMsal();
    const account = instance.getActiveAccount();
    const [graphData, setGraphData] = useState(null);
    const resource = new URL(protectedResources.apiHello.endpoint).hostname;

    const request = {
        scopes: protectedResources.apiHello.scopes,
        account: account,
        claims: account && getClaimsFromStorage(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${resource}`)
            ? window.atob(getClaimsFromStorage(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${resource}`))
            : undefined, // e.g {"access_token":{"xms_cc":{"values":["cp1"]}}}
    };

    const { acquireToken, result, error } = useMsalAuthentication(InteractionType.Popup, {
        ...request,
        redirectUri: '/redirect',
    });

    useEffect(() => {
        if (!!graphData) {
            return;
        }

        if (!!error) {
            // in case popup is blocked, use redirect instead
            if (error.errorCode === 'popup_window_error' || error.errorCode === 'empty_window_error') {
                acquireToken(InteractionType.Redirect, request);
            }

            console.log(error);
            return;
        }

        if (result) {
            callApiWithToken(result.accessToken, protectedResources.apiHello.endpoint, account)
                .then((response) => setGraphData(response))
                .catch((error) => {
                    if (error.message === 'claims_challenge_occurred') {
                        acquireToken(InteractionType.Redirect, request);
                    } else {
                        console.log(error);
                    }
                });
        }
        // eslint-disable-next-line
    }, [graphData, result, error, acquireToken]);

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return <>{graphData ? <ProfileData helloData={graphData} /> : null}</>;
};


export const Profile = () => {
    return <ProfileContent />;
};