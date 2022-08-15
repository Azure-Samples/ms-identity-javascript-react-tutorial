import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';

export const RouteGuard = ({ ...props }) => {
    const { instance } = useMsal();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const currentAccount = instance.getActiveAccount();

    const onLoad = async () => {

        if (currentAccount && currentAccount.idTokenClaims['roles']) {
            let intersection = props.roles.filter((role) => currentAccount.idTokenClaims['roles'].includes(role));
            if (intersection.length > 0) {
                setIsAuthorized(true);
            }else{
                setIsAuthorized(false);
            }
        }
    };

    useEffect(() => {
        onLoad();
    }, [instance, currentAccount]);

    return (
        <>
            {isAuthorized ? (
                <div>{props.children}</div>
            ) : (
                <div className="data-area-div">
                    <h3>You are unauthorized to view this content.</h3>
                </div>
            )}
        </>
    );
};
