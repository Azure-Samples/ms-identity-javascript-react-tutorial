import React, { useState, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

export const RouteGuard = ({ Component, ...props }) => {

    const { instance } = useMsal();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isOveraged, setIsOveraged] = useState(false);

    const onLoad = async () => {
        if (props.location.state) {
            let intersection = props.groups
                .filter(group => props.location.state.groupsData.includes(group));

            if (intersection.length > 0) {
                setIsAuthorized(true);
            }
        } else {
            const currentAccount = instance.getActiveAccount();

            if (currentAccount && currentAccount.idTokenClaims['groups']) {
                let intersection = props.groups
                    .filter(group => currentAccount.idTokenClaims['groups'].includes(group));

                if (intersection.length > 0) {
                    setIsAuthorized(true);
                }
            } else if (currentAccount && (currentAccount.idTokenClaims['_claim_names'] || currentAccount.idTokenClaims['_claim_sources'])) {
                window.alert('You have too many group memberships. The application will now query Microsoft Graph to get the full list of groups that you are a member of.');
                setIsOveraged(true);
            }
        }

    }

    useEffect(() => {
        onLoad();
    }, [instance]);

    return (
        <>
            {
                isAuthorized
                    ?
                    <Route {...props} render={routeProps => <Component {...routeProps} />} />
                    :
                    isOveraged
                        ?
                        <Redirect
                            to={{
                                pathname: "/overage",
                                state: { origin: props.location.pathname }
                            }}
                        />
                        :
                        <div className="data-area-div">
                            <h3>You are unauthorized to view this content.</h3>
                        </div>
            }
        </>
    );
};