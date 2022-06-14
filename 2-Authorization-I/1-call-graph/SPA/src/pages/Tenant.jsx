import { useState } from 'react';
import styles from '../styles/Tenant.module.css';
import { MsalAuthenticationTemplate, useMsal } from '@azure/msal-react';
import { InteractionType, InteractionRequiredAuthError } from '@azure/msal-browser';
import { loginRequest, protectedResources } from '../authConfig';
import { callApiWithToken } from '../fetch';
import { TenantData } from '../components/DataDisplay';
import { Button, Container, Row, Col } from 'react-bootstrap';

const TenantContent = () => {
    /**
     * useMsal is hook that returns the PublicClientApplication instance,
     * an array of all accounts currently signed in and an inProgress value
     * that tells you what msal is currently doing. For more, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/hooks.md
     */
    const { instance, inProgress } = useMsal();
    const account = instance.getActiveAccount();
    const [tenantData, setTenantData] = useState(null);

    const requestTenantData = async () => {
        let responseData;
        if (inProgress === 'none') {
            try {
                responseData = await instance.acquireTokenSilent({
                    scopes: protectedResources.armTenants.scopes, // arms scopes
                    account: account, //current active account
                });

                callApiWithToken(responseData.accessToken, protectedResources.armTenants.endpoint).then((response) =>
                    setTenantData(response)
                );
            } catch (error) {
                if (error instanceof InteractionRequiredAuthError) {
                    try {
                        responseData = await instance.acquireTokenPopup({
                            scopes: protectedResources.armTenants.scopes,
                            account: account,
                        });

                        callApiWithToken(responseData.accessToken, protectedResources.armTenants.endpoint).then(
                            (response) => setTenantData(response)
                        );
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }
    };

    return (
        <Container>
            {tenantData ? (
                <Row>
                    <TenantData tenantData={tenantData} />
                </Row>
            ) : (
                <Row className="justify-content-md-center">
                    <Col lg={2}>
                        <Button className={styles.tenantButton} variant="secondary" onClick={requestTenantData}>
                            Request Tenant Data
                        </Button>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

/**
 * The `MsalAuthenticationTemplate` component will render its children if a user is authenticated
 * or attempt to sign a user in. Just provide it with the interaction type you would like to use
 * (redirect or popup) and optionally a [request object](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md)
 * to be passed to the login API, a component to display while authentication is in progress or a component to display if an error occurs. For more, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
export const Tenant = () => {
    const authRequest = {
        ...loginRequest,
    };

    return (
        <MsalAuthenticationTemplate interactionType={InteractionType.Redirect} authenticationRequest={authRequest}>
            <TenantContent />
        </MsalAuthenticationTemplate>
    );
};
