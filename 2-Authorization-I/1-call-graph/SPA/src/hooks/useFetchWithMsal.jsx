import { useState, useCallback } from 'react';
import { useMsalAuthentication, useMsal } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { ResponseType } from '@microsoft/microsoft-graph-client';
import { getGraphClient } from '../graph';
import { getClaimsFromStorage } from '../utils/storageUtils';
import { msalConfig } from '../authConfig';
import { handleClaimsChallenge } from '../fetch';

/**
 * Custom hook to call a Graph API using Graph SDK
 * @param {PopupRequest} request 
 * @param {String} endpoint 
 * @returns 
 */
const useFetchWithMsal = (request, endpoint) => {
    const [error, setError] = useState(null);
    const { instance } = useMsal();
    const account = instance.getActiveAccount();
    const resource = new URL(endpoint).hostname;

    const claims =
        account && getClaimsFromStorage(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${resource}`)
            ? window.atob(
                  getClaimsFromStorage(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}.${resource}`)
              )
            : undefined; // e.g {"access_token":{"xms_cc":{"values":["cp1"]}}}

    const {
        result,
        login,
        error: msalError,
    } = useMsalAuthentication(InteractionType.Popup, {
        ...request,
        redirectUri: '/redirect.html',
        account: account,
        claims: claims,
    });

    /**
     * Execute a fetch request with Graph SDK
     * @param {String} endpoint
     * @returns JSON response
     */
    const execute = async (endpoint) => {
        if (msalError) {
            setError(msalError);
            return;
        }
        if (result) {
            let accessToken = result.accessToken;

            try {
                const graphResponse = await getGraphClient(accessToken)
                    .api(endpoint)
                    .responseType(ResponseType.RAW)
                    .get();
                const responseHasClaimsChallenge = await handleClaimsChallenge(graphResponse);
                if (responseHasClaimsChallenge && responseHasClaimsChallenge.error === 'claims_challenge_occurred') {
                    throw responseHasClaimsChallenge.error;
                } else {
                    return responseHasClaimsChallenge;
                }
            } catch (error) {
                if (error === 'claims_challenge_occurred') {
                    login(InteractionType.Redirect, request);
                } else {
                    setError(error);
                }
            }
        }
    };

    return {
        error,
        result: result,
        execute: useCallback(execute, [result, msalError]),
    };
};

export default useFetchWithMsal;