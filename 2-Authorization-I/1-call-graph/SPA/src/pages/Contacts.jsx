import { useEffect, useState } from 'react';

import useTokenAcquisition from '../hooks/useTokenAcquisition';
import { protectedResources } from '../authConfig';
import { InteractionType } from '@azure/msal-browser';
import { MsalAuthenticationTemplate } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import { GraphContacts } from '../components/DataDisplay';
import { callApiWithToken, getImageForContact } from '../fetch';
import { Container } from 'react-bootstrap';

const ContactsContent = () => {
    const [response, error] = useTokenAcquisition(protectedResources.graphContacts.scopes, InteractionType.Redirect);
    const [graphContacts, setGraphContacts] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            if (response && !graphContacts) {
                try {
                    let contacts = await callApiWithToken(
                        response.accessToken,
                        protectedResources.graphContacts.endpoint,
                        protectedResources.graphContacts.scopes
                    );

                    if (contacts && contacts.error) throw contacts.error;
                    if (contacts) {
                        await getImageForContact(contacts, response.accessToken);
                        setGraphContacts(contacts);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        };

        fetchData();
    }, [response]);
    return <> {graphContacts ? 
    <GraphContacts response={response} graphContacts={graphContacts.value} /> : null} </>;
};


export const Contacts = () => {
     const authRequest = {
        ...loginRequest,
    };

    return (
        <MsalAuthenticationTemplate interactionType={InteractionType.Redirect} authenticationRequest={authRequest}>
            <Container>
                <ContactsContent />
            </Container>
        </MsalAuthenticationTemplate>
    );
}
