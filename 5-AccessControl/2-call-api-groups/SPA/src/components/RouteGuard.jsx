import { useState, useEffect } from 'react';
import { useMsal, MsalAuthenticationTemplate } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { loginRequest } from '../authConfig';
import { useLocation, Navigate } from 'react-router-dom';

export const RouteGuard = ({ Component, ...props }) => {
    const location = useLocation();

    const { instance } = useMsal();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isOveraged, setIsOveraged] = useState(false);

    const authRequest = {
        ...loginRequest,
    };

    const onLoad = async () => {
        if (location.state && location.state.groupsData) {
            let intersection = props.groups.filter((group) => location.state.groupsData.includes(group));
            if (intersection.length > 0) {
                setIsAuthorized(true);
            }
        } else {
            const currentAccount = instance.getActiveAccount();
            if (currentAccount && currentAccount.idTokenClaims['groups']) {
                let intersection = props.groups.filter((group) =>
                    currentAccount.idTokenClaims['groups'].includes(group)
                );

                if (intersection.length > 0) {
                    setIsAuthorized(true);
                }
            } else if (
                currentAccount &&
                (currentAccount.idTokenClaims['_claim_names'] ||
                    (currentAccount.idTokenClaims['_claim_sources'] && !isOveraged))
            ) {
                setIsOveraged(true);
            }
        }
    };

    useEffect(() => {
        onLoad();

        // eslint-disable-next-line
    }, [instance]);

    useEffect(() => {
        const currentAccount = instance.getActiveAccount();
        if (!isOveraged) {
            return;
        }

        if (
            currentAccount &&
            (currentAccount.idTokenClaims['_claim_names'] ||
                (currentAccount.idTokenClaims['_claim_sources'] && !isOveraged))
        ) {
            window.alert(
                'You have too many group memberships. The application will now query Microsoft Graph to get the full list of groups that you are a member of.'
            );
        }
        // eslint-disable-next-line
    }, [isOveraged]);

    return (
        <MsalAuthenticationTemplate interactionType={InteractionType.Redirect} authenticationRequest={authRequest}>
            {isAuthorized ? (
                <div>{props.children}</div>
            ) : isOveraged ? (
                <Navigate replace to="/overage" state={location.pathname} />
            ) : (
                <div className="data-area-div">
                    <h3>You are unauthorized to view this content.</h3>
                </div>
            )}
        </MsalAuthenticationTemplate>
    );
};
