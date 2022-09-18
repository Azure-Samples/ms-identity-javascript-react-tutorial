import { useEffect, useState } from 'react';
import { loginRequest } from '../authConfig';
import { MsalAuthenticationTemplate, useMsal } from '@azure/msal-react';
import { InteractionType, InteractionStatus } from '@azure/msal-browser';
import { getGroups, getNextPage } from '../fetch';
import { GraphQuery } from '../components/GraphQuery';

const OverageContent = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance,
     * an array of all accounts currently signed in and an inProgress value
     * that tells you what msal is currently doing. For more, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */

    const { inProgress } = useMsal();
    const [groupsData, setGroupsData] = useState([]);

    const handleNextPage = (nextPage) => {
        getNextPage(nextPage).then((response) => {
            response.value.forEach((v) => {
                if (!groupsData.includes(v.id)) {
                    setGroupsData((gr) => [...gr, v.id]);
                }
            });

            if (response['@odata.nextLink']) {
                handleNextPage(response['@odata.nextLink']);
            }
        });
    };

    useEffect(() => {
        if (groupsData.length > 0) {
            return;
        }
        if (groupsData.length === 0 && inProgress === InteractionStatus.None) {
            getGroups().then((response) => {
                if (response) {
                    response.value.forEach((v) => {
                        if (!groupsData.includes(v.id)) {
                            setGroupsData((gr) => [...gr, v.id]);
                        }
                    });

                    /**
                     * Some queries against Microsoft Graph return multiple pages of data either due to server-side paging
                     * or due to the use of the $top query parameter to specifically limit the page size in a request.
                     * When a result set spans multiple pages, Microsoft Graph returns an @odata.nextLink property in
                     * the response that contains a URL to the next page of results. Learn more at https://docs.microsoft.com/graph/paging
                     */
                    if (response['@odata.nextLink']) {
                        handleNextPage(response['@odata.nextLink']);
                    }
                }
            });
        }
        // eslint-disable-next-line
    }, [inProgress, groupsData]);

    return <>{groupsData ? <GraphQuery groupsData={groupsData} /> : null} </>;
};

export const Overage = () => {
    const authRequest = {
        ...loginRequest,
    };
    return (
        <MsalAuthenticationTemplate interactionType={InteractionType.Redirect} authenticationRequest={authRequest}>
            <OverageContent />
        </MsalAuthenticationTemplate>
    );
};
