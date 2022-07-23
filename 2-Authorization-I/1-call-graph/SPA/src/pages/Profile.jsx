import { useEffect, useState } from 'react';
import { useMsal, useMsalAuthentication } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';

import { ProfileData } from '../components/DataDisplay';
import { protectedResources, msalConfig } from '../authConfig';
import { getClaimsFronStrorage } from '../utils/storageUtils';
import { fetchData } from '../fetch';

export const Profile = () => {
    const { instance } = useMsal();
    const account = instance.getActiveAccount();
    const [graphData, setGraphData] = useState(null);

    const request = {
        scopes: protectedResources.graphMe.scopes,
        account: account,
        claims: account && getClaimsFronStrorage(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`)
            ? window.atob(getClaimsFronStrorage(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`))
            : undefined, // e.g {"access_token":{"xms_cc":{"values":["cp1"]}}}
    };

    const { login, result, error } = useMsalAuthentication(InteractionType.Popup, request);

    useEffect(() => {
        if (!!graphData) {
            return;
        }

        if (!!error) {
            // in case popup is blocked, use redirect instead
            if (error.errorCode === "popup_window_error" || error.errorCode === "empty_window_error") {
                login(InteractionType.Redirect, request);
            }

            console.log(error);
            return;
        }

        if (result) {
            fetchData(result.accessToken, protectedResources.graphMe.endpoint)
                .then((response) => {
                    if (response && response.error) throw response.error;
                    setGraphData(response);
                }).catch((error) => {
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

    return (
        <>
            {graphData ? <ProfileData response={result} graphData={graphData} /> : null}
        </>
    );
};
