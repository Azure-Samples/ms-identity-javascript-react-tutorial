import React, { useState, useEffect } from "react";
import { Route } from "react-router-dom";
import { useMsal } from "@azure/msal-react";

export const RouteGuard = ({ Component, ...props }) => {

    const { instance } = useMsal();
    const [isAuthorized, setIsAuthorized] = useState(false);

    const onLoad = async () => {
        const currentAccount = instance.getActiveAccount();

        if (currentAccount && currentAccount.idTokenClaims['roles']) {
            let intersection = props.roles
                .filter(role => currentAccount.idTokenClaims['roles'].includes(role));

            if (intersection.length > 0) {
                setIsAuthorized(true);
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
                    <div className="data-area-div">
                        <h3>You are unauthorized to view this content.</h3>
                    </div>
            }
        </>
    );
};