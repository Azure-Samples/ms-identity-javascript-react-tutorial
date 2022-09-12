import { AuthenticatedTemplate } from '@azure/msal-react';
import { useMsal } from '@azure/msal-react';
import { Container } from 'react-bootstrap';

import { IdTokenData } from '../components/DataDisplay';

export const Home = () => {
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    return (
        <>
            <AuthenticatedTemplate>
                {activeAccount ? (
                    <Container>
                        <IdTokenData idTokenClaims={activeAccount.idTokenClaims} />
                    </Container>
                ) : null}
            </AuthenticatedTemplate>
        </>
    );
};
