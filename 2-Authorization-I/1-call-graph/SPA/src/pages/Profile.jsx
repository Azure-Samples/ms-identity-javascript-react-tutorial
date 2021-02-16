import { useEffect, useState } from "react";

import { MsalAuthenticationTemplate, useMsal, useAccount } from "@azure/msal-react";
import { InteractionRequiredAuthError, InteractionType } from "@azure/msal-browser";

import { loginRequest, protectedResources } from "../authConfig";
import { callApiWithToken } from "../fetch";
import { ProfileData } from "../components/DataDisplay";

const ProfileContent = () => {
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [graphData, setGraphData] = useState(null);

    useEffect(() => {
        if (account && inProgress === "none") {
            instance.acquireTokenSilent({
                scopes: protectedResources.graphMe.scopes,
                account: account
            }).then((response) => {
                callApiWithToken(response.accessToken, protectedResources.graphMe.endpoint)
                    .then(response => setGraphData(response));
            }).catch((error) => {
                if (error instanceof InteractionRequiredAuthError) {
                    if (account && inProgress === "none") {
                        instance.acquireTokenPopup({
                            scopes: protectedResources.graphMe.scopes,
                        }).then((response) => {
                            callApiWithToken(response.accessToken, protectedResources.graphMe.endpoint)
                                .then(response => setMailsData(response));
                        }).catch(error => console.log(error));
                    }
                }
            });
        }
    }, [account, inProgress, instance]);
  
    return (
        <>
            { graphData ? <ProfileData graphData={graphData} /> : null }
        </>
    );
};

export const Profile = () => {
    const authRequest = {
        ...loginRequest
    };

    return (
        <MsalAuthenticationTemplate 
            interactionType={InteractionType.Popup} 
            authenticationRequest={authRequest}
        >
            <ProfileContent />
        </MsalAuthenticationTemplate>
      )
};