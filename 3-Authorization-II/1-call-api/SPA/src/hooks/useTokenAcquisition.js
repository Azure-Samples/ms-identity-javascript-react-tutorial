import { useEffect, useState } from 'react';
import { InteractionRequiredAuthError, InteractionStatus, InteractionType } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';

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

    useEffect(() => {
        const getToken = async () => {
            let token;
            if (account && inProgress === InteractionStatus.None && !response) {
                try {
                    token = await instance.acquireTokenSilent({
                        scopes: scopes,
                        account: account,
                    });

                    setResponse(token);
                } catch (error) {
                    if (error instanceof InteractionRequiredAuthError) {
                        try {
                            switch (interactionType) {
                                case InteractionType.Popup:
                                    token = await instance.acquireTokenPopup({
                                        scopes: scopes,
                                        account: account,
                                    });
                                    break;
                                case InteractionType.Redirect:
                                    token = await instance.acquireTokenRedirect({
                                        scopes: scopes,
                                        account: account,
                                    });
                                    break;
                                default:
                                    interactionType = InteractionType.Popup;
                            }
                            setResponse(token);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            }
        };
        getToken();
    }, [account, inProgress, instance]);

    return [response];
};

export default useTokenAcquisition;
