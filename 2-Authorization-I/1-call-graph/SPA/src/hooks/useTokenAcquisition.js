import { useEffect, useState } from 'react';
import { InteractionRequiredAuthError, InteractionStatus, InteractionType } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { msalConfig } from '../authConfig';

/**
 * A custom hook for acquiring tokens using MSAL
 * @param {Array} scopes
 * @param {String} interactionType
 * @returns response object which contains an access token
 */
const useTokenAcquisition = (scopes, interactionType) => {
    /**
     * useMsal is a hook that returns the PublicClientApplication instance,
     * an array of all accounts currently signed in and an inProgress value
     * that tells you what msal is currently doing. For more, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */

    const { instance, inProgress } = useMsal();
    const account = instance.getActiveAccount();
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getToken = async () => {
            let tokenResponse;
            if (account && inProgress === InteractionStatus.None && !response && !error) {
                try {
                    tokenResponse = await instance.acquireTokenSilent({
                        scopes: scopes,
                        account: account,
                        claims: localStorage.getItem(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`)
                            ? window.atob(
                                  localStorage.getItem(`cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`)
                              )
                            : null
                    });
                    setResponse(tokenResponse);
                } catch (error) {
                    if (error instanceof InteractionRequiredAuthError) {
                        try {
                            switch (interactionType) {
                                case InteractionType.Popup:
                                    tokenResponse = await instance.acquireTokenPopup({
                                        scopes: scopes,
                                        account: account,
                                        claims: localStorage.getItem(
                                            `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`
                                        )
                                            ? window.atob(
                                                  localStorage.getItem(
                                                      `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`
                                                  )
                                              )
                                            : null
                                    });
                                    break;

                                case InteractionType.Redirect:
                                default:
                                    tokenResponse = await instance.acquireTokenRedirect({
                                        scopes: scopes,
                                        account: account,
                                        claims: localStorage.getItem(
                                            `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`
                                        )
                                            ? window.atob(
                                                  localStorage.getItem(
                                                      `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`
                                                  )
                                              )
                                            : null
                                    });
                                    break;
                            }
                            setResponse(tokenResponse);
                        } catch (error) {
                            if (error.errorCode === 'popup_window_error') {
                                tokenResponse = await instance.acquireTokenRedirect({
                                    scopes: scopes,
                                    account: account,
                                    claims: localStorage.getItem(
                                        `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`
                                    )
                                        ? window.atob(
                                              localStorage.getItem(
                                                  `cc.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`
                                              )
                                          )
                                        : null
                                });
                                setResponse(tokenResponse);
                            } else {
                                setError(error);
                            }
                        }
                    }
                }
            }
        };
        getToken();
    }, [account, inProgress, instance]);

    return [response, error];
};

export default useTokenAcquisition;
