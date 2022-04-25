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
        let token
        let apiData
        const fetchData = async () => {
            if (account && inProgress === "none" && !helloData) {
                try {

                    token = await instance.acquireTokenSilent({
                        scopes: protectedResources.apiAccess.scopes,
                        account: account
                    });

                    apiData  = await callApiWithToken(token.accessToken,  protectedResources.apiAccess.endpoint);
                    setHelloData(apiData);

                }catch(error){
                
                    if (error instanceof InteractionRequiredAuthError) {
                        if (account && inProgress === "none") {
                            try{

                                token = await instance.acquireTokenSilent({
                                    scopes: protectedResources.apiAccess.scopes,
                                    account: account
                                });

                                apiData  = await callApiWithToken(token.accessToken,  protectedResources.apiAccess.endpoint);
                                setHelloData(apiData);

                            }catch(error){
                                console.log(error)
                            }
                            
                        }
                    }
                }
            }
        }

        fetchData();
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