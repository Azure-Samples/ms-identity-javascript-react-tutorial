import { useEffect, useState } from 'react';

import { useMsal, useMsalAuthentication } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';

import { GraphQuery } from '../components/GraphQuery';
import { getFilteredGroups } from '../graphClient';
import { setGroupsInStorage } from '../utils/storageUtils';

import { protectedResources, groups } from '../authConfig';

export const Overage = () => {
    /**
     * useMsal is a hook that returns the PublicClientApplication instance,
     * an array of all accounts currently signed in and an inProgress value
     * that tells you what msal is currently doing. For more, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */
    const { instance } = useMsal();
    const { login, result, error } = useMsalAuthentication(InteractionType.Popup, {
        scopes: protectedResources.apiGraph.scopes,
        account: instance.getActiveAccount(),
    });

    const [groupsData, setGroupsData] = useState([]);

    const fetchGroups = async (accessToken) => {
        const requiredGroupsByApplication = await getFilteredGroups(accessToken, Object.values(groups));
        setGroupsData(requiredGroupsByApplication);

        // store the groups in session storage for this user
        const activeAccount = instance.getActiveAccount();    
        setGroupsInStorage(activeAccount, requiredGroupsByApplication);
    }

    useEffect(() => {
        if (groupsData.length > 0) {
            return;
        }

        if (!!error) {
            // in case popup is blocked, use redirect instead
            if (error.errorCode === 'popup_window_error' || error.errorCode === 'empty_window_error') {
                login(InteractionType.Redirect, {
                    scopes: protectedResources.apiGraph.scopes,
                    account: instance.getActiveAccount(),
                });
            }

            console.log(error);
            return;
        }

        if (result) {
            fetchGroups(result.accessToken);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instance, result, error, login, groupsData]);

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return <>{groupsData ? <GraphQuery groupsData={groupsData} /> : null} </>;
};
