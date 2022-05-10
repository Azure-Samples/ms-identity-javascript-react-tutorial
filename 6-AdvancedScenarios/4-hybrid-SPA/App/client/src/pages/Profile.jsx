import { useEffect, useState } from "react";
import { useMsal, useAccount } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";

import { protectedResources } from "../authConfig";
import { callApiWithToken } from "../fetch";
import { ProfileData } from "../components/ProfileData";

const ProfileContent = () => {
  const { instance, accounts, inProgress } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let token;
      let graphInfo;
      if (account && inProgress === "none" && !graphData) {
        try {
          token = await instance.acquireTokenSilent({
            scopes: protectedResources.graphMe.scopes,
            account: account,
          });

          graphInfo = await callApiWithToken(
            token.accessToken,
            protectedResources.graphMe.endpoint
          );
          setGraphData(graphInfo);
        } catch (error) {
          if (error instanceof InteractionRequiredAuthError) {
            try {
              token = await instance.acquireTokenPopup({
                scopes: protectedResources.graphMe.scopes,
                account: account,
              });

              graphInfo = await callApiWithToken(
                token.accessToken,
                protectedResources.graphMe.endpoint
              );
              setGraphData(graphInfo);
            } catch (error) {
              console.log(error);
            }
          }
        }
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, inProgress, instance]);
  return <>{graphData ? <ProfileData graphData={graphData} /> : null}</>;
};

export const Profile = () => {
  return (
    <>
      <ProfileContent />
    </>
  );
};
