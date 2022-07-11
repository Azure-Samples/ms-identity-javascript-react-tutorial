import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';

export const RouteGuard = ({ ...props }) => {
    const { instance } = useMsal();
    const [isAuthorized, setIsAuthorized] = useState(false);

    const onLoad = async () => {
        const currentAccount = instance.getActiveAccount();

        if (currentAccount && currentAccount.idTokenClaims['roles']) {
            let intersection = props.roles.filter((role) => currentAccount.idTokenClaims['roles'].includes(role));

            if (intersection.length > 0) {
                setIsAuthorized(true);
            }
        }
    };

    useEffect(() => {
        onLoad();
    }, [instance]);
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
