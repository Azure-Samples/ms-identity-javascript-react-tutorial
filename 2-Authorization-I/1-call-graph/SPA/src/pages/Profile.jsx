import { useEffect, useState } from 'react';
import { useMsal, useMsalAuthentication } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';

import { ProfileData } from '../components/DataDisplay';
import { protectedResources, msalConfig } from '../authConfig';
import { getClaimsFromStorage } from '../utils/storageUtils';
import { handleClaimsChallenge } from '../fetch';
import { getGraphClient } from '../graph';
import { ResponseType } from '@microsoft/microsoft-graph-client';

export const Profile = () => {
    const { instance } = useMsal();
    const account = instance.getActiveAccount();
    const [graphData, setGraphData] = useState(null);
    const resource = new URL(protectedResources.graphMe.endpoint).hostname;
    const claims =
        account && getClaimsFromStorage(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${resource}`)
            ? window.atob(
                  getClaimsFromStorage(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${resource}`)
              )
            : undefined; // e.g {"access_token":{"xms_cc":{"values":["cp1"]}}}
    const request = {
        scopes: protectedResources.graphMe.scopes,
        account: account,
        claims: claims,
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
           let accessToken = result.accessToken;
            getGraphClient(accessToken)
                .api('/me')
                .responseType(ResponseType.RAW)
                .get()
                .then((response) => {
                    return handleClaimsChallenge(response, protectedResources.graphMe.endpoint);
                })
                .then((response) => {
                    if (response && response.error === 'claims_challenge_occurred') throw response.error;
                    setGraphData(response);
                })
                .catch((error) => {
                    if (error === 'claims_challenge_occurred') {
                        login(InteractionType.Redirect, request);
                    }
                    console.log(error);
                });
        }
    }, [graphData, result, error, login]);

    if (error) {
        return <div>Error: {error.message}</div>;
    }
    return <>{graphData ? <ProfileData response={result} graphData={graphData} /> : null}</>;
};
