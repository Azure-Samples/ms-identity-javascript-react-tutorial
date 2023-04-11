import { useEffect, useState } from 'react';
import { getSubscriptionClient } from '../azureManagement';
import { TenantData } from '../components/DataDisplay';
import { useMsal, useMsalAuthentication } from '@azure/msal-react';
import { InteractionType } from '@azure/msal-browser';
import { protectedResources } from '../authConfig';

export const Tenant = () => {
    const { instance } = useMsal();
    const [tenantInfo, setTenantInfo] = useState(null);
    const account = instance.getActiveAccount();
    const request = {
        scopes: protectedResources.armTenants.scopes,
        account: account,
    };

    const { login, result, error } = useMsalAuthentication(InteractionType.Popup, {
        ...request,
        redirectUri: '/redirect',
    });

    const fetchData = async (accessToken) => {
        const client = await getSubscriptionClient(accessToken);
        const resArray = [];
        for await (let item of client.tenants.list()) {
            resArray.push(item);
        }
        setTenantInfo(resArray);
    };

    useEffect(() => {
        if (!!tenantInfo) {
            return;
        }

        if (!!error) {
            // in case popup is blocked, use redirect instead
            if (error.errorCode === 'popup_window_error' || error.errorCode === 'empty_window_error') {
                login(InteractionType.Redirect, request);
            }

            console.log(error);
            return;
        }

        if (result) {
            fetchData(result.accessToken).catch((error) => {
                console.log(error);
            });
        }
        // eslint-disable-next-line
    }, [tenantInfo, result, error, login]);

    if (error) {
        return <div>Error: {error.message}</div>;
    }
    return <>{tenantInfo ? <TenantData response={result} tenantInfo={tenantInfo} /> : null}</>;
};
