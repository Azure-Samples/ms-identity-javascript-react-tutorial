import React, { useState, useEffect } from 'react';
import { useMsal, MsalAuthenticationTemplate } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { useLocation } from 'react-router-dom';

import { loginRequest, appRoles } from '../authConfig';

/**
 * The `MsalAuthenticationTemplate` component will render its children if a user is authenticated
 * or attempt to sign a user in. Just provide it with the interaction type you would like to use
 * (redirect or popup) and optionally a request object to be passed to the login API, a component to display while
 * authentication is in progress or a component to display if an error occurs. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
export const RouteGuard = ({ ...props }) => {
    const location = useLocation();
    const { instance } = useMsal();
    const [isAuthorized, setIsAuthorized] = useState(false);

    const currentAccount = instance.getActiveAccount();

    const authRequest = {
        ...loginRequest,
    };

    const onLoad = async () => {
        if (currentAccount && currentAccount.idTokenClaims['roles']) {

            let intersection = props.roles
                .filter((role) => currentAccount.idTokenClaims['roles'].includes(role));

            if (intersection.length > 0) {
                setIsAuthorized(true);
            }
        }
    };

    useEffect(() => {
        onLoad();
    }, [instance, currentAccount]);

    return (
        <MsalAuthenticationTemplate 
            interactionType={InteractionType.Redirect} 
            authenticationRequest={authRequest}
        >

            {isAuthorized ? (
                <div>{props.children}</div>
            ) : (
                <div className="data-area-div">
                    <h3>
                        You are unauthorized to view this content. Please assign yourself to the
                        {location.pathname === '/todolist' ? (
                            <span>
                                {' '}
                                role {appRoles.TaskUser} or {appRoles.TaskAdmin}
                            </span>
                        ) : (
                            <span> role {appRoles.TaskAdmin} </span>
                        )}
                    </h3>
                </div>
            )}

        </MsalAuthenticationTemplate>
    );
};
