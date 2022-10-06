import { useEffect, useState } from 'react';

import { useMsal, useMsalAuthentication } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { PageIterator } from '@microsoft/microsoft-graph-client';

import { GraphQuery } from '../components/GraphQuery';
import { protectedResources } from '../authConfig';
import { getGraphClient } from '../graphClient';

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

    const getGroups = async (accessToken) => {
        const groups = [];

        // Get a graph client instance for the given access token
        const graphClient = getGraphClient(accessToken);

        // Makes request to fetch mails list. Which is expected to have multiple pages of data.
        let response = await graphClient.api(protectedResources.apiGraph.endpoint).get();
        
        // A callback function to be called for every item in the collection. This call back should return boolean indicating whether not to continue the iteration process.
        let callback = (data) => {
            groups.push(data.id);
            return true;
        };
        
        // Creating a new page iterator instance with client a graph client instance, page collection response from request and callback
        let pageIterator = new PageIterator(graphClient, response, callback);
        
        // This iterates the collection until the nextLink is drained out.
        await pageIterator.iterate();

        setGroupsData(groups);
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
            getGroups(result.accessToken);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupsData, result, error]);

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return <>{groupsData ? <GraphQuery groupsData={groupsData} /> : null} </>;
};
