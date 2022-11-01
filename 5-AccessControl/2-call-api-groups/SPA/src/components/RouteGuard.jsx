import { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';

import { useMsal, MsalAuthenticationTemplate } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';

import {  checkGroupsInStorage, getGroupsFromStorage } from '../utils/storageUtils';

import { loginRequest } from '../authConfig';

export const RouteGuard = ({ Component, ...props }) => {
    const location = useLocation();

    const { instance } = useMsal();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isOveraged, setIsOveraged] = useState(false);
    const [message, setMessage] = useState(null);

    const onLoad = async () => {
        const activeAccount = instance.getActiveAccount() || instance.getAllAccounts()[0];

        // check either the ID token or a non-expired storage entry for the groups membership claim
        if (!activeAccount?.idTokenClaims?.groups && !checkGroupsInStorage(activeAccount)) {

            if (activeAccount.idTokenClaims.hasOwnProperty('_claim_names') && activeAccount.idTokenClaims['_claim_names'].hasOwnProperty('groups')) {
                setIsOveraged(true);
                setMessage('You have too many group memberships. The application will now query Microsoft Graph to check if you are a member of any of the groups required.');
                return;
            }

            setMessage('Token does not have groups claim. Please ensure that your account is assigned to a security group and then sign-out and sign-in again.');
            return;
        }

        const hasRequiredGroup = props.requiredGroups.some((group) =>
            activeAccount?.idTokenClaims?.groups?.includes(group) || getGroupsFromStorage(activeAccount)?.includes(group)
        );

        if (!hasRequiredGroup) setMessage('You do not have access. Please ensure that your account is assigned to the required security group and then sign-out and sign-in again.')
        setIsAuthorized(hasRequiredGroup);
    };

    useEffect(() => {
        onLoad();

        // eslint-disable-next-line
    }, [instance]);

    useEffect(() => {
        if (message) window.alert(message);
    }, [message]);

    const authRequest = {
        ...loginRequest,
    };

    return (
        <MsalAuthenticationTemplate 
            interactionType={InteractionType.Redirect} 
            authenticationRequest={authRequest}
        >
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
