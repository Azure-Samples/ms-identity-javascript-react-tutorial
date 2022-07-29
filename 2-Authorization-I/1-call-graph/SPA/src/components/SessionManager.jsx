import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError, InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from '../authConfig';
import moment from 'moment';

export const SessionManager = ({ children }) => {
    const { instance, inProgress } = useMsal();
    const account = instance.getActiveAccount();
    useEffect(() => {
        if (account && inProgress === InteractionStatus.None) {
            let endDate = moment(new Date(account.idTokenClaims.exp * 1000));
            let startData = moment(new Date());
            let diffInMilliseconds = endDate.diff(startData);

            if (diffInMilliseconds <= 0) {
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
        }
    }, [instance, account]);

    return children;
};
