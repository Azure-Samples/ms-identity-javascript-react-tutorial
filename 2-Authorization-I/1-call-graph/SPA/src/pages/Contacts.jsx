import { useEffect, useState } from 'react';
import { MsalAuthenticationTemplate } from '@azure/msal-react';
import { Container } from 'react-bootstrap';

import useTokenAcquisition from '../hooks/useTokenAcquisition';
import { protectedResources } from '../authConfig';
import { InteractionType } from '@azure/msal-browser';
import { loginRequest } from '../authConfig';
import { GraphContacts } from '../components/DataDisplay';
import { callApiWithToken } from '../fetch';

const ContactsContent = () => {
    const [response] = useTokenAcquisition(protectedResources.graphContacts.scopes, InteractionType.Redirect);

    const [graphContacts, setGraphContacts] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (response && !graphContacts) {
                try {
                    let contacts = await callApiWithToken(
                        response.accessToken,
                        protectedResources.graphContacts.endpoint,
                        protectedResources.graphContacts.scopes
                    );

                    if (contacts && contacts.error) throw new Error(contacts.error);

                    setGraphContacts(contacts);
                } catch (error) {
                    setError(error);
                }
            }
        };
        fetchData();
    }, [response]);
    return (
        <>
            {' '}
            {graphContacts || error ? (
                <GraphContacts response={response} error={error} graphContacts={graphContacts} />
            ) : null}{' '}
        </>
    );
};

export const Contacts = () => {
    const authRequest = {
        ...loginRequest,
    };

    return (
        <MsalAuthenticationTemplate
            interactionType={InteractionType.Redirect}
            authenticationRequest={authRequest}
        >
            <Container>
                <ContactsContent />
            </Container>
        </MsalAuthenticationTemplate>
    );
};
