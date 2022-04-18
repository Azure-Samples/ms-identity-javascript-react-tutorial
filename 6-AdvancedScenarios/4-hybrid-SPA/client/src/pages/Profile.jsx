import  { useEffect, useState  } from 'react';
import {useMsal, useAccount } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";


import { protectedResources } from "../authConfig";
import { callApiWithToken } from "../fetch";
import { ProfileData } from "../components/ProfileData";

 const ProfileContent = () => {
    const { instance, accounts, inProgress } = useMsal();
    const account = useAccount(accounts[0] || {});
    const [graphData, setGraphData] = useState(null);

    useEffect(() => {
       
      if (account && inProgress === "none" && !graphData) {
         instance.acquireTokenSilent({
                scopes: protectedResources.graphMe.scopes,
                account: account
          }).then((response) => {
            callApiWithToken(response.accessToken, protectedResources.graphMe.endpoint)
              .then(response => setGraphData(response))
          }).catch((error) => {
               if (error instanceof InteractionRequiredAuthError) {
                 if (account && inProgress === "none") {
                    instance.acquireTokenPopup({
                            scopes: protectedResources.graphMe.scopes,
                            account: account
                        }).then((response) => {
                            callApiWithToken(response.accessToken, protectedResources.graphMe.endpoint)
                                .then(response => setGraphData(response));
                        }).catch(error => console.log(error));
                 }
               }
          })
      }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account, inProgress, instance]);
   return (
     <>
        { graphData ? <ProfileData graphData={graphData} /> : null }
     </>
   )
 }
    



export const Profile = () => {

  return(
    <>
      <ProfileContent />
    </>
  )
}

