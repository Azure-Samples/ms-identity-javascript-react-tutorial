import { useEffect, useState } from 'react';

import { useMsalAuthentication, useMsal } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';

import { protectedResources } from '../authConfig';
import { callApiWithToken } from '../fetch';
import { ProfileData } from '../components/DataDisplay';
import { addClaimsToStorage, getClaimsFromStorage } from '../utils/storageUtils';
import { msalConfig } from '../authConfig';

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
                ?  window.atob( getClaimsFromStorage(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${resource}`))
                : undefined, // e.g {"access_token":{"xms_cc":{"values":["cp1"]}}}
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
            callApiWithToken(result.accessToken, protectedResources.apiHello.endpoint)
                .then((response) => {
                    if (
                        response &&
                        (response.name === 'InteractionRequiredAuthError' ||
                            response.errorMessage === 'claims_challenge_occurred')
                    ) {
                        throw response;
                    }
                    setGraphData(response);
                })
                .catch((error) => {
                    if (
                        error &&
                        error.errorMessage.includes('50076') &&
                        error.name === 'InteractionRequiredAuthError'
                    ) {
                        /**
                         * This method stores the claims to the session storage in the browser to be used when acquiring a token.
                         * To ensure that we are fetching the correct claim from the storage, we are using the clientId
                         * of the application and oid (user’s object id) as the key identifier of the claim with schema
                         * cc.<clientId>.<oid>.<resource.hostname>
                         */
                        addClaimsToStorage(
                            window.btoa(error.claims),
                            `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${resource}`
                        );
                        login(InteractionType.Redirect, request);
                    } else if (error.errorMessage === 'claims_challenge_occurred') {
                        addClaimsToStorage(
                            error.payload,
                            `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${resource}`
                        );
                        login(InteractionType.Redirect, request);
                    } else {
                        console.log(error);
                    }
                });
        }
        // eslint-disable-next-line
    }, [graphData, result, error, login]);

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return <>{graphData ? <ProfileData helloData={graphData} /> : null}</>;
};


export const Profile = () => {
    return <ProfileContent />;
};