import { useEffect, useState  } from 'react';
import { useMsal, useAccount } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import {  protectedResources } from "../authConfig";
import { callApiWithToken } from '../fetch';
import { HelloData } from "../components/ProfileData";

const HelloContent = () => {

    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [helloData, setHelloData] = useState(null);

    useEffect(() => {
        if (account && inProgress === "none" && !helloData) {
            instance.acquireTokenSilent({
                scopes: protectedResources.apiAccess.scopes,
                account: account
            }).then((response) => {
                callApiWithToken(response.accessToken, protectedResources.apiAccess.endpoint)
                    .then(response => setHelloData(response))
            }).catch((error) => {
                if (error instanceof InteractionRequiredAuthError) {
                    if (account && inProgress === "none") {
                        instance.acquireTokenPopup({
                            scopes: protectedResources.apiAccess.scopes,
                             account: account
                        }).then((response) => {
                            callApiWithToken(response.accessToken, protectedResources.apiAccess.endpoint)
                                .then(response => setHelloData(response))
                        }).catch(error => console.log(error));
                    }
                }

            })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account, inProgress, instance])
    return (
        <>
            { helloData ? <HelloData  helloData={helloData} /> : null }
        </>
    )
}


export const Hello = () => {
    return (
        <>
            <HelloContent />
        </>
    )
}