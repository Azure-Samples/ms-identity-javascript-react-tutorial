import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError, InteractionStatus } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../authConfig';
import moment from 'moment';

export const SessionManager = ({ children }) => {
    const { instance, inProgress } = useMsal();
    const account = instance.getActiveAccount();
    let delay;
    useEffect(() => {
        if (account) {
            let timeOut = localStorage.getItem(`ss.${msalConfig.auth.clientId}.${account.idTokenClaims.oid}`);
            if (timeOut) {
                let endDate = moment(new Date(timeOut * 1000));
                let startData = moment(new Date());
                let diffInMilliseconds = endDate.diff(startData);

                if (diffInMilliseconds <= 0) {
                    delay = 1;
                } else {
                    delay = diffInMilliseconds;
                }
            }
        }

        if (delay) {
            const id = setTimeout(() => {
                if (inProgress === InteractionStatus.None) {
                    instance
                        .ssoSilent({
                            ...loginRequest,
                            account: account,
                        })
                        .catch((error) => {
                            if (error instanceof InteractionRequiredAuthError) {
                                instance.loginRedirect({
                                    ...loginRequest,
                                    prompt: 'login',
                                });
                            }
                        });
                }
                return () => clearTimeout(id);
            }, delay);
        }
    }, [instance, account, delay]);

    return children;
};
